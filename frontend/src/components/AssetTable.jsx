// Sortable asset inventory table
import React, { useState } from 'react';
import SupportTierBadge from './SupportTierBadge';
import { formatDate, formatCurrency } from '../utils/formatters';

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  background: '#1a73e8',
  color: '#fff',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const tdStyle = { padding: '7px 12px', borderBottom: '1px solid #e0e0e0', fontSize: '0.875rem' };

const COLUMNS = [
  { key: 'assetName', label: 'Asset Name' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'model', label: 'Model' },
  { key: 'location', label: 'Location' },
  { key: 'ageMonths', label: 'Age (mo)' },
  { key: 'supportGroupName', label: 'Support Group' },
  { key: 'status', label: 'Status' },
  { key: 'warrantyEndDate', label: 'Warranty End' },
  { key: 'tier', label: 'Support Tier' },
  { key: 'oemCostAnnual', label: 'OEM Cost' },
  { key: 'costAvoidance', label: 'Cost Avoidance' },
];

function AssetTable({ assets = [] }) {
  const [sortKey, setSortKey] = useState('assetName');
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // Derive tier from asset fields
  function getTier(a) {
    if (a.getSupportTier) return a.getSupportTier();
    // Fallback for plain objects
    const yes = (v) => String(v).toLowerCase() === 'yes';
    if (yes(a.tier1_7x24)) return 'Tier1';
    if (yes(a.tier2_nbdSave7pct)) return 'Tier2';
    if (yes(a.tier3_noneSave100pct)) return 'Tier3';
    if (yes(a.tier4_3rdPartySave80pct)) return 'Tier4';
    return 'Unknown';
  }

  const sorted = [...assets].sort((a, b) => {
    let va = sortKey === 'tier' ? getTier(a) : (a[sortKey] ?? '');
    let vb = sortKey === 'tier' ? getTier(b) : (b[sortKey] ?? '');
    // Numeric sort for age and costs
    if (['ageMonths', 'oemCostAnnual', 'costAvoidance'].includes(sortKey)) {
      va = parseFloat(va) || 0;
      vb = parseFloat(vb) || 0;
    } else {
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} style={thStyle} onClick={() => handleSort(col.key)}>
                {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} style={{ ...tdStyle, textAlign: 'center', color: '#757575' }}>
                No assets found.
              </td>
            </tr>
          ) : (
            sorted.map((asset) => {
              const tier = getTier(asset);
              return (
                <tr key={asset.assetNumber} style={{ background: '#fff' }}>
                  <td style={tdStyle}>{asset.assetName}</td>
                  <td style={tdStyle}>{asset.manufacturer}</td>
                  <td style={tdStyle}>{asset.model}</td>
                  <td style={tdStyle}>{asset.location}</td>
                  <td style={tdStyle}>{asset.ageMonths}</td>
                  <td style={tdStyle}>{asset.supportGroupName}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
                      background: asset.status === 'prod' ? '#e3f2fd' : '#f3e5f5',
                      color: asset.status === 'prod' ? '#1565c0' : '#6a1b9a',
                    }}>
                      {asset.status || '—'}
                    </span>
                  </td>
                  <td style={tdStyle}>{formatDate(asset.warrantyEndDate)}</td>
                  <td style={tdStyle}><SupportTierBadge tier={tier} /></td>
                  <td style={tdStyle}>{formatCurrency(asset.oemCostAnnual)}</td>
                  <td style={tdStyle}>{formatCurrency(asset.costAvoidance)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AssetTable;
