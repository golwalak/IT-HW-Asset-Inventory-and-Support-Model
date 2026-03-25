const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'assets.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id                TEXT PRIMARY KEY,
    assetTag          TEXT NOT NULL,
    name              TEXT NOT NULL,
    type              TEXT NOT NULL DEFAULT 'Other',
    manufacturer      TEXT DEFAULT '',
    model             TEXT DEFAULT '',
    serialNumber      TEXT DEFAULT '',
    owner             TEXT DEFAULT '',
    ownerEmail        TEXT DEFAULT '',
    manager           TEXT DEFAULT '',
    managerEmail      TEXT DEFAULT '',
    application       TEXT DEFAULT '',
    status            TEXT DEFAULT 'Active',
    recordStatus      TEXT DEFAULT '',
    location          TEXT DEFAULT '',
    purchaseDate      TEXT DEFAULT '',
    warrantyExpiry    TEXT DEFAULT '',
    warrantyStart     TEXT DEFAULT '',
    supportGroup      TEXT DEFAULT '',
    project           TEXT DEFAULT '',
    poNumber          TEXT DEFAULT '',
    ageMonths         INTEGER DEFAULT 0,
    inTcsScope        TEXT DEFAULT '',

    -- Support model (Tier 1–4)
    supportTier       TEXT DEFAULT 'Tier1',
    oemCostAnnual     REAL DEFAULT 0,
    costAvoidance     REAL DEFAULT 0,

    -- Notification workflow
    notificationSent  INTEGER DEFAULT 0,
    notificationDate  TEXT DEFAULT '',
    ownerAcknowledged INTEGER DEFAULT 0,
    acknowledgedDate  TEXT DEFAULT '',

    notes             TEXT DEFAULT '',
    createdAt         TEXT DEFAULT (datetime('now')),
    updatedAt         TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id            TEXT PRIMARY KEY,
    assetId       TEXT NOT NULL,
    assetTag      TEXT NOT NULL,
    assetName     TEXT NOT NULL,
    toEmail       TEXT NOT NULL,
    ccEmail       TEXT DEFAULT '',
    subject       TEXT NOT NULL,
    body          TEXT NOT NULL,
    sentAt        TEXT DEFAULT (datetime('now')),
    status        TEXT DEFAULT 'sent',
    FOREIGN KEY(assetId) REFERENCES assets(id)
  );
`);

module.exports = db;
