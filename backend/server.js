const express = require('express');
const cors = require('cors');
const assetsRouter = require('./routes/assets');
const directoryRouter = require('./routes/directory');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow all origins in dev (Codespaces, localhost)
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json());

app.use('/api/assets', assetsRouter);
app.use('/api/directory', directoryRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  // Seed DB if empty
  try {
    const db = require('./db/database');
    const count = db.prepare('SELECT COUNT(*) AS cnt FROM assets').get().cnt;
    if (count === 0) {
      console.log('Database empty — seeding from CSV...');
      require('./db/seed');
    } else {
      console.log(`Server running on port ${PORT} — ${count} assets in DB`);
    }
  } catch (e) {
    console.error('Seed error:', e.message);
  }
});
