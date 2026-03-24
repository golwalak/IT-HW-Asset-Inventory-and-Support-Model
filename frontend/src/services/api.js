import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
})

export const uploadCSV = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getAssets = (params = {}) => api.get('/assets', { params })

export const getAsset = (index) => api.get(`/assets/${index}`)

export const getAssetSummary = () => api.get('/assets/summary')

export const exportAssets = (params = {}) => {
  const query = new URLSearchParams(params).toString()
  window.open(`${API_BASE}/assets/export?${query}`, '_blank')
}

export const getTierSummary = () => api.get('/reports/tier-summary')

export const getReportByApplication = () => api.get('/reports/by-application')
export const getReportByOwner = () => api.get('/reports/by-owner')
export const getReportByLocation = () => api.get('/reports/by-location')
export const getReportByManufacturer = () => api.get('/reports/by-manufacturer')
export const getReportBySupportGroup = () => api.get('/reports/by-support-group')

export const getWarrantyReport = (days) =>
  api.get('/reports/warranty', { params: { days } })

export const exportReport = (groupBy) => {
  window.open(`${API_BASE}/reports/export/${groupBy}`, '_blank')
}

export default api
