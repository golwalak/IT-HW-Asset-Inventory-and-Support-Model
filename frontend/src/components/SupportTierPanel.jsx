import React, { useState, useEffect } from 'react'
import { getTierSummary, getAssets } from '../services/api'
import { TierBadge, fmtCurrency } from './shared'

export default function SupportTierPanel({ dataLoaded }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!dataLoaded) return
    setLoading(true)
    getTierSummary()
      .then(res => setSummary(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load tier summary.'))
      .finally(() => setLoading(false))
  }, [dataLoaded])

  if (!dataLoaded) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Please upload a CSV file to view the support tier analysis.
      </div>
    )
  }

  if (loading) return <div className="text-center py-4"><div className="spinner-border" role="status"></div></div>
  if (error) return <div className="alert alert-danger">{error}</div>
  if (!summary) return null

  const { assets_by_tier, total_oem_cost, total_potential_cost_avoidance, total_assets } = summary

  const tierDefs = [
    {
      tier: 'Tier 1',
      name: '7x24 OEM',
      description: 'Full OEM support. 24/7/365 coverage. Baseline cost.',
      savings: '0%',
      count: assets_by_tier['Tier 1'] || 0,
      color: 'primary',
    },
    {
      tier: 'Tier 2',
      name: 'Next Business Day (NBD)',
      description: 'OEM support but Next Business Day response. ~7% savings.',
      savings: '7%',
      count: assets_by_tier['Tier 2'] || 0,
      color: 'success',
    },
    {
      tier: 'Tier 3',
      name: 'No Contract',
      description: 'Self-support / no vendor contract. 100% savings.',
      savings: '100%',
      count: assets_by_tier['Tier 3'] || 0,
      color: 'secondary',
    },
    {
      tier: 'Tier 4',
      name: '3rd Party 7x24',
      description: 'Third-party support provider. 24/7/365 coverage. ~80% savings vs OEM.',
      savings: '80%',
      count: assets_by_tier['Tier 4'] || 0,
      color: 'warning',
    },
  ]

  return (
    <div>
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card stat-card stat-card-blue h-100">
            <div className="card-body">
              <div className="text-muted small">Total Assets</div>
              <div className="display-6 fw-bold">{total_assets}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card stat-card-red h-100">
            <div className="card-body">
              <div className="text-muted small">Total OEM Cost (Tier 1 Baseline)</div>
              <div className="fs-4 fw-bold text-danger">{fmtCurrency(total_oem_cost)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card stat-card-green h-100">
            <div className="card-body">
              <div className="text-muted small">Total Potential Cost Avoidance</div>
              <div className="fs-4 fw-bold text-success">{fmtCurrency(total_potential_cost_avoidance)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card stat-card-yellow h-100">
            <div className="card-body">
              <div className="text-muted small">Savings Rate (if all recommended tiers applied)</div>
              <div className="fs-4 fw-bold text-warning">
                {total_oem_cost > 0
                  ? `${((total_potential_cost_avoidance / total_oem_cost) * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Breakdown */}
      <h5 className="mb-3">Assets by Support Tier</h5>
      <div className="row g-3 mb-4">
        {tierDefs.map(({ tier, name, description, savings, count, color }) => (
          <div key={tier} className="col-md-3">
            <div className={`card border-${color} h-100`}>
              <div className={`card-header bg-${color} ${color === 'warning' ? 'text-dark' : 'text-white'} d-flex justify-content-between`}>
                <span><TierBadge tier={tier} /></span>
                <strong>{name}</strong>
              </div>
              <div className="card-body">
                <div className="display-6 fw-bold mb-1">{count}</div>
                <div className="small text-muted mb-2">{description}</div>
                <div className="badge bg-light text-dark border">
                  <i className="bi bi-piggy-bank me-1"></i>Savings: {savings}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tier Recommendation Logic Explanation */}
      <div className="card shadow-sm">
        <div className="card-header">
          <i className="bi bi-lightbulb me-2"></i>
          Tier Recommendation Logic
        </div>
        <div className="card-body">
          <table className="table table-sm table-bordered">
            <thead className="table-light">
              <tr>
                <th>Condition</th>
                <th>Recommended Tier</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Non-prod AND age &gt; 60 months</td>
                <td><TierBadge tier="Tier 3" /></td>
                <td>Old non-production assets have low criticality; eliminate support cost</td>
              </tr>
              <tr>
                <td>Non-prod AND age ≤ 60 months</td>
                <td><TierBadge tier="Tier 2" /></td>
                <td>Newer non-prod assets need NBD support for development</td>
              </tr>
              <tr>
                <td>Prod AND age &gt; 84 months</td>
                <td><TierBadge tier="Tier 4" /></td>
                <td>Old prod assets: OEM may not support; use 3rd party for cost savings</td>
              </tr>
              <tr>
                <td>Prod AND warranty still active</td>
                <td><TierBadge tier="Tier 1" /></td>
                <td>Warranty active — leverage OEM support at no additional cost</td>
              </tr>
              <tr>
                <td>Otherwise (prod, warranty expired, &lt; 84 months old)</td>
                <td><TierBadge tier="Tier 2" /></td>
                <td>NBD support provides cost savings while maintaining reasonable SLA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
