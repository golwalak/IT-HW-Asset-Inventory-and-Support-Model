import React, { useState } from 'react';
import { searchDirectoryUsers, getDirectoryManager } from '../services/api';

export default function ReassignModal({ asset, onSave, onCancel }) {
  const [form, setForm] = useState({
    owner:        asset.owner        || '',
    ownerEmail:   asset.ownerEmail   || '',
    manager:      asset.manager      || '',
    managerEmail: asset.managerEmail || '',
  });
  const [saving, setSaving] = useState(false);
  const [lookup, setLookup] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const doLookup = async () => {
    if (!lookup.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    setLookupError('');
    try {
      const data = await searchDirectoryUsers(lookup.trim(), 8);
      setResults(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      setLookupError(error?.response?.data?.message || 'Directory lookup failed');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectUser = async (u) => {
    setForm((f) => ({
      ...f,
      owner: u.displayName || f.owner,
      ownerEmail: u.mail || u.userPrincipalName || f.ownerEmail,
    }));

    // If mock provider already returns manager in payload, apply it.
    if (u.managerName || u.managerEmail) {
      setForm((f) => ({
        ...f,
        owner: u.displayName || f.owner,
        ownerEmail: u.mail || u.userPrincipalName || f.ownerEmail,
        manager: u.managerName || f.manager,
        managerEmail: u.managerEmail || f.managerEmail,
      }));
      return;
    }

    const managerKey = u.userPrincipalName || u.mail || u.id;
    if (!managerKey) return;

    try {
      const mgrResp = await getDirectoryManager(managerKey);
      const mgr = mgrResp?.manager;
      if (mgr) {
        setForm((f) => ({
          ...f,
          manager: mgr.displayName || f.manager,
          managerEmail: mgr.mail || mgr.userPrincipalName || f.managerEmail,
        }));
      }
    } catch (_err) {
      // Manager lookup is best-effort; user can still enter manually.
    }
  };

  const handleSave = async () => {
    if (!form.owner.trim()) return;
    setSaving(true);
    await onSave(asset.id, form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Reassign Ownership — {asset.name}</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>Asset Tag: <strong>{asset.assetTag}</strong></p>

        <div className="form-grid">
          <label className="full-width">
            Directory Lookup (AD / Entra)
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
                placeholder="Search by owner name or email"
              />
              <button type="button" className="btn btn-secondary" onClick={doLookup} disabled={searching}>
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>
            {lookupError && <div style={{ color: '#b42318', fontSize: '0.8rem', marginTop: '0.3rem' }}>{lookupError}</div>}
            {results.length > 0 && (
              <div style={{ border: '1px solid #ddd', borderRadius: '6px', marginTop: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
                {results.map((u) => (
                  <button
                    key={u.id || u.userPrincipalName || u.mail}
                    type="button"
                    onClick={() => selectUser(u)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', border: 'none', borderBottom: '1px solid #f0f0f0', background: '#fff', cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 600 }}>{u.displayName || 'Unknown User'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{u.mail || u.userPrincipalName || 'No email'}</div>
                  </button>
                ))}
              </div>
            )}
          </label>

          <label>
            New Owner Name *
            <input name="owner" value={form.owner} onChange={handle} required placeholder="First Last" />
          </label>
          <label>
            Owner Email
            <input name="ownerEmail" value={form.ownerEmail} onChange={handle} type="email" placeholder="owner@company.com" />
          </label>
          <label>
            Manager Name
            <input name="manager" value={form.manager} onChange={handle} placeholder="First Last" />
          </label>
          <label>
            Manager Email
            <input name="managerEmail" value={form.managerEmail} onChange={handle} type="email" placeholder="manager@company.com" />
          </label>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.75rem' }}>
          In production, owner/manager lookup will be sourced from Active Directory / MS Graph.
        </p>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.owner.trim()}>
            {saving ? 'Saving…' : 'Reassign'}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
