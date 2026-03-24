"""
VibeAThon POC - IT Hardware Asset Inventory and Support Model
Support tier recommendation logic and cost avoidance calculations.
"""

import pandas as pd


# Tier savings rates
TIER_SAVINGS = {
    1: 0.00,
    2: 0.07,
    3: 1.00,
    4: 0.80,
}

TIER_LABELS = {
    1: "Tier 1 – 7x24 OEM",
    2: "Tier 2 – NBD (7% savings)",
    3: "Tier 3 – No Support (100% savings)",
    4: "Tier 4 – 7x24 3rd Party (80% savings)",
}


def recommend_tier(row: dict | pd.Series) -> int:
    """
    Determine the recommended support tier for a single asset.

    Rules (in priority order):
    1. Warranty Active  → Tier 1
    2. Nonprod + age > 60 mo → Tier 3
    3. Nonprod + age 36-60 mo → Tier 4
    4. Prod + age > 84 mo → Tier 4
    5. Prod + age 60-84 mo → Tier 2
    6. Default → Tier 1
    """
    warranty_status = row.get("warranty_status", "Unknown")
    status = str(row.get("status", "")).lower()
    age = row.get("age_mo")

    # Convert age to float safely
    try:
        age = float(age)
    except (TypeError, ValueError):
        age = 0.0

    if warranty_status == "Active":
        return 1

    is_nonprod = "nonprod" in status

    if is_nonprod:
        if age > 60:
            return 3
        if age >= 36:
            return 4

    # Production (default path)
    if age > 84:
        return 4
    if age >= 60:
        return 2

    return 1


def calculate_cost_avoidance(oem_cost: float, tier: int) -> float:
    """Return the annual cost avoidance in dollars for the given tier."""
    try:
        oem_cost = float(oem_cost)
    except (TypeError, ValueError):
        oem_cost = 0.0
    savings_rate = TIER_SAVINGS.get(tier, 0.0)
    return round(oem_cost * savings_rate, 2)


def apply_support_model(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add recommended_tier, tier_label, and cost_avoidance columns to the DataFrame.
    Returns a new DataFrame with those columns appended.
    """
    df = df.copy()
    df["recommended_tier"] = df.apply(recommend_tier, axis=1)
    df["tier_label"] = df["recommended_tier"].map(TIER_LABELS)
    df["cost_avoidance"] = df.apply(
        lambda row: calculate_cost_avoidance(row.get("oem_cost", 0), row["recommended_tier"]),
        axis=1,
    )
    return df


def summarise_by_tier(df: pd.DataFrame) -> list[dict]:
    """Return a summary list of asset counts and total cost avoidance per tier."""
    if "recommended_tier" not in df.columns:
        df = apply_support_model(df)

    summary = []
    for tier in sorted(TIER_LABELS.keys()):
        subset = df[df["recommended_tier"] == tier]
        summary.append(
            {
                "tier": tier,
                "label": TIER_LABELS[tier],
                "count": int(len(subset)),
                "total_oem_cost": float(subset["oem_cost"].sum()),
                "total_cost_avoidance": float(subset["cost_avoidance"].sum()),
            }
        )
    return summary


def summarise_totals(df: pd.DataFrame) -> dict:
    """Return overall totals across all assets."""
    if "recommended_tier" not in df.columns:
        df = apply_support_model(df)

    total_oem = float(df["oem_cost"].sum())
    total_avoidance = float(df["cost_avoidance"].sum())
    tier1_count = int((df["recommended_tier"] == 1).sum())
    non_tier1_count = int((df["recommended_tier"] != 1).sum())

    return {
        "total_assets": len(df),
        "total_oem_cost": total_oem,
        "total_cost_avoidance": total_avoidance,
        "tier1_count": tier1_count,
        "non_tier1_count": non_tier1_count,
        "avoidance_pct": round((total_avoidance / total_oem * 100) if total_oem else 0, 1),
    }
