import io
from datetime import date
from flask import Blueprint, request, jsonify, Response
from utils import get_df
from utils.csv_parser import df_to_records, get_summary
from utils.tier_calculator import enrich_asset

assets_bp = Blueprint("assets", __name__)


def _get_enriched_records(df, today=None):
    if today is None:
        today = date.today()
    records = df_to_records(df)
    return [enrich_asset(r, today=today) for r in records]


def _apply_filters(records, args):
    location = args.get("location", "").strip()
    manufacturer = args.get("manufacturer", "").strip()
    asset_type = args.get("type", "").strip()
    status = args.get("status", "").strip()
    record_status = args.get("record_status", "").strip()
    support_group = args.get("support_group", "").strip()
    application = args.get("application", "").strip()
    owner = args.get("owner", "").strip()
    search = args.get("search", "").strip().lower()

    def matches(r):
        if location and str(r.get("Location") or "").lower() != location.lower():
            return False
        if manufacturer and str(r.get("Manufacturer") or "").lower() != manufacturer.lower():
            return False
        if asset_type and str(r.get("Type") or "").lower() != asset_type.lower():
            return False
        if status and str(r.get("status (prod or nonprod) (mock)") or "").lower() != status.lower():
            return False
        if record_status and str(r.get("Record Status") or "").lower() != record_status.lower():
            return False
        if support_group and str(r.get("Support Group Name") or "").lower() != support_group.lower():
            return False
        if application and str(r.get("application (mock)") or "").lower() != application.lower():
            return False
        if owner and str(r.get("Owner (mock)") or "").lower() != owner.lower():
            return False
        if search:
            searchable = " ".join(str(v) for v in r.values() if v).lower()
            if search not in searchable:
                return False
        return True

    return [r for r in records if matches(r)]


@assets_bp.route("/assets", methods=["GET"])
def list_assets():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded. Please upload a CSV first."}), 404

    records = _get_enriched_records(df)
    records = _apply_filters(records, request.args)

    # Pagination
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 50))
    except ValueError:
        page, per_page = 1, 50

    total = len(records)
    start = (page - 1) * per_page
    end = start + per_page
    page_records = records[start:end]

    return jsonify({
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
        "assets": page_records,
    })


@assets_bp.route("/assets/<int:index>", methods=["GET"])
def get_asset(index):
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404
    if index < 0 or index >= len(df):
        return jsonify({"error": "Asset index out of range"}), 404

    records = _get_enriched_records(df)
    return jsonify(records[index])


@assets_bp.route("/assets/export", methods=["GET"])
def export_assets():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404

    records = _get_enriched_records(df)
    records = _apply_filters(records, request.args)

    if not records:
        return jsonify({"error": "No records to export"}), 404

    import pandas as pd
    export_df = pd.DataFrame(records)
    csv_data = export_df.to_csv(index=False)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=assets_export.csv"},
    )


@assets_bp.route("/assets/summary", methods=["GET"])
def asset_summary():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404
    return jsonify(get_summary(df))
