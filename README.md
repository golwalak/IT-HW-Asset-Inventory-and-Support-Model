# IT Hardware Asset Inventory & Support Model

A full-stack POC web application for IT Hardware Asset Inventory and Support Model analysis.
Upload your hardware inventory CSV, visualize assets across data centers, analyze support tier costs, track warranty expiry, and identify cost avoidance opportunities.

---

## Project Overview

This application enables IT operations teams to:

- **Upload** an IT hardware inventory CSV (based on the ADC/IOC inventory format)
- **Browse** and filter all assets in a paginated, sortable table
- **Analyze** support tier assignments and calculate cost avoidance potential
- **Report** assets grouped by application, owner, location, manufacturer, or support group
- **Track** warranty expiry windows (30 / 60 / 90 / 180 days)
- **Export** filtered views and reports to CSV

---

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Backend   | Python 3.11+ / Flask          |
| Data      | pandas (in-memory CSV store)  |
| Frontend  | React 18 + Vite               |
| Styling   | Bootstrap 5 + Bootstrap Icons |
| HTTP      | Axios                         |

---

## Folder Structure

```
/
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── assets.py           # Asset query / export endpoints
│   │   ├── upload.py           # CSV upload endpoint
│   │   └── reports.py          # Grouping / reporting endpoints
│   └── utils/
│       ├── csv_parser.py       # CSV parsing logic (pandas)
│       └── tier_calculator.py  # Support tier cost logic
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # Main app shell + navigation
│       ├── index.css
│       ├── components/
│       │   ├── AssetTable.jsx        # Paginated, filterable asset table
│       │   ├── UploadPanel.jsx       # CSV drag-and-drop upload
│       │   ├── SupportTierPanel.jsx  # Tier analysis + summary cards
│       │   ├── ReportView.jsx        # Grouped reporting views
│       │   ├── WarrantyTracker.jsx   # Warranty expiry tracker
│       │   ├── AssetDetailModal.jsx  # Asset detail popup
│       │   └── shared.jsx            # Shared badge + format helpers
│       └── services/
│           └── api.js          # Axios API calls to backend
├── data/
│   └── sample_inventory.csv    # 15-row sample inventory
├── README.md
└── requirements.md
```

---

## Setup Instructions

### Prerequisites

- **Python 3.11+** and **pip**
- **Node.js 18+** and **npm**

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The Flask API will start on **http://localhost:5000**.

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React dev server will start on **http://localhost:3000** and proxy `/api` requests to the Flask backend.

---

## How to Run Locally

1. **Start the backend** (Terminal 1):
   ```bash
   cd backend
   python app.py
   ```

2. **Start the frontend** (Terminal 2):
   ```bash
   cd frontend
   npm install  # first time only
   npm run dev
   ```

3. **Open the app** at http://localhost:3000

---

## How to Use the App

1. **Upload CSV**: Click "Upload CSV" in the sidebar, then drag & drop (or click to browse) your inventory CSV file.
2. **Asset Inventory**: Browse all assets with filters; click any row for full detail.
3. **Support Tier Analysis**: View tier distribution, OEM costs, and potential cost avoidance.
4. **Reports**: Group assets by Application, Owner, Location, Manufacturer, or Support Group; export to CSV.
5. **Warranty Tracker**: Filter assets by warranty expiry window with color-coded urgency.

---

## Support Tier Model

| Tier   | Name               | Description                         | Savings vs Tier 1 |
|--------|--------------------|-------------------------------------|-------------------|
| Tier 1 | 7x24 OEM           | Full OEM support, 24/7/365          | Baseline (0%)     |
| Tier 2 | NBD (Next Bus Day) | OEM Next Business Day support       | ~7%               |
| Tier 3 | No Contract        | Self-supported, no vendor contract  | 100%              |
| Tier 4 | 3rd Party 7x24     | Third-party provider, full coverage | ~80%              |

### Tier Recommendation Heuristic

| Condition                             | Recommended Tier |
|---------------------------------------|-----------------|
| Non-prod AND age > 60 months          | Tier 3          |
| Non-prod AND age <= 60 months         | Tier 2          |
| Prod AND age > 84 months              | Tier 4          |
| Prod AND warranty still active        | Tier 1          |
| Otherwise                             | Tier 2          |

### Cost Avoidance Calculation

- Tier 2 savings = OEM annual cost x 7%
- Tier 3 savings = OEM annual cost x 100%
- Tier 4 savings = OEM annual cost x 80%
- If OEM cost is blank: displays "N/A"

---

## License

POC - Internal use only.
