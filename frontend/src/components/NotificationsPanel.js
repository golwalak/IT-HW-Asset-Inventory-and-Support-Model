import React, { useState, useEffect, useCallback } from 'react';
import { getExpiringSoon, updateSupportTier, reassignOwner, sendNotifications } from '../services/api';
import SupportTierModal from './SupportTierModal';
import ReassignModal    from './ReassignModal';

const TIER_COLORS = {
  Tier1: '#dc3545',
  Tier2: '#fd7e14',
  Tier3: '#28a745',
  Tier4: '#0d6efd',
};

export default function NotificationsPanel() {
  const [assets,  setAssets]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState(null);
  const [tierAsset,    setTierAsset]    = useState(null);
  const [reassignAsset, setReassignAsset] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpiringSoon(6);
      setAssets(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSendAll = async () => {
    setSending(true);
    setResult(null);
    try {
      const r = await sendNotifications(6);
      setResult({ type: 'success', msg: `Sent ${r.sent} notification email(s).` });
      load();
    } catch {
      setResult({ type: 'error', msg: 'Failed to send notifications.' });
    } finally {
      setSending(false);
    }
  };

  const handleTierSave = async (id, supportTier) => {
    await updateSupportTier(id, supportTier);
    setTierAsset(null);
    load();
  };

  const handleReassignSave = async (id, data) => {
    await reassignOwner(id, data);
    setReassignAsset(null);
    load();
  };

  const pending = assets.filter(a => !a.notificationSent);
  const sent    = assets.filter(a =>  a.notificationSent);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Expiring Within 6 Months</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
            {pending.length} pending notification(s) · {sent.length} already notified
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSendAll}
          disabled={sending || pending.length === 0}
        >
          {sending ? 'Sending…' : `Send Notifications (${pending.length})`}
        </button>
      </div>

      {result && (
        <div
          style={{
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            background: result.type === 'success' ? '#d1e7dd' : '#f8d7da',
            color:      result.type === 'success' ? '#0f5132' : '#842029',
            border:     result.type === 'success' ? '1px solid #badbcc' : '1px solid #f5c2c7',
          }}
        >
          {result.msg}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : assets.length === 0 ? (
        <p style={{ color: '#888' }}>No assets expiring within 6 months.</p>
      ) : (
        <div className="table-wrapper">
          <table className="asset-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Name</th>
                <th>Owner</th>
                <th>Manager</th>
                <th>Warranty Expiry</th>
                <th>Current Tier</th>
                <th>Notified</th>
                <th>Acknowledged</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id} style={{ background: a.notificationSent ? '#f8fff8' : '#fff' }}>
                  <td>{a.assetTag}</td>
                  <td>{a.name}</td>
                  <td>
                    <div>{a.owner}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{a.ownerEmail}</div>
                  </td>
                  <td>
                    <div>{a.manager}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{a.managerEmail}</div>
                  </td>
                  <td style={{ color: '#dc3545', fontWeight: 600 }}>{a.warrantyExpiry}</td>
                  <td>
                    <span
                      style={{
                        background: TIER_COLORS[a.supportTier] || '#999',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      {a.supportTier}
                    </span>
                  </td>
                  <td>{a.notificationSent ? '✅ ' + (a.notificationDate?.slice(0,10) || '') : '⏳ Pending'}</td>
                  <td>{a.ownerAcknowledged ? '✅ ' + (a.acknowledgedDate?.slice(0,10) || '') : '—'}</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => setTierAsset(a)}>
                      Change Tier
                    </button>
                    <button className="btn btn-sm" style={{ background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setReassignAsset(a)}>
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tierAsset    && <SupportTierModal asset={tierAsset}    onSave={handleTierSave}    onCancel={() => setTierAsset(null)}    />}
      {reassignAsset && <ReassignModal    asset={reassignAsset} onSave={handleReassignSave} onCancel={() => setReassignAsset(null)} />}
    </div>
  );
}
