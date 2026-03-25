const { searchUsers, getManager, DIRECTORY_PROVIDER } = require('../services/directoryService');

const searchDirectoryUsers = async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = Number(req.query.limit || 10);
    const users = await searchUsers(query, limit);
    res.json({ provider: DIRECTORY_PROVIDER, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Directory lookup failed' });
  }
};

const getDirectoryManager = async (req, res) => {
  try {
    const userId = req.params.userId;
    const manager = await getManager(userId);
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    res.json({ provider: DIRECTORY_PROVIDER, manager });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Manager lookup failed' });
  }
};

module.exports = {
  searchDirectoryUsers,
  getDirectoryManager,
};
