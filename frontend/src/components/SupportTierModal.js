import React, { useState } from 'react';

const TIERS = [
  { value: 'Tier1', label: '7×24 OEM (Current)',          save: '0%',  badge: '#dc3545', desc: 'Full OEM support, 4-hr onsite break/fix. No savings.' },
  { value: 'Tier2', label: 'NBD — Next Business Day',      save: '~7%', badge: '#fd7e14', desc: 'Next Business Day response. Suitable for non-critical assets.' },
  { value: 'Tier3', label: 'No Extended Support',          save: '~100%', badge: '#28a745', desc: 'No contract. Self-support or retire. Maximum savings.' },
  { value: 'Tier4', label: '7×24 3rd Party',               save: '~80%', badge: '#0d6efd', desc: 'Third-party 24/7 coverage. Significant savings vs OEM.' },
];

export default function SupportTierModal({ asset, onSave, onCancel }) {
  const [selected, setSelected] = useState(asset.supportTier || 'Tier1');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(asset.id, selected);
    setSaving(false);
  };

  const current = TIERS.find(t => t.value === asset.supportTier) || TIERS[0];
  const chosen  = TIERS.find(t => t.value === selected) || TIERS[0];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-wide" onClick={e => e.stopPropagation()}>
        <h2>Support Model — {asset.name}</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Asset Tag: <strong>{asset.assetTag}</strong> &nbsp;|&nbsp;
          Warranty Expiry: <strong>{asset.warrantyExpiry || 'N/A'}</strong> &nbsp;|&nbsp;
          Owner: <strong>{asset.owner}</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {TIERS.map(tier => (
            <label
              key={tier.value}
              style={{
                border: `2px solid ${selected === tier.value ? tier.badge : '#ddd'}`,
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: selected === tier.value ? tier.badge + '18' : '#fff',
                transition: 'all .15s',
              }}
            >
              <input
                type="radio"
                name="tier"
                value={tier.value}
                checked={selected === tier.value}
                onChange={() => setSelected(tier.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <span
                style={{
                  display: 'inline-block',
                  background: tier.badge,
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '1px 7px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginRight: '0.4rem',
                }}
              >
                {tier.value}
              </span>
              <strong>{tier.label}</strong>
              <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.3rem' }}>{tier.desc}</div>
              <div style={{ fontSize: '0.85rem', color: '#28a745', fontWeight: 600, marginTop: '0.2rem' }}>
                Savings vs Tier 1: {tier.save}
              </div>
            </label>
          ))}
        </div>

        {selected !== asset.supportTier && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Changing from <strong>{current.label}</strong> → <strong>{chosen.label}</strong>. Estimated savings: <strong>{chosen.save}</strong> of OEM annual cost.
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Confirm Selection'}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
