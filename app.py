"""
VibeAThon POC - IT Hardware Asset Inventory and Support Model
Flask application entry point.
"""

import os
import io
import json

import pandas as pd
from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    jsonify,
    Response,
)

from utils.data_loader import load_inventory, get_filter_options, apply_filters, df_to_records
from utils.support_model import apply_support_model, summarise_by_tier, summarise_totals

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "vibeathon-poc-secret")


def tier_badge(tier) -> str:
    """Return a Bootstrap badge class string for a given tier number."""
    return {
        1: "bg-primary",
        2: "bg-info text-dark",
        3: "bg-success",
        4: "bg-warning text-dark",
    }.get(int(tier) if tier is not None else 0, "bg-secondary")


app.jinja_env.globals["tier_badge"] = tier_badge

# In-memory store for the currently loaded DataFrame (single-user POC)
_current_df: pd.DataFrame | None = None

SAMPLE_CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "sample_inventory.csv")


def _get_df() -> pd.DataFrame:
    """Return the currently loaded DataFrame, falling back to sample data."""
    global _current_df
    if _current_df is None:
        _current_df = load_inventory(SAMPLE_CSV_PATH)
        _current_df = apply_support_model(_current_df)
    return _current_df


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    """Dashboard / summary view."""
    df = _get_df()

    # Summary counts
    total_assets = len(df)
    by_type = df["type"].value_counts().to_dict() if "type" in df.columns else {}
    by_location = df["location"].value_counts().to_dict() if "location" in df.columns else {}
    by_support_group = df["support_group"].value_counts().to_dict() if "support_group" in df.columns else {}

    warranty_summary = {}
    if "warranty_status" in df.columns:
        warranty_summary = df["warranty_status"].value_counts().to_dict()

    tier_summary = summarise_by_tier(df)
    totals = summarise_totals(df)

    # Age distribution buckets (0-24, 25-48, 49-72, 73-96, 97+)
    age_buckets = {"0-24 mo": 0, "25-48 mo": 0, "49-72 mo": 0, "73-96 mo": 0, "97+ mo": 0}
    if "age_mo" in df.columns:
        for age in df["age_mo"].dropna():
            if age <= 24:
                age_buckets["0-24 mo"] += 1
            elif age <= 48:
                age_buckets["25-48 mo"] += 1
            elif age <= 72:
                age_buckets["49-72 mo"] += 1
            elif age <= 96:
                age_buckets["73-96 mo"] += 1
            else:
                age_buckets["97+ mo"] += 1

    return render_template(
        "index.html",
        total_assets=total_assets,
        by_type=by_type,
        by_location=by_location,
        by_support_group=by_support_group,
        warranty_summary=warranty_summary,
        tier_summary=tier_summary,
        totals=totals,
        age_buckets=age_buckets,
        by_type_json=json.dumps(by_type),
        by_location_json=json.dumps(by_location),
        warranty_json=json.dumps(warranty_summary),
        age_buckets_json=json.dumps(age_buckets),
        tier_counts_json=json.dumps({t["label"]: t["count"] for t in tier_summary}),
    )


@app.route("/inventory")
def inventory():
    """Full inventory table view with filtering."""
    df = _get_df()
    filter_options = get_filter_options(df)

    # Build active filters from query params
    filter_keys = ["owner", "application", "location", "type", "status", "support_group"]
    active_filters = {k: request.args.get(k, "") for k in filter_keys}
    active_filters_clean = {k: v for k, v in active_filters.items() if v}

    filtered = apply_filters(df.copy(), active_filters_clean)
    records = df_to_records(filtered)

    return render_template(
        "inventory.html",
        records=records,
        filter_options=filter_options,
        active_filters=active_filters,
        total_count=len(records),
    )


@app.route("/analysis")
def analysis():
    """Support model analysis view."""
    df = _get_df()
    filter_options = get_filter_options(df)

    filter_keys = ["owner", "application", "location", "type", "status", "support_group"]
    active_filters = {k: request.args.get(k, "") for k in filter_keys}
    active_filters_clean = {k: v for k, v in active_filters.items() if v}

    filtered = apply_filters(df.copy(), active_filters_clean)
    records = df_to_records(filtered)
    tier_summary = summarise_by_tier(filtered)
    totals = summarise_totals(filtered)

    tier_avoidance_json = json.dumps(
        {t["label"]: t["total_cost_avoidance"] for t in tier_summary}
    )

    return render_template(
        "analysis.html",
        records=records,
        tier_summary=tier_summary,
        totals=totals,
        filter_options=filter_options,
        active_filters=active_filters,
        tier_avoidance_json=tier_avoidance_json,
    )


@app.route("/upload", methods=["GET", "POST"])
def upload():
    """CSV upload handler."""
    global _current_df

    if request.method == "POST":
        if "csv_file" not in request.files:
            flash("No file part in the request.", "danger")
            return redirect(request.url)

        file = request.files["csv_file"]
        if file.filename == "":
            flash("No file selected.", "danger")
            return redirect(request.url)

        if not file.filename.lower().endswith(".csv"):
            flash("Only CSV files are supported.", "danger")
            return redirect(request.url)

        try:
            content = file.read().decode("utf-8")
            df = load_inventory.__wrapped__(io.StringIO(content)) if hasattr(load_inventory, "__wrapped__") else _load_from_stream(content)
            _current_df = apply_support_model(df)
            flash(f"Successfully loaded {len(_current_df)} assets.", "success")
            return redirect(url_for("index"))
        except Exception as exc:
            flash(f"Error parsing CSV: {exc}", "danger")
            return redirect(request.url)

    return render_template("upload.html")


def _load_from_stream(content: str) -> pd.DataFrame:
    """Helper to load a CSV from a string buffer (used by the upload route)."""
    from utils.data_loader import _normalise_columns, get_oem_cost, DEFAULT_OEM_COST
    from datetime import datetime

    df = pd.read_csv(io.StringIO(content), dtype=str)
    df.columns = df.columns.str.strip()
    df = _normalise_columns(df)

    for col in ["warranty_start", "warranty_end", "operational_date", "creation_date"]:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")

    for col in ["age_mo", "oem_cost"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "oem_cost" in df.columns:
        mask = df["oem_cost"].isna() | (df["oem_cost"] == 0)
        if "model" in df.columns:
            df.loc[mask, "oem_cost"] = df.loc[mask, "model"].apply(get_oem_cost)
    else:
        df["oem_cost"] = df["model"].apply(get_oem_cost) if "model" in df.columns else DEFAULT_OEM_COST

    today = datetime.today()
    soon_days = 180

    def _ws(row):
        end = row.get("warranty_end")
        if pd.isna(end):
            return "Unknown"
        if end < pd.Timestamp(today):
            return "Expired"
        if end <= pd.Timestamp(today) + pd.Timedelta(days=soon_days):
            return "Expiring Soon"
        return "Active"

    df["warranty_status"] = df.apply(_ws, axis=1)
    return df


@app.route("/export")
def export():
    """Export the currently filtered dataset as a CSV download."""
    df = _get_df()

    filter_keys = ["owner", "application", "location", "type", "status", "support_group"]
    active_filters = {k: request.args.get(k, "") for k in filter_keys}
    active_filters_clean = {k: v for k, v in active_filters.items() if v}

    filtered = apply_filters(df.copy(), active_filters_clean)

    # Serialise date columns for CSV
    for col in filtered.select_dtypes(include=["datetime64[ns]"]).columns:
        filtered[col] = filtered[col].dt.strftime("%Y-%m-%d")

    csv_content = filtered.to_csv(index=False)
    return Response(
        csv_content,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=asset_export.csv"},
    )


@app.route("/reset")
def reset():
    """Reset to the sample dataset."""
    global _current_df
    _current_df = None
    flash("Reset to sample dataset.", "info")
    return redirect(url_for("index"))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)
