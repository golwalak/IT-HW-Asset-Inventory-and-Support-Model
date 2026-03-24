// Axios instance and API helper functions
import axios from 'axios';

// Use REACT_APP_API_URL env var or fall back to the proxy (relative URL)
const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL });

/**
 * Fetch all assets with optional filters.
 * @param {{owner?:string, application?:string, status?:string}} filters
 */
export function getAssets(filters = {}) {
  return api.get('/assets', { params: filters }).then((r) => r.data);
}

/**
 * Fetch a single asset by Asset Number.
 * @param {string} id
 */
export function getAssetById(id) {
  return api.get(`/assets/${id}`).then((r) => r.data);
}

/**
 * Upload a CSV file to the backend.
 * @param {File} file
 */
export function uploadCSV(file) {
  const form = new FormData();
  form.append('file', file);
  return api.post('/assets/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
}

/** Grouped report by Owner. */
export function getReportByOwner() {
  return api.get('/reports/by-owner').then((r) => r.data);
}

/** Grouped report by Application. */
export function getReportByApplication() {
  return api.get('/reports/by-application').then((r) => r.data);
}

/** Cost avoidance summary. */
export function getCostAvoidanceSummary() {
  return api.get('/reports/cost-avoidance').then((r) => r.data);
}

export default api;
