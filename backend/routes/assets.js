// Routes for asset CRUD and CSV upload
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { getAll, getById, replaceAll } = require('../controllers/assetsController');
const { parseCSV } = require('../utils/csvParser');

// Multer storage — save uploaded CSVs to backend/data/
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../data'),
  filename: (_req, file, cb) => {
    cb(null, `upload_${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are accepted'));
    }
  },
});

// GET /api/assets — return all assets, optional query filters: owner, application, status
router.get('/', (req, res) => {
  const { owner, application, status } = req.query;
  const assets = getAll({ owner, application, status });
  res.json(assets);
});

// GET /api/assets/:id — return single asset by Asset Number
router.get('/:id', (req, res, next) => {
  const asset = getById(req.params.id);
  if (!asset) {
    const err = new Error(`Asset ${req.params.id} not found`);
    err.status = 404;
    return next(err);
  }
  res.json(asset);
});

// POST /api/assets/upload — accept CSV and reload in-memory store
router.post('/upload', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    const err = new Error('No file uploaded');
    err.status = 400;
    return next(err);
  }
  try {
    const assets = await parseCSV(req.file.path);
    replaceAll(assets);
    res.json({ message: `Loaded ${assets.length} assets from CSV`, count: assets.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
