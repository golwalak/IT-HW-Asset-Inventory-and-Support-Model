"""
VibeAThon POC - IT Hardware Asset Inventory and Support Model
Data loader utility for parsing and processing inventory CSV files.
"""

import pandas as pd
from datetime import datetime
import os


# Mock OEM annual cost mapping by model
OEM_COST_MAP = {
    "NX-8170-G9": 45000,
    "NX-8170-G8": 38000,
    "NX-3460-G7": 28000,
    "Nexus 9508": 22000,
    "Nexus 9504": 22000,
    "Nexus 9500": 22000,
    "Nexus 9300": 8000,
    "Nexus 93180YC-FX": 8000,
    "Nexus 5672UP": 6500,
    "Power System E950": 35000,
    "Power System E880": 35000,
    "Power System E980": 35000,
    "AFF A400": 25000,
    "PA-5250": 18000,
    "PA-5260": 18000,
}

DEFAULT_OEM_COST = 5000


def get_oem_cost(model: str) -> int:
    """Return the mock annual OEM support cost for a given model string."""
    if not model or not isinstance(model, str):
        return DEFAULT_OEM_COST
    for key, cost in OEM_COST_MAP.items():
        if key.lower() in model.lower():
            return cost
    return DEFAULT_OEM_COST


def load_inventory(filepath: str | None = None) -> pd.DataFrame:
    """
    Load and parse the inventory CSV file.
    Returns a cleaned DataFrame with derived columns added.
    Falls back to the bundled sample_inventory.csv if no filepath is given.
    """
    if filepath is None:
        filepath = os.path.join(
            os.path.dirname(__file__), "..", "data", "sample_inventory.csv"
        )
    filepath = os.path.abspath(filepath)

    df = pd.read_csv(filepath, dtype=str)
    df.columns = df.columns.str.strip()

    # Normalise key column names to consistent internal names
    df = _normalise_columns(df)

    # Parse date columns
    for col in ["warranty_start", "warranty_end", "operational_date", "creation_date"]:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")

    # Numeric columns
    for col in ["age_mo", "oem_cost"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Fill missing OEM cost from model lookup
    if "oem_cost" in df.columns:
        mask = df["oem_cost"].isna() | (df["oem_cost"] == 0)
        model_col = "model" if "model" in df.columns else None
        if model_col and mask.any():
            df["oem_cost"] = df["oem_cost"].astype(float)
            df.loc[mask, "oem_cost"] = df.loc[mask, model_col].apply(get_oem_cost).astype(float)
    else:
        model_col = "model" if "model" in df.columns else None
        if model_col:
            df["oem_cost"] = df[model_col].apply(get_oem_cost)
        else:
            df["oem_cost"] = DEFAULT_OEM_COST

    # Derived: warranty status
    today = datetime.today()
    soon_threshold_days = 180  # 6 months

    def _warranty_status(row):
        end = row.get("warranty_end")
        if pd.isna(end):
            return "Unknown"
        if end < pd.Timestamp(today):
            return "Expired"
        if end <= pd.Timestamp(today) + pd.Timedelta(days=soon_threshold_days):
            return "Expiring Soon"
        return "Active"

    df["warranty_status"] = df.apply(_warranty_status, axis=1)

    return df


def _normalise_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Map raw CSV column headers to normalised internal names."""
    rename_map = {
        "Asset Name": "asset_name",
        "Asset Number": "asset_number",
        "Serial Number": "serial_number",
        "Material Name": "material_name",
        "Type": "type",
        "Manufacturer": "manufacturer",
        "Model": "model",
        "Material Subtype/Category": "category",
        "ETS Std HW Category": "hw_category",
        "Record Status": "record_status",
        "Cabinet Name/U Number": "cabinet",
        "Location": "location",
        "Creation Date": "creation_date",
        "Operational Date": "operational_date",
        "Decommission Date": "decommission_date",
        "In TCS Scope": "tcs_scope",
        "Support Group Name": "support_group",
        "Warranty Start Date": "warranty_start",
        "Warranty End Date": "warranty_end",
        "age (mo)": "age_mo",
        "application (mock)": "application",
        "Owner (mock)": "owner",
        "status (prod or nonprod) (mock)": "status",
        "7x24 OEM $ / 365 days (mock)": "oem_cost",
        "7x24 Tier1 (yes/no?)": "tier1_eligible",
        "NBD Tier 2 7% save (yes/no)": "tier2_eligible",
        "None Tier 3 100% save (yes/on)": "tier3_eligible",
        "7x24 3rd Party Tier 4 80% save (yes/no)": "tier4_eligible",
        "cost avoidance ($) if not Tier 1": "cost_avoidance_raw",
    }
    return df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})


def get_filter_options(df: pd.DataFrame) -> dict:
    """Return unique values for each filterable column."""
    options = {}
    for col in ["owner", "application", "location", "type", "status", "support_group", "manufacturer"]:
        if col in df.columns:
            options[col] = sorted(df[col].dropna().unique().tolist())
    return options


def apply_filters(df: pd.DataFrame, filters: dict) -> pd.DataFrame:
    """Apply user-supplied filters to the DataFrame."""
    for col, value in filters.items():
        if value and col in df.columns:
            df = df[df[col].str.lower() == value.lower()]
    return df


def df_to_records(df: pd.DataFrame) -> list[dict]:
    """Convert DataFrame to a JSON-serialisable list of dicts."""
    out = df.copy()
    # Serialise timestamps
    for col in out.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns:
        out[col] = out[col].dt.strftime("%Y-%m-%d").where(out[col].notna(), None)
    return out.where(pd.notna(out), None).to_dict(orient="records")
