import React, { useState } from 'react'
import UploadPanel from './components/UploadPanel'
import AssetTable from './components/AssetTable'
import SupportTierPanel from './components/SupportTierPanel'
import ReportView from './components/ReportView'
import WarrantyTracker from './components/WarrantyTracker'

const NAV_ITEMS = [
  { key: 'upload', label: 'Upload CSV', icon: 'bi-cloud-upload' },
  { key: 'inventory', label: 'Asset Inventory', icon: 'bi-table' },
  { key: 'tiers', label: 'Support Tier Analysis', icon: 'bi-bar-chart-steps' },
  { key: 'reports', label: 'Reports', icon: 'bi-graph-up' },
  { key: 'warranty', label: 'Warranty Tracker', icon: 'bi-shield-check' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [dataLoaded, setDataLoaded] = useState(false)
  const [uploadSummary, setUploadSummary] = useState(null)

  const handleUploadSuccess = (summary) => {
    setUploadSummary(summary)
    setDataLoaded(true)
    setTimeout(() => setActiveTab('inventory'), 1000)
  }

  return (
    <div>
      {/* Top Navbar */}
      <nav className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand d-flex align-items-center">
          <i className="bi bi-hdd-network me-2 fs-4"></i>
          <span>IT HW Asset Inventory &amp; Support Model</span>
        </span>
        {dataLoaded && uploadSummary && (
          <span className="text-light small">
            <i className="bi bi-check-circle-fill text-success me-1"></i>
            {uploadSummary.total_records} assets loaded
          </span>
        )}
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <nav className="col-md-2 d-none d-md-block sidebar py-3">
            <ul className="nav flex-column">
              {NAV_ITEMS.map(item => (
                <li className="nav-item" key={item.key}>
                  <button
                    className={`nav-link border-0 bg-transparent w-100 text-start ${activeTab === item.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.key)}
                  >
                    <i className={`bi ${item.icon}`}></i>
                    {item.label}
                    {item.key !== 'upload' && !dataLoaded && (
                      <span className="badge bg-secondary ms-1 float-end" style={{ fontSize: '0.6rem' }}>needs data</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {dataLoaded && uploadSummary && (
              <div className="mt-4 px-3">
                <hr className="border-secondary" />
                <div className="text-muted small">
                  <div><i className="bi bi-database me-1"></i>{uploadSummary.total_records} records</div>
                  <div><i className="bi bi-geo-alt me-1"></i>{uploadSummary.locations?.length || 0} locations</div>
                  <div><i className="bi bi-cpu me-1"></i>{uploadSummary.manufacturers?.length || 0} manufacturers</div>
                  <div><i className="bi bi-app me-1"></i>{uploadSummary.applications?.length || 0} applications</div>
                </div>
              </div>
            )}
          </nav>

          {/* Mobile nav */}
          <div className="d-md-none p-2 bg-light border-bottom">
            <div className="d-flex gap-1 flex-wrap">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.key}
                  className={`btn btn-sm ${activeTab === item.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab(item.key)}
                >
                  <i className={`bi ${item.icon} me-1`}></i>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main className="col-md-10 ms-sm-auto px-4 py-3">
            <h4 className="mb-3 border-bottom pb-2">
              <i className={`bi ${NAV_ITEMS.find(n => n.key === activeTab)?.icon} me-2`}></i>
              {NAV_ITEMS.find(n => n.key === activeTab)?.label}
            </h4>

            {activeTab === 'upload' && (
              <UploadPanel onUploadSuccess={handleUploadSuccess} />
            )}
            {activeTab === 'inventory' && (
              <AssetTable dataLoaded={dataLoaded} />
            )}
            {activeTab === 'tiers' && (
              <SupportTierPanel dataLoaded={dataLoaded} />
            )}
            {activeTab === 'reports' && (
              <ReportView dataLoaded={dataLoaded} />
            )}
            {activeTab === 'warranty' && (
              <WarrantyTracker dataLoaded={dataLoaded} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
