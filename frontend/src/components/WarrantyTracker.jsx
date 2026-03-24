import React, { useState, useEffect } from 'react'
import { getWarrantyReport } from '../services/api'
import { fmtDate, fmtCurrency, TierBadge } from './shared'

const WINDOWS = [
  { label: 'Already Expired', days: 0, class: 'danger' },
  { label: 'Within 30 Days', days: 30, class: 'danger' },
  { label: 'Within 60 Days', days: 60, class: 'warning' },
  { label: 'Within 90 Days', days: 90, class: 'warning' },
  { label: 'Within 180 Days', days: 180, class: 'info' },
]

export default function WarrantyTracker({ dataLoaded }) {
  const [selectedDays, setSelectedDays] = useState(180)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!dataLoaded) return
    setLoading(true)
    setError(null)
    getWarrantyReport(selectedDays)
      .then(res => setAssets(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load warranty data.'))
      .finally(() => setLoading(false))
  }, [dataLoaded, selectedDays])

  if (!dataLoaded) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Please upload a CSV file to view the warranty tracker.
      </div>
    )
  }

  const expired = assets.filter(a => a.warranty_status === 'expired')
  const expiring = assets.filter(a => a.warranty_status === 'expiring_soon')

  return (
    <div>
      {/* Window Selector */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Warranty Expiry Window</label>
        <div className="btn-group">
          {WINDOWS.map(w => (
            <button
              key={w.days}
              className={`btn btn-sm ${selectedDays === w.days ? `btn-${w.class}` : `btn-outline-${w.class}`}`}
              onClick={() => setSelectedDays(w.days)}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counts */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card stat-card stat-card-red">
            <div className="card-body py-2">
              <div className="text-muted small">Expired</div>
              <div className="fs-3 fw-bold text-danger">{expired.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card stat-card-yellow">
            <div className="card-body py-2">
              <div className="text-muted small">Expiring Within {selectedDays > 0 ? `${selectedDays} days` : 'window'}</div>
              <div className="fs-3 fw-bold text-warning">{expiring.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card stat-card-blue">
            <div className="card-body py-2">
              <div className="text-muted small">Total in View</div>
              <div className="fs-3 fw-bold">{assets.length}</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border"></div></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Asset Name</th>
                <th>Manufacturer</th>
                <th>Model</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Warranty End</th>
                <th>Days Remaining</th>
                <th>Status</th>
                <th>Prod?</th>
                <th>Current Tier</th>
                <th>OEM Cost/yr</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr><td colSpan={11} className="text-center text-muted py-4">No assets in this window</td></tr>
              ) : assets.sort((a, b) => (a.days_to_warranty_expiry || 999) - (b.days_to_warranty_expiry || 999)).map((asset, idx) => (
                <tr
                  key={idx}
                  className={
                    asset.warranty_status === 'expired' ? 'warranty-expired' :
                    asset.warranty_status === 'expiring_soon' ? 'warranty-expiring' : ''
                  }
                >
                  <td className="fw-semibold">{asset['Asset Name'] || '—'}</td>
                  <td>{asset['Manufacturer'] || '—'}</td>
                  <td className="small">{asset['Model'] || '—'}</td>
                  <td className="small">{asset['Location'] || '—'}</td>
                  <td>{asset['Owner (mock)'] || '—'}</td>
                  <td className="small">{fmtDate(asset['Warranty End Date'])}</td>
                  <td className="text-center">
                    {asset.days_to_warranty_expiry != null
                      ? asset.days_to_warranty_expiry < 0
                        ? <span className="text-danger">{asset.days_to_warranty_expiry}</span>
                        : <span className="text-warning">{asset.days_to_warranty_expiry}</span>
                      : '—'}
                  </td>
                  <td>
                    {asset.warranty_status === 'expired'
                      ? <span className="badge bg-danger">Expired</span>
                      : <span className="badge bg-warning text-dark">Expiring Soon</span>}
                  </td>
                  <td>
                    <span className={`badge ${asset['status (prod or nonprod) (mock)'] === 'prod' ? 'bg-primary' : 'bg-info text-dark'}`}>
                      {asset['status (prod or nonprod) (mock)'] || '—'}
                    </span>
                  </td>
                  <td><TierBadge tier={asset.current_tier} /></td>
                  <td className="text-end">{fmtCurrency(asset.oem_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
