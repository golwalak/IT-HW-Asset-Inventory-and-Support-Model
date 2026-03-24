import React, { useState } from 'react'
import { uploadCSV } from '../services/api'

export default function UploadPanel({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await uploadCSV(file)
      setResult(res.data)
      onUploadSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onInputChange = (e) => handleFile(e.target.files[0])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <i className="bi bi-cloud-upload me-2"></i>
        Upload Inventory CSV
      </div>
      <div className="card-body">
        <div
          className={`border border-2 rounded p-5 text-center ${dragging ? 'border-primary bg-light' : 'border-dashed'}`}
          style={{ borderStyle: 'dashed', cursor: 'pointer' }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('csv-file-input').click()}
        >
          <i className="bi bi-file-earmark-spreadsheet display-4 text-muted"></i>
          <p className="mt-2 mb-0 text-muted">
            {dragging ? 'Drop the file here…' : 'Drag & drop your CSV file here, or click to browse'}
          </p>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            className="d-none"
            onChange={onInputChange}
          />
        </div>

        {loading && (
          <div className="mt-3 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
            <p className="mt-1 text-muted">Parsing CSV…</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-3">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        {result && (
          <div className="alert alert-success mt-3">
            <i className="bi bi-check-circle me-2"></i>
            Successfully loaded <strong>{result.total_records}</strong> records with{' '}
            <strong>{result.columns?.length}</strong> columns.
          </div>
        )}

        {result && (
          <div className="mt-3">
            <h6>Filter Options Available</h6>
            <div className="row g-2 small">
              <div className="col-6 col-md-4">
                <strong>Locations ({result.locations?.length}):</strong>{' '}
                {result.locations?.slice(0, 3).join(', ')}{result.locations?.length > 3 ? '…' : ''}
              </div>
              <div className="col-6 col-md-4">
                <strong>Manufacturers ({result.manufacturers?.length}):</strong>{' '}
                {result.manufacturers?.slice(0, 3).join(', ')}{result.manufacturers?.length > 3 ? '…' : ''}
              </div>
              <div className="col-6 col-md-4">
                <strong>Applications ({result.applications?.length}):</strong>{' '}
                {result.applications?.slice(0, 3).join(', ')}{result.applications?.length > 3 ? '…' : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
