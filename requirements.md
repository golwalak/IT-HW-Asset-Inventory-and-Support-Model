# Requirements & Open Questions

## IT Hardware Asset Inventory & Support Model — POC

---

## Tech Stack

- [x] **Backend**: Python / Flask (REST API)
- [x] **Frontend**: React (Vite)
- [x] **Data storage**: CSV-based, in-memory via pandas (no database for POC)
- [x] **Styling**: Bootstrap 5

---

## GitHub Repository

- [x] Repository: `golwalak/IT-HW-Asset-Inventory-and-Support-Model`
- [x] Branch: `copilot/create-it-hardware-inventory-poc`

---

## Open Questions

### Cost Fields
- [ ] **Will OEM $ / cost fields be populated manually or auto-calculated?**
  - Currently: read from the CSV column `7x24 OEM $ / 365 days (mock)`
  - Option A: Keep as-is (manual entry in source CSV)
  - Option B: Add an edit UI to update costs per asset inline
  - Option C: Auto-calculate from a rate card by manufacturer/model

### Authentication
- [ ] **Authentication requirements?**
  - Currently: None (open access for POC)
  - Option A: Add HTTP Basic Auth via Flask
  - Option B: Add OAuth / SSO (for production)

### Deployment Target
- [ ] **Deployment target confirmed?**
  - Currently: Local only (localhost:3000 / localhost:5000)
  - Option A: Docker Compose for local multi-container deployment
  - Option B: Cloud deployment (AWS/Azure/GCP) for shared team access

### Data Persistence
- [ ] **Should uploaded data persist across server restarts?**
  - Currently: In-memory only; data lost on Flask restart
  - Option A: Add SQLite for lightweight persistence
  - Option B: Write parsed data to a local JSON/parquet file

### Asset Editing
- [ ] **Should users be able to edit tier assignments in the UI?**
  - Currently: Read-only display
  - Option A: Add inline tier editing with recalculation
  - Option B: Allow CSV re-upload with updated tier flags

---

## Confirmed Requirements

- [x] **"Owner" and "Application" fields** are authoritative for grouping and reporting
- [x] **Support tier model**: Tier 1 (OEM 7x24) → Tier 2 (NBD, 7% save) → Tier 3 (None, 100% save) → Tier 4 (3rd Party 7x24, 80% save)
- [x] **Warranty tracking**: Highlight assets expiring within 30/60/90/180 days and already expired
- [x] **Cost avoidance**: Display potential savings if non-critical assets moved to lower tiers
- [x] **CSV export**: All table/report views exportable to CSV
- [x] **15-row sample CSV** included in `data/sample_inventory.csv`

---

## CSV Column Reference

The following columns from the inventory CSV are used by the application:

| Column | Used For |
|--------|----------|
| Asset Name | Display, search |
| Asset Number | Display |
| Serial Number | Display |
| Material Name | Display |
| Type | Display, filter |
| Manufacturer | Display, filter, grouping |
| Model | Display |
| Material Category Name | Display |
| ETS Std HW Category | Display |
| Record Status | Display, filter |
| Location | Display, filter, grouping |
| Cabinet Name | Display |
| Cabinet U Number | Display |
| Creation Date | Display |
| Operational Date | Display |
| Decommission Date | Display |
| Support Group Name | Display, filter, grouping |
| Warranty Start Date | Display |
| Warranty End Date | Display, warranty tracker |
| In TCS Scope | Display |
| Project | Display |
| PO Number | Display |
| age (mo) | Tier recommendation logic |
| application (mock) | Display, filter, grouping |
| Owner (mock) | Display, filter, grouping |
| status (prod or nonprod) (mock) | Display, filter, tier logic |
| 7x24 OEM $ / 365 days (mock) | Cost analysis |
| 7x24 Tier1 (yes/no?) | Current tier detection |
| NBD Tier 2 7% save (yes/no) | Current tier detection |
| None Tier 3 100% save (yes/on) | Current tier detection |
| 7x24 3rd Party Tier 4 80% save (yes/no) | Current tier detection |
| cost avoidance ($) if not Tier 1 | Display (source CSV value) |
| Ring Fenced | Display |
