# IT Hardware Asset Inventory & Support Model POC

> **VibeAThon POC** – A proof-of-concept web application to analyse IT hardware assets and determine optimal support/maintenance strategies to reduce costs.

---

## Purpose

This application processes an IT hardware asset inventory CSV file and helps stakeholders visualise the asset landscape, identify cost-saving opportunities by recommending appropriate support tiers (Tier 1–4), and calculate potential annual cost avoidance.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11+ / Flask 3 |
| Data processing | pandas |
| Frontend | HTML5, Bootstrap 5, Chart.js |
| Charts | Chart.js 4 |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/golwalak/IT-HW-Asset-Inventory-and-Support-Model.git
cd IT-HW-Asset-Inventory-and-Support-Model

# 2. Create and activate a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the application
python app.py
# or
flask run
```

Then open http://127.0.0.1:5000 in your browser.

---

## Features

### Dashboard
- KPI summary cards (total assets, potential cost avoidance, savings %, tier-eligible count)
- Charts: assets by type, location, warranty status, age distribution, tier distribution
- Support group and tier summary tables

### Inventory Table
- Full paginated asset list with sortable columns
- Filter by: Owner, Application, Location, Type, Status, Support Group
- Quick in-page search
- CSV export of filtered results

### Support Model Analysis
- Per-asset tier recommendation with reasoning
- Tier breakdown table with OEM cost and cost avoidance totals
- Cost avoidance bar chart by tier
- Support tier model reference card

### CSV Upload
- Upload a custom inventory CSV to replace the sample dataset
- Column mapping reference provided in the UI

---

## Support Tier Model

| Tier | Description | Savings |
|------|-------------|---------|
| **Tier 1** | 7x24 OEM Support (baseline) | 0% |
| **Tier 2** | Next Business Day (NBD) | 7% |
| **Tier 3** | No Support Contract | 100% |
| **Tier 4** | 7x24 Third-Party Support | 80% |

### Tier Recommendation Rules

1. Warranty **Active** → Tier 1 (OEM covered under warranty)
2. **Non-production** + age **> 60 months** → Tier 3 (no support)
3. **Non-production** + age **36–60 months** → Tier 4 (3rd party)
4. **Production** + age **> 84 months** → Tier 4 (3rd party)
5. **Production** + age **60–84 months** → Tier 2 (NBD)
6. Default → Tier 1

### Cost Avoidance Formula

```
Tier 2 savings = OEM_annual_cost × 7%
Tier 3 savings = OEM_annual_cost × 100%
Tier 4 savings = OEM_annual_cost × 80%
```

---

## Project Structure

```
├── app.py                          # Flask application entry point
├── requirements.txt                # Python dependencies
├── data/
│   └── sample_inventory.csv        # 24-row sample dataset
├── static/
│   ├── css/style.css               # Custom styles
│   └── js/main.js                  # Chart.js helpers
├── templates/
│   ├── base.html                   # Base layout with Bootstrap navbar
│   ├── index.html                  # Dashboard page
│   ├── inventory.html              # Full inventory table
│   ├── analysis.html               # Support model analysis
│   └── upload.html                 # CSV upload page
└── utils/
    ├── __init__.py
    ├── data_loader.py              # CSV parsing & data processing
    └── support_model.py            # Tier logic & cost calculations
```

---

## Screenshots

*(Screenshots to be added after stakeholder demo)*

---

## Open Questions / Future Work

1. **OEM Cost Fields** – Currently mock/estimated per model. Should be sourced from actual contracts or CMDB.
2. **Owner & Application Fields** – Mock data for POC. Future integration with ServiceNow / CMDB for real ownership data.
3. **Age Field** – Currently pre-calculated in the CSV. Future versions should derive from `Operational Date`.
4. **Authentication** – No auth in this POC. Production version should integrate with SSO/LDAP.
5. **CMDB Integration** – Replace mock fields with live ServiceNow CMDB API data.
6. **Scheduled Refresh** – Automate CSV ingestion from a shared drive or API endpoint.

---

*VibeAThon POC – For demonstration purposes only. Not intended for production use.*

