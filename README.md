# IT Hardware Asset Inventory and Support Model

A full-stack web application for managing IT hardware assets. Track laptops, desktops, monitors, servers, and other equipment across your organization.

![IT Hardware Asset Inventory](https://github.com/user-attachments/assets/0297caf4-b6c6-4165-b76b-b7bce86af248)

## Quick Start

> **Both servers must be running.** Open two terminal windows and run:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

## Features

- **Dashboard** — Summary statistics showing asset counts by type and status
- **Asset List** — Filterable table of all hardware assets
- **CRUD Operations** — Add, edit, and delete assets
- **Filtering** — Filter assets by type, status, owner, and application

## Tech Stack

- **Backend:** Node.js / Express — REST API with in-memory data store (runs on port 3001)
- **Frontend:** React — Responsive UI (runs on port 3000)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | List all assets (supports query filters) |
| GET | `/api/assets/:id` | Get a single asset |
| POST | `/api/assets` | Create a new asset |
| PUT | `/api/assets/:id` | Update an asset |
| DELETE | `/api/assets/:id` | Delete an asset |
| GET | `/api/assets/summary/stats` | Get summary statistics |

## Data Model

Each asset has the following fields:

- **assetTag** — Unique identifier (e.g., "HW-001")
- **name** — Device name (e.g., "Dell Latitude 5520")
- **type** — Laptop, Desktop, Monitor, Server, Network Equipment, Printer, Other
- **owner** — Person responsible for the asset
- **application** — Business application or team it supports
- **status** — Active, In Storage, Under Repair, Retired, Disposed
- **purchaseDate** — Date of purchase
- **warrantyExpiry** — Warranty expiration date
- **location** — Physical location
- **notes** — Additional notes
