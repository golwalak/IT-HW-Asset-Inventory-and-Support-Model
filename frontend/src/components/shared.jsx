import React from 'react'

export function TierBadge({ tier }) {
  const classes = {
    'Tier 1': 'badge bg-primary',
    'Tier 2': 'badge bg-success',
    'Tier 3': 'badge bg-secondary',
    'Tier 4': 'badge bg-warning text-dark',
  }
  return <span className={classes[tier] || 'badge bg-secondary'}>{tier || '—'}</span>
}

export function WarrantyBadge({ status, days }) {
  if (status === 'expired') {
    return <span className="badge bg-danger">Expired</span>
  }
  if (status === 'expiring_soon') {
    return <span className="badge bg-warning text-dark">Expiring in {days}d</span>
  }
  if (status === 'active') {
    return <span className="badge bg-success">Active</span>
  }
  return <span className="badge bg-secondary">Unknown</span>
}

export function fmtCurrency(val) {
  if (val == null) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

export function fmtDate(val) {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return val
  }
}
