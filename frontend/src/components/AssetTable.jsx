import React, { useState, useEffect, useCallback } from 'react'
import { getAssets, getAssetSummary, exportAssets } from '../services/api'
import { TierBadge, WarrantyBadge, fmtCurrency, fmtDate } from './shared'
import AssetDetailModal from './AssetDetailModal'

export default function AssetTable({ dataLoaded }) {
  const [assets, setAssets] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    manufacturer: '',
    type: '',
    status: '',
    record_status: '',
    support_group: '',
    application: '',
    owner: '',
  })

  const fetchSummary = useCallback(async () => {
    try {
      const res = await getAssetSummary()
      setSummary(res.data)
    } catch {
      // ignore
    }
  }, [])

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, per_page: perPage }
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
      const res = await getAssets(params)
      setAssets(res.data.assets)
      setTotal(res.data.total)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assets.')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, filters])

  useEffect(() => {
    if (dataLoaded) {
      fetchSummary()
      fetchAssets()
    }
  }, [dataLoaded, fetchSummary, fetchAssets])

  const handleFilterChange = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }))
    setPage(1)
  }

  const rowClass = (asset) => {
    if (asset.warranty_status === 'expired') return 'warranty-expired'
    if (asset.warranty_status === 'expiring_soon') return 'warranty-expiring'
    return ''
  }

  if (!dataLoaded) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Please upload a CSV file to view the asset inventory.
      </div>
    )
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      {/* Filters */}
      <div className="card mb-3 shadow-sm">
        <div className="card-header">
          <i className="bi bi-funnel me-2"></i>Filters
        </div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search all fields…"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            {summary && [
              { name: 'location', label: 'Location', options: summary.locations || [] },
              { name: 'manufacturer', label: 'Manufacturer', options: summary.manufacturers || [] },
              { name: 'type', label: 'Type', options: summary.types || [] },
              { name: 'status', label: 'Prod/Nonprod', options: summary.statuses || [] },
              { name: 'record_status', label: 'Record Status', options: summary.record_statuses || [] },
              { name: 'support_group', label: 'Support Group', options: summary.support_groups || [] },
              { name: 'application', label: 'Application', options: summary.applications || [] },
              { name: 'owner', label: 'Owner', options: summary.owners || [] },
            ].map(({ name, label, options }) => (
              <div className="col-md-2" key={name}>
                <select
                  className="form-select form-select-sm"
                  name={name}
                  value={filters[name]}
                  onChange={handleFilterChange}
                >
                  <option value="">All {label}s</option>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-2 d-flex justify-content-between align-items-center">
            <small className="text-muted">{total} record{total !== 1 ? 's' : ''} found</small>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => exportAssets(
                Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
              )}
            >
              <i className="bi bi-download me-1"></i>Export CSV
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Asset Name</th>
                  <th>Manufacturer</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Age (mo)</th>
                  <th>Owner</th>
                  <th>Application</th>
                  <th>Status</th>
                  <th>Support Group</th>
                  <th>Warranty End</th>
                  <th>Record Status</th>
                  <th>Current Tier</th>
                  <th>OEM Cost/yr</th>
                  <th>Recommended</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="text-center text-muted py-4">No assets found</td>
                  </tr>
                ) : assets.map((asset, idx) => (
                  <tr
                    key={idx}
                    className={rowClass(asset)}
                    onClick={() => setSelectedAsset(asset)}
                    title="Click to view details"
                  >
                    <td className="text-muted small">{(page - 1) * perPage + idx + 1}</td>
                    <td className="fw-semibold">{asset['Asset Name'] || '—'}</td>
                    <td>{asset['Manufacturer'] || '—'}</td>
                    <td className="small">{asset['Model'] || '—'}</td>
                    <td>{asset['Type'] || '—'}</td>
                    <td className="small">{asset['Location'] || '—'}</td>
                    <td>{asset['age (mo)'] ?? '—'}</td>
                    <td>{asset['Owner (mock)'] || '—'}</td>
                    <td>{asset['application (mock)'] || '—'}</td>
                    <td>
                      <span className={`badge ${asset['status (prod or nonprod) (mock)'] === 'prod' ? 'bg-primary' : 'bg-info text-dark'}`}>
                        {asset['status (prod or nonprod) (mock)'] || '—'}
                      </span>
                    </td>
                    <td className="small">{asset['Support Group Name'] || '—'}</td>
                    <td className="small">
                      <WarrantyBadge status={asset.warranty_status} days={asset.days_to_warranty_expiry} />
                      <br />
                      <span className="text-muted">{fmtDate(asset['Warranty End Date'])}</span>
                    </td>
                    <td>
                      <span className={`badge ${asset['Record Status'] === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {asset['Record Status'] || '—'}
                      </span>
                    </td>
                    <td><TierBadge tier={asset.current_tier} /></td>
                    <td className="text-end">{fmtCurrency(asset.oem_cost)}</td>
                    <td><TierBadge tier={asset.recommended_tier} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination pagination-sm justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}>‹</button>
                </li>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  const p = i + 1
                  return (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                    </li>
                  )
                })}
                {totalPages > 10 && <li className="page-item disabled"><span className="page-link">…</span></li>}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}>›</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {selectedAsset && (
        <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}
    </div>
  )
}
