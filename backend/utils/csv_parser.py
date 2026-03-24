import pandas as pd
import numpy as np
from datetime import datetime


def parse_csv(file_path_or_buffer):
    """Parse the IT asset inventory CSV and return a cleaned DataFrame."""
    df = pd.read_csv(file_path_or_buffer, dtype=str)

    # Strip whitespace from column names and values
    df.columns = [c.strip() for c in df.columns]
    df = df.map(lambda x: x.strip() if isinstance(x, str) else x)

    # Normalize column names for easier access
    col_map = {c: c for c in df.columns}

    # Parse date columns
    date_cols = ["Creation Date", "Operational Date", "Decommission Date",
                 "Warranty Start Date", "Warranty End Date"]
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")

    # Parse numeric columns
    num_cols = ["age (mo)", "7x24 OEM $ / 365 days (mock)",
                "cost avoidance ($) if not Tier 1"]
    for col in num_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Cabinet U Number
    if "Cabinet U Number" in df.columns:
        df["Cabinet U Number"] = pd.to_numeric(df["Cabinet U Number"], errors="coerce")

    return df


def df_to_records(df):
    """Convert DataFrame to a JSON-serializable list of dicts."""
    records = []
    for _, row in df.iterrows():
        record = {}
        for col, val in row.items():
            if pd.isna(val):
                record[col] = None
            elif isinstance(val, (pd.Timestamp, datetime)):
                record[col] = val.isoformat() if not pd.isnull(val) else None
            elif isinstance(val, (np.integer,)):
                record[col] = int(val)
            elif isinstance(val, (np.floating,)):
                record[col] = float(val)
            else:
                record[col] = val
        records.append(record)
    return records


def get_summary(df):
    """Return a high-level summary dict for the loaded dataset."""
    total = len(df)

    location_col = "Location"
    locations = sorted(df[location_col].dropna().unique().tolist()) if location_col in df.columns else []

    manufacturer_col = "Manufacturer"
    manufacturers = sorted(df[manufacturer_col].dropna().unique().tolist()) if manufacturer_col in df.columns else []

    status_col = "status (prod or nonprod) (mock)"
    statuses = sorted(df[status_col].dropna().unique().tolist()) if status_col in df.columns else []

    record_status_col = "Record Status"
    record_statuses = sorted(df[record_status_col].dropna().unique().tolist()) if record_status_col in df.columns else []

    type_col = "Type"
    types = sorted(df[type_col].dropna().unique().tolist()) if type_col in df.columns else []

    support_group_col = "Support Group Name"
    support_groups = sorted(df[support_group_col].dropna().unique().tolist()) if support_group_col in df.columns else []

    app_col = "application (mock)"
    applications = sorted(df[app_col].dropna().unique().tolist()) if app_col in df.columns else []

    owner_col = "Owner (mock)"
    owners = sorted(df[owner_col].dropna().unique().tolist()) if owner_col in df.columns else []

    return {
        "total_records": total,
        "columns": list(df.columns),
        "locations": locations,
        "manufacturers": manufacturers,
        "statuses": statuses,
        "record_statuses": record_statuses,
        "types": types,
        "support_groups": support_groups,
        "applications": applications,
        "owners": owners,
    }
