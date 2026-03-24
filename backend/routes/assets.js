const express = require('express');
const router = express.Router();
const {
  getAllAssets,
  getSummaryStats,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
} = require('../controllers/assetsController');

// Summary stats must be defined before the :id route
router.get('/summary/stats', getSummaryStats);

router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;
