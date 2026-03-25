import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import AssetStats from './components/AssetStats';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import ConfirmDialog from './components/ConfirmDialog';
import NotificationsPanel from './components/NotificationsPanel';
import SupportTierModal from './components/SupportTierModal';
import ReassignModal from './components/ReassignModal';
import { getAssets, getStats, createAsset, updateAsset, deleteAsset, updateSupportTier, reassignOwner } from './services/api';

function App() {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [tierAsset, setTierAsset] = useState(null);
  const [reassignAsset, setReassignAsset] = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [assetResp, statsResp] = await Promise.all([getAssets({ limit: 500 }), getStats()]);
      setAssets(Array.isArray(assetResp?.data) ? assetResp.data : []);
      setStats(statsResp || null);
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

  const handleTierSave = async (id, tier) => {
    try {
      setError(null);
      await updateSupportTier(id, tier);
      setTierAsset(null);
      await fetchAssets();
    } catch {
      setError('Failed to update support tier. Please try again.');
    }
  };

  const handleReassignSave = async (id, data) => {
    try {
      setError(null);
      await reassignOwner(id, data);
      setReassignAsset(null);
      await fetchAssets();
    } catch {
      setError('Failed to reassign ownership. Please try again.');
    }
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
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            className="btn"
            style={{ background: activeTab === 'inventory' ? '#0d6efd' : '#e9ecef', color: activeTab === 'inventory' ? '#fff' : '#222' }}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className="btn"
            style={{ background: activeTab === 'workflow' ? '#0d6efd' : '#e9ecef', color: activeTab === 'workflow' ? '#fff' : '#222' }}
            onClick={() => setActiveTab('workflow')}
          >
            Support Workflow & Notifications
          </button>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading assets...</div>
        ) : (
          activeTab === 'inventory' ? (
            <>
              <AssetStats assets={assets} stats={stats} />
              <AssetList
                assets={assets}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onTier={(a) => setTierAsset(a)}
                onReassign={(a) => setReassignAsset(a)}
              />
            </>
          ) : (
            <NotificationsPanel />
          )
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

      {tierAsset && (
        <SupportTierModal
          asset={tierAsset}
          onSave={handleTierSave}
          onCancel={() => setTierAsset(null)}
        />
      )}

      {reassignAsset && (
        <ReassignModal
          asset={reassignAsset}
          onSave={handleReassignSave}
          onCancel={() => setReassignAsset(null)}
        />
      )}
    </div>
  );
}

export default App;
