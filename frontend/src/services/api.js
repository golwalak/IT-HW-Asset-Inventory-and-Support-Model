import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/assets';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getAssets = async () => {
  const response = await api.get('/');
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
  const response = await api.get('/stats');
  return response.data;
};
