// AssetFilter — filter dropdowns for the inventory view
import React from 'react';

const LOCATIONS = ['', 'Alhambra', 'Irvine'];
const STATUSES = ['', 'prod', 'nonprod'];

/**
 * @param {{filters: object, onChange: function, assets: object[]}} props
 */
function AssetFilter({ filters, onChange, assets = [] }) {
  // Derive unique values from current asset data
  const unique = (field) => ['', ...new Set(assets.map((a) => a[field]).filter(Boolean))];

  function handleChange(e) {
    onChange({ ...filters, [e.target.name]: e.target.value });
  }

  const selectStyle = { padding: '6px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '140px' };
  const labelStyle = { fontWeight: 500, marginRight: '4px', fontSize: '0.875rem' };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
      <label style={labelStyle}>
        Owner:
        <select name="owner" value={filters.owner || ''} onChange={handleChange} style={{ ...selectStyle, marginLeft: '4px' }}>
          {unique('owner').map((v) => <option key={v} value={v}>{v || 'All'}</option>)}
        </select>
      </label>

      <label style={labelStyle}>
        Application:
        <select name="application" value={filters.application || ''} onChange={handleChange} style={{ ...selectStyle, marginLeft: '4px' }}>
          {unique('application').map((v) => <option key={v} value={v}>{v || 'All'}</option>)}
        </select>
      </label>

      <label style={labelStyle}>
        Status:
        <select name="status" value={filters.status || ''} onChange={handleChange} style={{ ...selectStyle, marginLeft: '4px' }}>
          {STATUSES.map((v) => <option key={v} value={v}>{v || 'All'}</option>)}
        </select>
      </label>

      <label style={labelStyle}>
        Manufacturer:
        <select name="manufacturer" value={filters.manufacturer || ''} onChange={handleChange} style={{ ...selectStyle, marginLeft: '4px' }}>
          {unique('manufacturer').map((v) => <option key={v} value={v}>{v || 'All'}</option>)}
        </select>
      </label>

      <label style={labelStyle}>
        Support Group:
        <select name="supportGroupName" value={filters.supportGroupName || ''} onChange={handleChange} style={{ ...selectStyle, marginLeft: '4px' }}>
          {unique('supportGroupName').map((v) => <option key={v} value={v}>{v || 'All'}</option>)}
        </select>
      </label>

      <label style={labelStyle}>
        Location:
        <select name="location" value={filters.location || ''} onChange={handleChange} style={{ ...selectStyle, marginLeft: '4px' }}>
          {LOCATIONS.map((v) => <option key={v} value={v}>{v || 'All'}</option>)}
        </select>
      </label>
    </div>
  );
}

export default AssetFilter;
