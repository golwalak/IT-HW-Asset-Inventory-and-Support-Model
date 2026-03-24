"""
Support tier cost avoidance calculation logic.

Tier Model:
  Tier 1 – 7x24 OEM: full OEM cost (baseline)
  Tier 2 – NBD:      ~7% savings vs Tier 1
  Tier 3 – None:     100% savings (self-support)
  Tier 4 – 3rd Party 7x24: ~80% savings vs Tier 1
"""

from datetime import date


TIER_SAVINGS = {
    "Tier 1": 0.00,
    "Tier 2": 0.07,
    "Tier 3": 1.00,
    "Tier 4": 0.80,
}


def calculate_cost_avoidance(oem_cost, tier):
    """Return the cost avoidance amount for a given tier and OEM cost."""
    if oem_cost is None:
        return None
    rate = TIER_SAVINGS.get(tier, 0.0)
    return round(oem_cost * rate, 2)


def get_current_tier(row):
    """
    Determine the current support tier from the boolean tier flag columns.
    Returns "Tier 1", "Tier 2", "Tier 3", or "Tier 4".
    """
    def is_yes(val):
        if val is None:
            return False
        return str(val).strip().lower() in ("yes", "y", "true", "1")

    if is_yes(row.get("7x24 Tier1 (yes/no?)")):
        return "Tier 1"
    if is_yes(row.get("NBD Tier 2 7% save (yes/no)")):
        return "Tier 2"
    if is_yes(row.get("None Tier 3 100% save (yes/on)")):
        return "Tier 3"
    if is_yes(row.get("7x24 3rd Party Tier 4 80% save (yes/no)")):
        return "Tier 4"
    return "Tier 1"  # default to Tier 1 if nothing flagged


def recommend_tier(row, today=None):
    """
    Apply simple heuristic tier recommendation:
      - nonprod AND age > 60  → Tier 3
      - nonprod AND age <= 60 → Tier 2
      - prod AND age > 84     → Tier 4
      - prod AND warranty still active → Tier 1
      - otherwise             → Tier 2
    """
    if today is None:
        today = date.today()

    status = str(row.get("status (prod or nonprod) (mock)") or "").strip().lower()
    age = row.get("age (mo)")
    warranty_end = row.get("Warranty End Date")

    # Attempt to parse warranty_end if it's a string
    if isinstance(warranty_end, str):
        try:
            from datetime import datetime
            warranty_end = datetime.fromisoformat(warranty_end).date()
        except Exception:
            warranty_end = None
    elif hasattr(warranty_end, "date"):
        warranty_end = warranty_end.date()

    age_num = float(age) if age is not None else None

    if status == "nonprod":
        if age_num is not None and age_num > 60:
            return "Tier 3"
        return "Tier 2"

    if status == "prod":
        if age_num is not None and age_num > 84:
            return "Tier 4"
        if warranty_end is not None and warranty_end >= today:
            return "Tier 1"
        return "Tier 2"

    return "Tier 2"


def enrich_asset(row, today=None):
    """
    Given an asset dict, add computed fields:
      - current_tier
      - recommended_tier
      - oem_cost
      - cost_avoidance_current (cost avoidance at current tier)
      - cost_avoidance_recommended (cost avoidance at recommended tier)
      - warranty_status: 'active' | 'expired' | 'expiring_soon' | 'unknown'
      - days_to_warranty_expiry
    """
    if today is None:
        today = date.today()

    oem_raw = row.get("7x24 OEM $ / 365 days (mock)")
    try:
        oem_cost = float(oem_raw) if oem_raw is not None else None
    except (ValueError, TypeError):
        oem_cost = None

    current_tier = get_current_tier(row)
    recommended_tier = recommend_tier(row, today=today)

    cost_avoid_current = calculate_cost_avoidance(oem_cost, current_tier)
    cost_avoid_recommended = calculate_cost_avoidance(oem_cost, recommended_tier)

    # Warranty status
    warranty_end = row.get("Warranty End Date")
    if isinstance(warranty_end, str):
        try:
            from datetime import datetime
            warranty_end_date = datetime.fromisoformat(warranty_end).date()
        except Exception:
            warranty_end_date = None
    elif hasattr(warranty_end, "date"):
        warranty_end_date = warranty_end.date()
    else:
        warranty_end_date = None

    if warranty_end_date is None:
        warranty_status = "unknown"
        days_to_expiry = None
    else:
        delta = (warranty_end_date - today).days
        days_to_expiry = delta
        if delta < 0:
            warranty_status = "expired"
        elif delta <= 180:
            warranty_status = "expiring_soon"
        else:
            warranty_status = "active"

    return {
        **row,
        "current_tier": current_tier,
        "recommended_tier": recommended_tier,
        "oem_cost": oem_cost,
        "cost_avoidance_current": cost_avoid_current,
        "cost_avoidance_recommended": cost_avoid_recommended,
        "warranty_status": warranty_status,
        "days_to_warranty_expiry": days_to_expiry,
    }
