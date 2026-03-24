import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import AssetStats from './components/AssetStats';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import ConfirmDialog from './components/ConfirmDialog';
import { getAssets, createAsset, updateAsset, deleteAsset } from './services/api';

function App() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load assets. Please check that the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleAdd = () => {
    setEditingAsset(null);
    setShowForm(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    try {
      setError(null);
      const id = editingAsset?._id || editingAsset?.id;
      if (id) {
        await updateAsset(id, formData);
      } else {
        await createAsset(formData);
      }
      setShowForm(false);
      setEditingAsset(null);
      await fetchAssets();
    } catch (err) {
      setError('Failed to save asset. Please try again.');
    }
  };

  const handleDeleteRequest = (asset) => {
    setDeletingAsset(asset);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      const id = deletingAsset._id || deletingAsset.id;
      await deleteAsset(id);
      setDeletingAsset(null);
      await fetchAssets();
    } catch (err) {
      setError('Failed to delete asset. Please try again.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>IT Hardware Asset Inventory</h1>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            {error}
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading assets...</div>
        ) : (
          <>
            <AssetStats assets={assets} />
            <AssetList
              assets={assets}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          </>
        )}
      </main>

      {showForm && (
        <AssetForm
          asset={editingAsset}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingAsset(null);
          }}
        />
      )}

      {deletingAsset && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deletingAsset.name}" (${deletingAsset.assetTag})?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingAsset(null)}
        />
      )}
    </div>
  );
}

export default App;
