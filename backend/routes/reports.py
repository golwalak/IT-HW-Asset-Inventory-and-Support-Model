import io
from datetime import date, timedelta
from flask import Blueprint, request, jsonify, Response
from utils import get_df
from utils.csv_parser import df_to_records
from utils.tier_calculator import enrich_asset

reports_bp = Blueprint("reports", __name__)


def _enriched(df):
    today = date.today()
    return [enrich_asset(r, today=today) for r in df_to_records(df)]


def _group_by(records, key_fn, label):
    groups = {}
    for r in records:
        k = key_fn(r) or "Unknown"
        if k not in groups:
            groups[k] = {
                label: k,
                "asset_count": 0,
                "total_oem_cost": 0.0,
                "total_cost_avoidance": 0.0,
            }
        groups[k]["asset_count"] += 1
        oem = r.get("oem_cost") or 0
        avoidance = r.get("cost_avoidance_recommended") or 0
        groups[k]["total_oem_cost"] += oem
        groups[k]["total_cost_avoidance"] += avoidance

    result = list(groups.values())
    for g in result:
        g["total_oem_cost"] = round(g["total_oem_cost"], 2)
        g["total_cost_avoidance"] = round(g["total_cost_avoidance"], 2)
    return sorted(result, key=lambda x: x["asset_count"], reverse=True)


@reports_bp.route("/reports/by-application", methods=["GET"])
def by_application():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404
    records = _enriched(df)
    return jsonify(_group_by(records, lambda r: r.get("application (mock)"), "application"))


@reports_bp.route("/reports/by-owner", methods=["GET"])
def by_owner():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404
    records = _enriched(df)
    return jsonify(_group_by(records, lambda r: r.get("Owner (mock)"), "owner"))


@reports_bp.route("/reports/by-location", methods=["GET"])
def by_location():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404
    records = _enriched(df)
    return jsonify(_group_by(records, lambda r: r.get("Location"), "location"))


@reports_bp.route("/reports/by-manufacturer", methods=["GET"])
def by_manufacturer():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404
    records = _enriched(df)
    return jsonify(_group_by(records, lambda r: r.get("Manufacturer"), "manufacturer"))


@reports_bp.route("/reports/by-support-group", methods=["GET"])
def by_support_group():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404
    records = _enriched(df)
    return jsonify(_group_by(records, lambda r: r.get("Support Group Name"), "support_group"))


@reports_bp.route("/reports/tier-summary", methods=["GET"])
def tier_summary():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404

    records = _enriched(df)

    tiers = {"Tier 1": 0, "Tier 2": 0, "Tier 3": 0, "Tier 4": 0}
    total_oem = 0.0
    total_avoidance = 0.0

    for r in records:
        t = r.get("current_tier", "Tier 1")
        tiers[t] = tiers.get(t, 0) + 1
        oem = r.get("oem_cost") or 0
        avoidance = r.get("cost_avoidance_recommended") or 0
        total_oem += oem
        total_avoidance += avoidance

    return jsonify({
        "assets_by_tier": tiers,
        "total_oem_cost": round(total_oem, 2),
        "total_potential_cost_avoidance": round(total_avoidance, 2),
        "total_assets": len(records),
    })


@reports_bp.route("/reports/warranty", methods=["GET"])
def warranty_report():
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404

    try:
        window = int(request.args.get("days", 180))
    except ValueError:
        window = 180

    records = _enriched(df)
    today = date.today()

    result = []
    for r in records:
        days = r.get("days_to_warranty_expiry")
        status = r.get("warranty_status", "unknown")

        if status == "expired" or (days is not None and 0 <= days <= window):
            result.append(r)

    return jsonify(result)


@reports_bp.route("/reports/export/<group_by>", methods=["GET"])
def export_report(group_by):
    df = get_df()
    if df is None:
        return jsonify({"error": "No data loaded."}), 404

    records = _enriched(df)
    key_map = {
        "application": (lambda r: r.get("application (mock)"), "application"),
        "owner": (lambda r: r.get("Owner (mock)"), "owner"),
        "location": (lambda r: r.get("Location"), "location"),
        "manufacturer": (lambda r: r.get("Manufacturer"), "manufacturer"),
        "support_group": (lambda r: r.get("Support Group Name"), "support_group"),
    }

    if group_by not in key_map:
        return jsonify({"error": f"Unknown group_by: {group_by}"}), 400

    key_fn, label = key_map[group_by]
    groups = _group_by(records, key_fn, label)

    import pandas as pd
    export_df = pd.DataFrame(groups)
    csv_data = export_df.to_csv(index=False)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename=report_{group_by}.csv"},
    )
