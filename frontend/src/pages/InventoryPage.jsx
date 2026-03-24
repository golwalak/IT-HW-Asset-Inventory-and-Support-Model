// Full inventory page with filters and sortable table
import React, { useMemo, useState } from 'react';
import AssetTable from '../components/AssetTable';
import AssetFilter from '../components/AssetFilter';
import useAssets from '../hooks/useAssets';

function InventoryPage() {
  // Backend-side filters (owner, application, status)
  const { assets, loading, error, filters, setFilters, refetch } = useAssets();

  // Client-side additional filters (manufacturer, supportGroupName, location)
  const [localFilters, setLocalFilters] = useState({
    manufacturer: '',
    supportGroupName: '',
    location: '',
  });

  // Merge all filter state for the AssetFilter component
  const allFilters = { ...filters, ...localFilters };

  function handleFilterChange(updated) {
    // Split: backend filters vs local filters
    const { owner, application, status, ...local } = updated;
    setFilters({ owner: owner || '', application: application || '', status: status || '' });
    setLocalFilters(local);
  }

  // Apply local filters to fetched asset list
  const displayed = useMemo(() => {
    return assets.filter((a) => {
      if (localFilters.manufacturer && a.manufacturer !== localFilters.manufacturer) return false;
      if (localFilters.supportGroupName && a.supportGroupName !== localFilters.supportGroupName) return false;
      if (localFilters.location && a.location !== localFilters.location) return false;
      return true;
    });
  }, [assets, localFilters]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Asset Inventory</h1>

      <AssetFilter filters={allFilters} onChange={handleFilterChange} assets={assets} />

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#d32f2f' }}>Error: {error}</p>}
      {!loading && (
        <p style={{ color: '#555', marginBottom: '0.5rem' }}>
          Showing {displayed.length} of {assets.length} assets
        </p>
      )}

      <AssetTable assets={displayed} />

      <button
        onClick={refetch}
        style={{ marginTop: '1rem', padding: '6px 16px', cursor: 'pointer' }}
      >
        Refresh
      </button>
    </div>
  );
}

export default InventoryPage;
