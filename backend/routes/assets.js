const express = require('express');
const router = express.Router();
const {
  getAllAssets,
  getSummaryStats,
  getExpiringSoon,
  getAssetById,
  createAsset,
  updateAsset,
  updateSupportTier,
  reassignOwner,
  deleteAsset,
  sendNotifications,
  getNotifications,
} = require('../controllers/assetsController');

// Static routes before :id
router.get('/summary/stats',          getSummaryStats);
router.get('/expiring-soon',          getExpiringSoon);
router.get('/notifications',          getNotifications);
router.post('/notifications/send',    sendNotifications);

router.get('/',     getAllAssets);
router.get('/:id',  getAssetById);
router.post('/',    createAsset);
router.put('/:id',  updateAsset);
router.put('/:id/support-tier', updateSupportTier);
router.put('/:id/reassign',     reassignOwner);
router.delete('/:id', deleteAsset);

module.exports = router;
