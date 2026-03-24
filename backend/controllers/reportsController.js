// Reports controller — aggregation logic over the in-memory asset store
const { getAll } = require('./assetsController');

/**
 * Helper: sum numeric field across an array.
 * @param {object[]} items
 * @param {string} field
 * @returns {number}
 */
function sumField(items, field) {
  return items.reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0);
}

/**
 * Group assets by a given field and compute summary stats.
 * @param {string} groupField - e.g. 'owner' or 'application'
 * @returns {object[]}
 */
function groupBy(groupField) {
  const assets = getAll();
  const groups = {};

  assets.forEach((asset) => {
    const key = asset[groupField] || 'Unknown';
    if (!groups[key]) {
      groups[key] = { name: key, assets: [] };
    }
    groups[key].assets.push(asset);
  });

  return Object.values(groups).map((g) => ({
    name: g.name,
    count: g.assets.length,
    totalOemCost: sumField(g.assets, 'oemCostAnnual'),
    totalCostAvoidance: sumField(g.assets, 'costAvoidance'),
    tierBreakdown: getTierBreakdown(g.assets),
  }));
}

/**
 * Count assets per support tier in a list.
 * @param {Asset[]} assets
 * @returns {object}
 */
function getTierBreakdown(assets) {
  const breakdown = { Tier1: 0, Tier2: 0, Tier3: 0, Tier4: 0, Unknown: 0 };
  assets.forEach((a) => {
    const tier = a.getSupportTier();
    breakdown[tier] = (breakdown[tier] || 0) + 1;
  });
  return breakdown;
}

/**
 * Overall cost avoidance summary.
 * @returns {object}
 */
function getCostAvoidanceSummary() {
  const assets = getAll();
  const total = assets.length;
  const totalOemCost = sumField(assets, 'oemCostAnnual');
  const totalCostAvoidance = sumField(assets, 'costAvoidance');

  return {
    total,
    totalOemCost,
    totalCostAvoidance,
    savingsPct: totalOemCost > 0
      ? ((totalCostAvoidance / totalOemCost) * 100).toFixed(1)
      : '0.0',
    tierBreakdown: getTierBreakdown(assets),
  };
}

module.exports = { groupBy, getTierBreakdown, getCostAvoidanceSummary };
