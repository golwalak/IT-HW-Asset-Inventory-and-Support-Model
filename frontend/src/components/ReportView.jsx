import React, { useState, useEffect } from 'react'
import {
  getReportByApplication, getReportByOwner, getReportByLocation,
  getReportByManufacturer, getReportBySupportGroup, exportReport,
} from '../services/api'
import { fmtCurrency } from './shared'

const VIEWS = [
  { key: 'application', label: 'By Application', fn: getReportByApplication, col: 'application' },
  { key: 'owner', label: 'By Owner', fn: getReportByOwner, col: 'owner' },
  { key: 'location', label: 'By Location', fn: getReportByLocation, col: 'location' },
  { key: 'manufacturer', label: 'By Manufacturer', fn: getReportByManufacturer, col: 'manufacturer' },
  { key: 'support_group', label: 'By Support Group', fn: getReportBySupportGroup, col: 'support_group' },
]

export default function ReportView({ dataLoaded }) {
  const [activeView, setActiveView] = useState('application')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const view = VIEWS.find(v => v.key === activeView)

  const fetchData = async () => {
    if (!dataLoaded || !view) return
    setLoading(true)
    setError(null)
    try {
      const res = await view.fn()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [activeView, dataLoaded])

  if (!dataLoaded) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Please upload a CSV file to view reports.
      </div>
    )
  }

  const totalAssets = data.reduce((s, r) => s + (r.asset_count || 0), 0)
  const totalOEM = data.reduce((s, r) => s + (r.total_oem_cost || 0), 0)
  const totalSavings = data.reduce((s, r) => s + (r.total_cost_avoidance || 0), 0)

  return (
    <div>
      {/* View Selector */}
      <ul className="nav nav-pills mb-3">
        {VIEWS.map(v => (
          <li className="nav-item" key={v.key}>
            <button
              className={`nav-link ${activeView === v.key ? 'active' : ''}`}
              onClick={() => setActiveView(v.key)}
            >
              {v.label}
            </button>
          </li>
        ))}
      </ul>

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border"></div></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {/* Summary row */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <div className="card stat-card stat-card-blue">
                <div className="card-body py-2">
                  <div className="text-muted small">Total Assets</div>
                  <div className="fs-4 fw-bold">{totalAssets}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card stat-card-red">
                <div className="card-body py-2">
                  <div className="text-muted small">Total OEM Cost</div>
                  <div className="fs-4 fw-bold text-danger">{fmtCurrency(totalOEM)}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card stat-card-green">
                <div className="card-body py-2">
                  <div className="text-muted small">Total Potential Savings</div>
                  <div className="fs-4 fw-bold text-success">{fmtCurrency(totalSavings)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">{view?.label}</h6>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => exportReport(activeView)}
            >
              <i className="bi bi-download me-1"></i>Export CSV
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-sm table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th style={{ textTransform: 'capitalize' }}>{view?.col?.replace('_', ' ')}</th>
                  <th className="text-center">Asset Count</th>
                  <th className="text-end">Total OEM Cost/yr</th>
                  <th className="text-end">Potential Savings</th>
                  <th className="text-end">Savings %</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => {
                  const savingsPct = row.total_oem_cost > 0
                    ? ((row.total_cost_avoidance / row.total_oem_cost) * 100).toFixed(1)
                    : '—'
                  return (
                    <tr key={idx}>
                      <td className="fw-semibold">{row[view.col] || '—'}</td>
                      <td className="text-center">{row.asset_count}</td>
                      <td className="text-end">{fmtCurrency(row.total_oem_cost)}</td>
                      <td className="text-end text-success">{fmtCurrency(row.total_cost_avoidance)}</td>
                      <td className="text-end">
                        {savingsPct !== '—' ? `${savingsPct}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
                {data.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted">No data</td></tr>
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="table-light fw-bold">
                  <tr>
                    <td>Total</td>
                    <td className="text-center">{totalAssets}</td>
                    <td className="text-end">{fmtCurrency(totalOEM)}</td>
                    <td className="text-end text-success">{fmtCurrency(totalSavings)}</td>
                    <td className="text-end">
                      {totalOEM > 0 ? `${((totalSavings / totalOEM) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  )
}
