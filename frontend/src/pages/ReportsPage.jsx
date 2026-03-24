// Reports page — grouped by Application (default) or Owner
import React, { useEffect, useState } from 'react';
import { getReportByApplication, getReportByOwner } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import SupportTierBadge from '../components/SupportTierBadge';

const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.875rem' };
const thStyle = { padding: '8px 12px', textAlign: 'left', background: '#1a73e8', color: '#fff' };
const tdStyle = { padding: '7px 12px', borderBottom: '1px solid #e0e0e0' };

const TIERS = ['Tier1', 'Tier2', 'Tier3', 'Tier4', 'Unknown'];

function ReportsPage() {
  const [groupBy, setGroupBy] = useState('application'); // 'application' | 'owner'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetcher = groupBy === 'application' ? getReportByApplication : getReportByOwner;
    fetcher()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [groupBy]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Reports</h1>

      {/* Toggle group-by */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <span style={{ fontWeight: 500, alignSelf: 'center' }}>Group by:</span>
        {['application', 'owner'].map((val) => (
          <button
            key={val}
            onClick={() => setGroupBy(val)}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #1a73e8',
              background: groupBy === val ? '#1a73e8' : '#fff',
              color: groupBy === val ? '#fff' : '#1a73e8',
              fontWeight: 500,
            }}
          >
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#d32f2f' }}>Error: {error}</p>}

      {!loading && data.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>{groupBy === 'application' ? 'Application' : 'Owner'}</th>
              <th style={thStyle}>Asset Count</th>
              <th style={thStyle}>Total OEM Cost</th>
              <th style={thStyle}>Total Cost Avoidance</th>
              {TIERS.map((t) => (
                <th key={t} style={thStyle}><SupportTierBadge tier={t} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{row.name}</td>
                <td style={tdStyle}>{row.count}</td>
                <td style={tdStyle}>{formatCurrency(row.totalOemCost)}</td>
                <td style={{ ...tdStyle, color: '#388e3c', fontWeight: 600 }}>
                  {formatCurrency(row.totalCostAvoidance)}
                </td>
                {TIERS.map((t) => (
                  <td key={t} style={tdStyle}>{row.tierBreakdown?.[t] ?? 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && data.length === 0 && !error && (
        <p style={{ color: '#757575' }}>No data available.</p>
      )}
    </div>
  );
}

export default ReportsPage;
