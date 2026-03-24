// Express entry point for IT HW Asset Inventory backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const assetsRouter = require('./routes/assets');
const reportsRouter = require('./routes/reports');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/assets', assetsRouter);
app.use('/api/reports', reportsRouter);

// --- Error handling (must be last) ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

module.exports = app;
