# Project Requirements — IT HW Asset Inventory and Support Model

## Overview

VibeAThon POC for visualizing and analyzing IT hardware asset data with support/maintenance cost modeling.

**Technology Stack**: Node.js (Express) backend + React frontend  
**Data Source**: CSV export from asset management system  
**Authoritative grouping fields**: `Owner` and `Application`

---

## Support Tier Model

| Tier   | Description                  | Savings vs OEM |
|--------|------------------------------|----------------|
| Tier 1 | 7x24 OEM (baseline)          | 0% (baseline)  |
| Tier 2 | NBD OEM support              | 7% savings     |
| Tier 3 | No support contract          | 100% savings   |
| Tier 4 | 7x24 3rd Party support       | 80% savings    |

**Cost Avoidance Formula**:  
`cost avoidance = OEM cost × savings %`  (only applicable when not on Tier 1)

---

## Functional Requirements

1. Ingest inventory CSV (upload or in-memory mock data)
2. Display sortable, filterable asset inventory table
3. Dashboard with summary KPIs:
   - Total asset count
   - Production vs Non-Production breakdown
   - Assets with warranty expiring within 12 months
   - Total cost avoidance
4. Reports grouped by **Application** (default) or **Owner** (toggle)
5. Support tier breakdown per group
6. Cost avoidance summary per group

---

## Non-Functional Requirements

- No database required for POC — in-memory array on backend
- OEM $ / cost fields are **manually populated** (no auto-calculation)
- `Owner` and `Application` fields are **authoritative** for all grouping and reporting
- Functional from day one with 5 hardcoded mock rows

---

## Open Questions / Future Work

- [ ] Add persistent database (PostgreSQL or MongoDB) for production use
- [ ] Authentication / authorization
- [ ] Export to CSV / Excel from the UI
- [ ] Bulk edit of OEM cost fields
- [ ] Chart library integration (e.g., Recharts) for tier and cost visualizations
- [ ] Warranty alert notifications
- [ ] Integration with asset management system API for automatic data sync
