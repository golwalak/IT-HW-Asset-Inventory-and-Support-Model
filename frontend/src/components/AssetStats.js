import React from 'react';

const STATUS_COLORS = {
  Active: '#28a745',
  'In Storage': '#ffc107',
  'Under Repair': '#fd7e14',
  Retired: '#6c757d',
  Disposed: '#dc3545',
};

export default function AssetStats({ assets }) {
  const total = assets.length;

  const typeCounts = assets.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});

  const statusCounts = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="stats-section">
      <div className="stats-total">
        <h2>{total}</h2>
        <p>Total Assets</p>
      </div>

      <div className="stats-group">
        <h3>By Type</h3>
        <div className="stats-cards">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div className="stats-card" key={type}>
              <span className="stats-count">{count}</span>
              <span className="stats-label">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-group">
        <h3>By Status</h3>
        <div className="stats-cards">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              className="stats-card"
              key={status}
              style={{ borderLeft: `4px solid ${STATUS_COLORS[status] || '#999'}` }}
            >
              <span className="stats-count">{count}</span>
              <span className="stats-label">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
