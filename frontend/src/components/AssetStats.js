import React from 'react';

const TIER_COLORS = {
  Tier1: '#dc3545',
  Tier2: '#fd7e14',
  Tier3: '#28a745',
  Tier4: '#0d6efd',
};

export default function AssetStats({ assets, stats }) {
  const total = stats?.total ?? assets.length;
  const expiringSoon = stats?.expiringSoon ?? 0;
  const notifPending = stats?.notifPending ?? 0;
  const tierSavings = stats?.tierSavings ?? [];

  return (
    <div className="stats-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{total.toLocaleString()}</div>
          <div className="stat-label">Total Assets</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #fd7e14' }}>
          <div className="stat-number" style={{ color: '#fd7e14' }}>{expiringSoon}</div>
          <div className="stat-label">Expiring in 6 Mo</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #dc3545' }}>
          <div className="stat-number" style={{ color: '#dc3545' }}>{notifPending}</div>
          <div className="stat-label">Notifications Pending</div>
        </div>
        {Object.entries(stats?.byType || {}).map(([type, cnt]) => (
          <div key={type} className="stat-card">
            <div className="stat-number">{cnt}</div>
            <div className="stat-label">{type}</div>
          </div>
        ))}
      </div>

      {tierSavings.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Support Tier Distribution &amp; Cost Avoidance Opportunity</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {tierSavings.map((t) => (
              <div
                key={t.tier}
                style={{
                  border: `2px solid ${TIER_COLORS[t.tier] || '#999'}`,
                  borderRadius: '8px',
                  padding: '0.75rem 1.25rem',
                  minWidth: '200px',
                  background: `${TIER_COLORS[t.tier] || '#999'}10`,
                }}
              >
                <div style={{ fontWeight: 700, color: TIER_COLORS[t.tier] || '#333', fontSize: '1rem' }}>{t.tier}</div>
                <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.25rem' }}>{t.label}</div>
                <div><strong>{t.count.toLocaleString()}</strong> assets</div>
                {t.totalOem > 0 && (
                  <>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>OEM Annual: ${t.totalOem.toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#28a745', fontWeight: 600 }}>Potential Savings: ${t.costAvoid.toLocaleString()}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
