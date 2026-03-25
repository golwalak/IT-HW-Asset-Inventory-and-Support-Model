import axios from 'axios';

const API_BASE = '/api/assets';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getAssets = async (params = {}) => {
  const response = await api.get('/', { params: { limit: 500, ...params } });
  // Backend now returns { total, limit, offset, data: [] }
  return response.data;
};

export const getAsset = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createAsset = async (asset) => {
  const response = await api.post('/', asset);
  return response.data;
};

export const updateAsset = async (id, asset) => {
  const response = await api.put(`/${id}`, asset);
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/summary/stats');
  return response.data;
};

export const getExpiringSoon = async (months = 6) => {
  const response = await api.get('/expiring-soon', { params: { months } });
  return response.data;
};

export const updateSupportTier = async (id, supportTier) => {
  const response = await api.put(`/${id}/support-tier`, { supportTier });
  return response.data;
};

export const reassignOwner = async (id, data) => {
  const response = await api.put(`/${id}/reassign`, data);
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const sendNotifications = async (months = 6) => {
  const response = await api.post('/notifications/send', null, { params: { months } });
  return response.data;
};

export const searchDirectoryUsers = async (q, limit = 10) => {
  const response = await axios.get('/api/directory/users', { params: { q, limit } });
  return response.data;
};

export const getDirectoryManager = async (userId) => {
  const response = await axios.get(`/api/directory/users/${encodeURIComponent(userId)}/manager`);
  return response.data;
};
