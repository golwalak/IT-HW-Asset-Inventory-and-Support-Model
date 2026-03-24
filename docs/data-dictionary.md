# Data Dictionary — IT HW Asset Inventory CSV

All fields originate from the IT asset management CSV export.  
Fields marked **AUTHORITATIVE** are the primary grouping/reporting keys.

---

## Identity Fields

| Field          | Type   | Description                                       |
|----------------|--------|---------------------------------------------------|
| Asset Name     | string | Human-readable asset name (e.g., `ALHA-SRV-001`) |
| Asset Number   | string | **Unique identifier** used as the record key      |
| Serial Number  | string | Manufacturer serial number                        |
| Tag            | string | Physical asset tag / barcode                      |

---

## Hardware Description

| Field                    | Type   | Description                                          |
|--------------------------|--------|------------------------------------------------------|
| Material Name            | string | Generic hardware name                                |
| Type                     | string | Hardware type (Server, Switch, Storage, Firewall…)  |
| Manufacturer             | string | OEM vendor (Cisco, Nutanix, IBM, Palo Alto, etc.)   |
| Model                    | string | Specific product model                               |
| Material Subtype Name    | string | Sub-category (Rack Server, Core Switch…)             |
| Material Category Name   | string | Broad category (Compute, Network, Storage…)          |
| ETS Std HW Category      | string | Internal ETS hardware category label                 |

---

## Status & Location

| Field           | Type   | Description                                      |
|-----------------|--------|--------------------------------------------------|
| Record Status   | string | Active / Inactive / Decommissioned               |
| Cabinet Name    | string | Rack/cabinet name                                |
| Cabinet U Number| string | Rack unit position                               |
| Location        | string | Physical site (Alhambra or Irvine)               |

---

## Lifecycle Dates

| Field              | Type   | Description                          |
|--------------------|--------|--------------------------------------|
| Creation Date      | date   | Date record was created in the system |
| Operational Date   | date   | Date asset went into production       |
| Decommission Date  | date   | Date asset was/will be decommissioned |

---

## Support & Scope

| Field              | Type    | Description                                         |
|--------------------|---------|-----------------------------------------------------|
| In TCS Scope       | boolean | Whether asset is in TCS scope                       |
| Support Group Name | string  | ETS support group responsible for the asset          |
| RU Category        | string  | Resource Unit category                              |
| RU Group           | string  | Resource Unit group                                 |
| UPS                | boolean | Whether asset is connected to UPS                   |

---

## Procurement

| Field               | Type   | Description                    |
|---------------------|--------|--------------------------------|
| Project             | string | Funding project                |
| PO Number           | string | Purchase order number          |
| Warranty Start Date | date   | Start of manufacturer warranty |
| Warranty End Date   | date   | End of manufacturer warranty   |

---

## Non-Standard Support

| Field                          | Type   | Description                               |
|--------------------------------|--------|-------------------------------------------|
| ETS Non std support            | string | Notes on non-standard ETS support         |
| Non ETS Std HW Support details | string | Details of non-ETS standard HW support    |
| Ring Fenced                    | string | Whether asset is ring-fenced              |

---

## Mock / Derived Fields

| Field                             | Type    | Notes                                          |
|-----------------------------------|---------|------------------------------------------------|
| age (mo)                          | number  | Computed age in months from Operational Date   |
| application (mock)                | string  | **AUTHORITATIVE** — application this asset supports |
| Owner (mock)                      | string  | **AUTHORITATIVE** — business owner of the asset     |
| status (prod or nonprod) (mock)   | string  | `prod` or `nonprod`                            |

---

## Cost & Support Tier Fields (manually populated)

| Field                                  | Type    | Notes                                          |
|----------------------------------------|---------|------------------------------------------------|
| 7x24 OEM $ / 365 days (mock)           | number  | Annual OEM 7x24 support cost in USD            |
| 7x24 Tier1 (yes/no?)                   | boolean | Asset is on Tier 1 (full OEM) support          |
| NBD Tier 2, 7% save (yes / no)         | boolean | Asset is on Tier 2 (NBD, 7% savings)           |
| None Tier 3, 100% save (yes/on)        | boolean | Asset has no support contract (100% savings). Note: `(yes/on)` is the actual column name from the source CSV (apparent typo for `yes/no`). |
| 7x24 3rd Party Tier 4, 80% save (yes/no) | boolean | Asset is on 3rd-party support (80% savings)  |
| cost avoidance ($) if not Tier 1       | number  | Calculated savings vs Tier 1 OEM cost          |
