const { v4: uuidv4 } = require('uuid');
let assets = require('../data/sampleData');

// GET /api/assets - list all assets with optional filtering
const getAllAssets = (req, res) => {
  let result = [...assets];
  const { owner, application, type, status } = req.query;

  if (owner) {
    result = result.filter(a => a.owner.toLowerCase().includes(owner.toLowerCase()));
  }
  if (application) {
    result = result.filter(a => a.application.toLowerCase().includes(application.toLowerCase()));
  }
  if (type) {
    result = result.filter(a => a.type.toLowerCase() === type.toLowerCase());
  }
  if (status) {
    result = result.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  res.json(result);
};

// GET /api/assets/summary/stats - summary statistics
const getSummaryStats = (_req, res) => {
  const countBy = (arr, key) =>
    arr.reduce((acc, item) => {
      const val = item[key];
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

  res.json({
    total: assets.length,
    byType: countBy(assets, 'type'),
    byStatus: countBy(assets, 'status'),
    byOwner: countBy(assets, 'owner'),
    byApplication: countBy(assets, 'application')
  });
};

// GET /api/assets/:id - get single asset
const getAssetById = (req, res) => {
  const asset = assets.find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' });
  }
  res.json(asset);
};

// POST /api/assets - create new asset
const createAsset = (req, res) => {
  const { assetTag, name, type, owner, application, status, purchaseDate, warrantyExpiry, location, notes } = req.body;

  if (!assetTag || !name || !type) {
    return res.status(400).json({ message: 'assetTag, name, and type are required' });
  }

  const newAsset = {
    id: uuidv4(),
    assetTag,
    name,
    type,
    owner: owner || '',
    application: application || '',
    status: status || 'Active',
    purchaseDate: purchaseDate || '',
    warrantyExpiry: warrantyExpiry || '',
    location: location || '',
    notes: notes || ''
  };

  assets.push(newAsset);
  res.status(201).json(newAsset);
};

// PUT /api/assets/:id - update asset
const updateAsset = (req, res) => {
  const index = assets.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  const updated = { ...assets[index], ...req.body, id: assets[index].id };
  assets[index] = updated;
  res.json(updated);
};

// DELETE /api/assets/:id - delete asset
const deleteAsset = (req, res) => {
  const index = assets.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  const deleted = assets.splice(index, 1)[0];
  res.json({ message: 'Asset deleted', asset: deleted });
};

module.exports = {
  getAllAssets,
  getSummaryStats,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
