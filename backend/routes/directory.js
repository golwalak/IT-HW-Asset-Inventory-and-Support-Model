const express = require('express');
const router = express.Router();
const { searchDirectoryUsers, getDirectoryManager } = require('../controllers/directoryController');

router.get('/users', searchDirectoryUsers);
router.get('/users/:userId/manager', getDirectoryManager);

module.exports = router;
