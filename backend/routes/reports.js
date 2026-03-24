// Routes for reporting endpoints
const express = require('express');
const router = express.Router();

const {
  groupBy,
  getCostAvoidanceSummary,
} = require('../controllers/reportsController');
const { getAll } = require('../controllers/assetsController');

// GET /api/reports/by-owner — assets grouped by Owner (authoritative field)
router.get('/by-owner', (_req, res) => {
  res.json(groupBy('owner'));
});

// GET /api/reports/by-application — assets grouped by Application (authoritative field)
router.get('/by-application', (_req, res) => {
  res.json(groupBy('application'));
});

// GET /api/reports/by-tier — assets grouped by support tier
router.get('/by-tier', (_req, res) => {
  const assets = getAll();
  const groups = {};
  assets.forEach((a) => {
    const tier = a.getSupportTier();
    if (!groups[tier]) groups[tier] = { tier, assets: [] };
    groups[tier].assets.push(a);
  });

  const result = Object.values(groups).map((g) => ({
    tier: g.tier,
    count: g.assets.length,
    totalOemCost: g.assets.reduce((s, a) => s + (parseFloat(a.oemCostAnnual) || 0), 0),
    totalCostAvoidance: g.assets.reduce((s, a) => s + (parseFloat(a.costAvoidance) || 0), 0),
  }));
  res.json(result);
});

// GET /api/reports/cost-avoidance — total cost avoidance summary
router.get('/cost-avoidance', (_req, res) => {
  res.json(getCostAvoidanceSummary());
});

module.exports = router;
