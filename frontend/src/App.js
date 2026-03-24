// Main App component — sets up routing and navigation
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';

const navStyle = {
  display: 'flex',
  gap: '1rem',
  padding: '0.75rem 1.5rem',
  background: '#1a73e8',
  alignItems: 'center',
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
};

const activeLinkStyle = {
  ...linkStyle,
  background: 'rgba(255,255,255,0.25)',
};

const titleStyle = {
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.1rem',
  marginRight: 'auto',
};

function App() {
  return (
    <BrowserRouter>
      {/* Navigation bar */}
      <nav style={navStyle}>
        <span style={titleStyle}>IT HW Asset Inventory</span>
        <NavLink
          to="/"
          end
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/inventory"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Inventory
        </NavLink>
        <NavLink
          to="/reports"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Reports
        </NavLink>
      </nav>

      {/* Page content */}
      <div style={{ padding: '1.5rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
