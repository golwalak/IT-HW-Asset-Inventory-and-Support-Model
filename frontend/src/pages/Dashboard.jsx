// Dashboard page — summary cards and upload widget
import React, { useEffect, useState } from 'react';
import { getCostAvoidanceSummary } from '../services/api';
import { formatCurrency, isWarrantyExpiringSoon } from '../utils/formatters';
import CostSummary from '../components/CostSummary';
import UploadCSV from '../components/UploadCSV';
import useAssets from '../hooks/useAssets';

const cardStyle = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '1rem 1.5rem',
  minWidth: '180px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

const cardTitleStyle = { margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#666' };
const cardValueStyle = { margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#1a73e8' };

function StatCard({ title, value }) {
  return (
    <div style={cardStyle}>
      <p style={cardTitleStyle}>{title}</p>
      <p style={cardValueStyle}>{value}</p>
    </div>
  );
}

function Dashboard() {
  const { assets, loading, error, refetch } = useAssets();
  const [summary, setSummary] = useState(null);

  // Fetch cost avoidance summary
  useEffect(() => {
    getCostAvoidanceSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [assets]);

  const prodCount = assets.filter((a) => a.status === 'prod').length;
  const nonprodCount = assets.filter((a) => a.status === 'nonprod').length;
  const expiringCount = assets.filter((a) => isWarrantyExpiringSoon(a.warrantyEndDate, 12)).length;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>

      {loading && <p>Loading assets…</p>}
      {error && <p style={{ color: '#d32f2f' }}>Error: {error}</p>}

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <StatCard title="Total Assets" value={assets.length} />
        <StatCard title="Production" value={prodCount} />
        <StatCard title="Non-Production" value={nonprodCount} />
        <StatCard title="Warranty Expiring (12 mo)" value={expiringCount} />
        {summary && (
          <StatCard title="Total Cost Avoidance" value={formatCurrency(summary.totalCostAvoidance)} />
        )}
      </div>

      {/* Cost avoidance detail card */}
      {summary && (
        <div style={{ marginBottom: '1.5rem' }}>
          <CostSummary
            totalOemCost={summary.totalOemCost}
            totalCostAvoidance={summary.totalCostAvoidance}
            savingsPct={summary.savingsPct}
          />
        </div>
      )}

      {/* Placeholder chart area */}
      <div style={{
        background: '#f5f5f5', border: '1px dashed #bdbdbd', borderRadius: '8px',
        padding: '2rem', textAlign: 'center', color: '#9e9e9e', marginBottom: '1.5rem',
      }}>
        📊 Chart placeholder — integrate a charting library (e.g., Recharts) here to visualize
        tier breakdown, age distribution, or cost avoidance by group.
      </div>

      {/* CSV upload */}
      <UploadCSV onUploadSuccess={refetch} />
    </div>
  );
}

export default Dashboard;
