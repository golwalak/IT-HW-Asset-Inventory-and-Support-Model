import React, { useMemo } from 'react';

const STATUS_COLORS = {
  Active: '#28a745',
  'In Storage': '#ffc107',
  'Under Repair': '#fd7e14',
  Retired: '#6c757d',
  Disposed: '#dc3545',
};

export default function AssetList({ assets, onEdit, onDelete, onAdd }) {
  const [filterType, setFilterType] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const [filterOwner, setFilterOwner] = React.useState('');
  const [filterApp, setFilterApp] = React.useState('');

  const uniqueValues = (key) => [...new Set(assets.map((a) => a[key]).filter(Boolean))].sort();

  const filtered = useMemo(
    () =>
      assets.filter(
        (a) =>
          (!filterType || a.type === filterType) &&
          (!filterStatus || a.status === filterStatus) &&
          (!filterOwner || a.owner === filterOwner) &&
          (!filterApp || a.application === filterApp)
      ),
    [assets, filterType, filterStatus, filterOwner, filterApp]
  );

  return (
    <div className="asset-list-section">
      <div className="list-header">
        <h2>Assets</h2>
        <button className="btn btn-primary" onClick={onAdd}>
          + Add New Asset
        </button>
      </div>

      <div className="filters">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {uniqueValues('type').map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {uniqueValues('status').map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
          <option value="">All Owners</option>
          {uniqueValues('owner').map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select value={filterApp} onChange={(e) => setFilterApp(e.target.value)}>
          <option value="">All Applications</option>
          {uniqueValues('application').map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="asset-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Name</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Application</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">No assets found.</td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <tr key={asset._id || asset.id}>
                  <td>{asset.assetTag}</td>
                  <td>{asset.name}</td>
                  <td>{asset.type}</td>
                  <td>{asset.owner}</td>
                  <td>{asset.application}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: STATUS_COLORS[asset.status] || '#999',
                      }}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.location}</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => onEdit(asset)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => onDelete(asset)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
