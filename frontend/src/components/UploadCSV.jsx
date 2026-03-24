// CSV upload component
import React, { useState } from 'react';
import { uploadCSV } from '../services/api';

function UploadCSV({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  function handleFileChange(e) {
    setFile(e.target.files[0] || null);
    setStatus(null);
  }

  async function handleUpload() {
    if (!file) return;
    setStatus('uploading');
    setMessage('');
    try {
      const result = await uploadCSV(file);
      setStatus('success');
      setMessage(result.message || `Loaded ${result.count} assets`);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || err.message || 'Upload failed');
    }
  }

  return (
    <div style={{ padding: '1rem', border: '1px dashed #90caf9', borderRadius: '8px', maxWidth: '480px' }}>
      <h3 style={{ marginTop: 0 }}>Upload Inventory CSV</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        style={{ marginLeft: '0.75rem', padding: '6px 16px', cursor: 'pointer' }}
      >
        {status === 'uploading' ? 'Uploading…' : 'Upload'}
      </button>

      {status === 'success' && (
        <p style={{ color: '#388e3c', marginTop: '0.5rem' }}>✅ {message}</p>
      )}
      {status === 'error' && (
        <p style={{ color: '#d32f2f', marginTop: '0.5rem' }}>❌ {message}</p>
      )}
    </div>
  );
}

export default UploadCSV;
