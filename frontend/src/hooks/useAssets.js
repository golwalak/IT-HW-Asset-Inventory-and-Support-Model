// Custom hook — loads assets from the backend and exposes filter state
import { useState, useEffect, useCallback } from 'react';
import { getAssets } from '../services/api';

/**
 * @param {{owner?:string, application?:string, status?:string}} initialFilters
 */
function useAssets(initialFilters = {}) {
  const [assets, setAssets] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(() => {
    setLoading(true);
    setError(null);
    getAssets(filters)
      .then((data) => setAssets(data))
      .catch((err) => setError(err.message || 'Failed to load assets'))
      .finally(() => setLoading(false));
  }, [filters]);

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, filters, setFilters, refetch: fetchAssets };
}

export default useAssets;
