import React, { useState, useEffect } from 'react';

const TYPES = ['Laptop', 'Desktop', 'Monitor', 'Server', 'Network Equipment', 'Printer', 'Other'];
const STATUSES = ['Active', 'In Storage', 'Under Repair', 'Retired', 'Disposed'];

const EMPTY_ASSET = {
  assetTag: '',
  name: '',
  type: 'Laptop',
  manufacturer: '',
  model: '',
  serialNumber: '',
  owner: '',
  department: '',
  application: '',
  status: 'Active',
  location: '',
  purchaseDate: '',
  warrantyExpiry: '',
  notes: '',
};

export default function AssetForm({ asset, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_ASSET);
  const isEdit = Boolean(asset && (asset._id || asset.id));

  useEffect(() => {
    if (asset) {
      setForm({
        ...EMPTY_ASSET,
        ...asset,
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.slice(0, 10) : '',
        warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.slice(0, 10) : '',
      });
    } else {
      setForm(EMPTY_ASSET);
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit Asset' : 'Add New Asset'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Asset Tag *
              <input name="assetTag" value={form.assetTag} onChange={handleChange} required />
            </label>

            <label>
              Name *
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>

            <label>
              Type
              <select name="type" value={form.type} onChange={handleChange}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label>
              Manufacturer
              <input name="manufacturer" value={form.manufacturer} onChange={handleChange} />
            </label>

            <label>
              Model
              <input name="model" value={form.model} onChange={handleChange} />
            </label>

            <label>
              Serial Number
              <input name="serialNumber" value={form.serialNumber} onChange={handleChange} />
            </label>

            <label>
              Owner
              <input name="owner" value={form.owner} onChange={handleChange} />
            </label>

            <label>
              Department
              <input name="department" value={form.department} onChange={handleChange} />
            </label>

            <label>
              Application
              <input name="application" value={form.application} onChange={handleChange} />
            </label>

            <label>
              Location
              <input name="location" value={form.location} onChange={handleChange} />
            </label>

            <label>
              Purchase Date
              <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
            </label>

            <label>
              Warranty Expiry
              <input type="date" name="warrantyExpiry" value={form.warrantyExpiry} onChange={handleChange} />
            </label>

            <label className="full-width">
              Notes
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Update' : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
