// Visual badge component showing the support tier with colour coding
import React from 'react';
import { formatTier } from '../utils/formatters';

const TIER_COLORS = {
  Tier1: { background: '#d32f2f', color: '#fff' },
  Tier2: { background: '#f57c00', color: '#fff' },
  Tier3: { background: '#388e3c', color: '#fff' },
  Tier4: { background: '#1565c0', color: '#fff' },
  Unknown: { background: '#757575', color: '#fff' },
};

function SupportTierBadge({ tier }) {
  const style = {
    ...(TIER_COLORS[tier] || TIER_COLORS.Unknown),
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    display: 'inline-block',
  };
  return <span style={style}>{formatTier(tier)}</span>;
}

export default SupportTierBadge;
