# IT Hardware Asset Inventory and Support Model

A **VibeAThon POC** for visualizing and analyzing IT hardware asset data with support/maintenance cost modeling.

## Tech Stack

- **Backend**: Node.js + Express (REST API, CSV ingestion, in-memory store)
- **Frontend**: React (React Router, Axios)

---

## Folder Structure

```
IT-HW-Asset-Inventory-and-Support-Model/
├── backend/
│   ├── server.js              # Express entry point (port 3001)
│   ├── routes/                # assets.js, reports.js
│   ├── controllers/           # assetsController.js, reportsController.js
│   ├── models/Asset.js        # Asset data model
│   ├── middleware/            # errorHandler.js
│   ├── utils/csvParser.js     # CSV parsing utility
│   └── data/                  # Uploaded CSV files (gitignored)
├── frontend/
│   └── src/
│       ├── App.js             # Router + Nav
│       ├── pages/             # Dashboard, InventoryPage, ReportsPage
│       ├── components/        # AssetTable, AssetFilter, SupportTierBadge, etc.
│       ├── services/api.js    # Axios API helpers
│       ├── hooks/useAssets.js # Custom React hook
│       └── utils/formatters.js
├── docs/
│   ├── requirements.md
│   └── data-dictionary.md
└── package.json               # Root monorepo scripts
```

---

## Setup & Running

### 1. Install all dependencies

```bash
npm run install:all
```

### 2. Start development servers

```bash
npm run dev
```

This starts:
- Backend on **http://localhost:3001**
- Frontend on **http://localhost:3000**

### 3. Upload a CSV

Navigate to the **Dashboard** and use the **Upload Inventory CSV** widget to load your inventory export. The backend will parse the file and hold the data in memory for the session.

---

## API Endpoints

| Method | Path                          | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | /api/health                   | Health check                       |
| GET    | /api/assets                   | All assets (filter: owner, application, status) |
| GET    | /api/assets/:id               | Single asset by Asset Number       |
| POST   | /api/assets/upload            | Upload CSV file                    |
| GET    | /api/reports/by-owner         | Assets grouped by Owner            |
| GET    | /api/reports/by-application   | Assets grouped by Application      |
| GET    | /api/reports/by-tier          | Assets grouped by support tier     |
| GET    | /api/reports/cost-avoidance   | Cost avoidance summary             |

---

## Support Tier Model

| Tier   | Description            | Savings vs OEM Tier 1 |
|--------|------------------------|-----------------------|
| Tier 1 | 7x24 OEM               | Baseline (0%)         |
| Tier 2 | NBD OEM                | 7% savings            |
| Tier 3 | No support             | 100% savings          |
| Tier 4 | 7x24 3rd Party         | 80% savings           |

**Cost avoidance** = OEM cost × savings % (only when not on Tier 1).  
OEM $ / cost fields are **manually populated** in the CSV.  
`Owner` and `Application` are the **authoritative** fields for grouping and reporting.

---

## Documentation

- [`docs/requirements.md`](docs/requirements.md) — Project requirements and open questions
- [`docs/data-dictionary.md`](docs/data-dictionary.md) — CSV field descriptions and data types

