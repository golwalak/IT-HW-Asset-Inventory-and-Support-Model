import React from 'react'
import { TierBadge, WarrantyBadge, fmtCurrency, fmtDate } from './shared'

export default function AssetDetailModal({ asset, onClose }) {
  if (!asset) return null

  const fields = [
    ['Asset Name', asset['Asset Name']],
    ['Asset Number', asset['Asset Number']],
    ['Serial Number', asset['Serial Number']],
    ['Material Name', asset['Material Name']],
    ['Type', asset['Type']],
    ['Manufacturer', asset['Manufacturer']],
    ['Model', asset['Model']],
    ['Material Category', asset['Material Category Name']],
    ['ETS Std HW Category', asset['ETS Std HW Category']],
    ['Record Status', asset['Record Status']],
    ['Location', asset['Location']],
    ['Cabinet Name', asset['Cabinet Name']],
    ['Cabinet U Number', asset['Cabinet U Number']],
    ['Creation Date', fmtDate(asset['Creation Date'])],
    ['Operational Date', fmtDate(asset['Operational Date'])],
    ['Decommission Date', fmtDate(asset['Decommission Date'])],
    ['Support Group', asset['Support Group Name']],
    ['Warranty Start', fmtDate(asset['Warranty Start Date'])],
    ['Warranty End', fmtDate(asset['Warranty End Date'])],
    ['In TCS Scope', asset['In TCS Scope']],
    ['Project', asset['Project']],
    ['PO Number', asset['PO Number']],
    ['Age (months)', asset['age (mo)']],
    ['Application', asset['application (mock)']],
    ['Owner', asset['Owner (mock)']],
    ['Prod/Nonprod', asset['status (prod or nonprod) (mock)']],
    ['OEM Annual Cost', fmtCurrency(asset.oem_cost)],
    ['Ring Fenced', asset['Ring Fenced']],
  ]

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-server me-2"></i>
              {asset['Asset Name'] || 'Asset Detail'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Support Tier Section */}
            <div className="row mb-3 g-3">
              <div className="col-md-4">
                <div className="card h-100 border-primary">
                  <div className="card-body text-center">
                    <div className="text-muted small mb-1">Current Tier</div>
                    <TierBadge tier={asset.current_tier} />
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-success">
                  <div className="card-body text-center">
                    <div className="text-muted small mb-1">Recommended Tier</div>
                    <TierBadge tier={asset.recommended_tier} />
                    <div className="small text-muted mt-1">
                      {asset.current_tier !== asset.recommended_tier ? (
                        <span className="text-success">
                          <i className="bi bi-arrow-down-circle me-1"></i>Optimization opportunity
                        </span>
                      ) : (
                        <span className="text-success">
                          <i className="bi bi-check-circle me-1"></i>Optimally tiered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-warning">
                  <div className="card-body text-center">
                    <div className="text-muted small mb-1">Warranty Status</div>
                    <WarrantyBadge
                      status={asset.warranty_status}
                      days={asset.days_to_warranty_expiry}
                    />
                    <div className="small text-muted mt-1">
                      {asset.days_to_warranty_expiry != null
                        ? asset.days_to_warranty_expiry < 0
                          ? `Expired ${Math.abs(asset.days_to_warranty_expiry)} days ago`
                          : `${asset.days_to_warranty_expiry} days remaining`
                        : 'No warranty date'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="row mb-3 g-3">
              <div className="col-md-4">
                <div className="card stat-card stat-card-blue">
                  <div className="card-body py-2">
                    <div className="text-muted small">OEM Annual Cost (Tier 1)</div>
                    <div className="fw-bold fs-5">{fmtCurrency(asset.oem_cost)}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card stat-card stat-card-green">
                  <div className="card-body py-2">
                    <div className="text-muted small">Cost Avoidance (Recommended)</div>
                    <div className="fw-bold fs-5 text-success">
                      {fmtCurrency(asset.cost_avoidance_recommended)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card stat-card stat-card-yellow">
                  <div className="card-body py-2">
                    <div className="text-muted small">Tier Recommendation Basis</div>
                    <div className="small">
                      {asset['status (prod or nonprod) (mock)'] === 'nonprod'
                        ? `Non-prod, ${asset['age (mo)']} mo old`
                        : `Prod, ${asset['age (mo)']} mo old`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* All Fields */}
            <h6 className="border-bottom pb-1 mb-2">Asset Details</h6>
            <div className="row g-2">
              {fields.map(([label, value]) => (
                <div key={label} className="col-md-6">
                  <div className="d-flex">
                    <span className="text-muted small me-2 text-nowrap" style={{ minWidth: 150 }}>{label}:</span>
                    <span className="small fw-semibold">{value ?? '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
