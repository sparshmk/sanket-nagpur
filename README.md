# SANKET Nagpur

> **Report the risk. Match the relief. Track every unmet need.**  
> Community-verified flood intelligence and relief coordination layer for Nagpur.

---

## Overview

During severe monsoon rainfall and flash waterlogging across Nagpur (Ambazari catchment, Nag & Pili river basins, Dharampeth, Sitabuldi), emergency reports and resident needs often scatter across disconnected channels.

**SANKET Nagpur** provides a transparent, community-verified operational layer:
1. **Public Assistance Intake (`/report`)**: Mobile-first structured reporting with categories, affected head-counts, and vulnerability flags.
2. **Coordinator Verification Workspace (`/desk/requests/:id`)**: Human-in-the-loop verification, duplicate flagging, and notes.
3. **Transparent Rule-Based Priority Assessment**: Explainable, deterministic factors (immediate life danger, trapped residents, vulnerable demographics, medical necessity, unresolved wait time) with coordinator override controls.
4. **Relief Resource Matching (`/desk/resources`)**: Recommends nearest compatible supplies from synthetic Nagpur relief depots (water, food, medical kits, rafts, shelter, volunteers) and requires manual coordinator confirmation.
5. **Resident Status Tracking (`/track/:id`)**: Step-by-step progress tracking for affected families without prematurely declaring supplies delivered.
6. **Geographic Overview (`/desk/map`)**: Operational Leaflet & OpenStreetMap incident GIS.
7. **Audit Trail (`/desk/audit`)**: Append-only log of every status transition and coordinator action.

---

## Tech Stack

- **Framework**: React 19 + Vite 8 + TypeScript
- **Styling**: Tailwind CSS (custom SANKET design system: Deep Forest Green `#14533B`, Dark Evergreen `#103D2C`, Mint Surface `#EEF5EF`, Warm Neutral `#F8FAF8`, Amber Accent `#D6A441`)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Motion**: Framer Motion
- **Mapping**: Leaflet + OpenStreetMap (no paid API keys required, graceful offline fallback)
- **Data Architecture**: Abstracted service layer (`IApiService`), Seeded mock storage (`MockApiService`) with localStorage persistence, and production HTTP adapter (`HttpApiService`).

---

## Getting Started

### Prerequisites

- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Installation

```bash
# Clone or navigate to the project directory
cd "Sanket Nagpur"

# Install dependencies
npm install
```

### Running Locally (Mock Mode)

By default, the application runs in **Mock Mode** using seeded synthetic demonstration data with browser-side localStorage persistence:

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Build outputs are generated in `/dist` with optimized chunk splitting.

---

## Interactive End-to-End Demonstration Walkthrough

You can perform the complete 11-step hackathon judging demonstration independently:

1. **Open the Operations Desk**: Navigate to `/desk`. Inspect the live summary cards (Awaiting Verification, High-Urgency Unmet, Ready for Assignment, Depot Nodes).
2. **Inspect Priority Queue**: In the Priority Attention Queue, click on request `SN-2026-0842` (Ambazari Catchment, Rescue Assistance).
3. **Inspect Request Workspace**: View the resident description, reported vulnerability tags (Trapped in floodwater, Elderly, Infants), and the **Transparent Priority Assessment Panel**. Notice the rule-based factor explanation indicating why it was rated CRITICAL.
4. **Test Priority Override**: Click **Override Priority**, select `HIGH`, provide a coordinator reason (e.g., "Water receded by 1.5 feet as verified by ward volunteer"), and confirm. Observe the immediate update and banner.
5. **Verify Request**: Under Coordinator Verification, click **Verify Request**, add an optional verification note, and confirm.
6. **Match Relief Resources**: Scroll to the **Relief Matching Workspace**. Plausible resources are dynamically queried. Notice `RES-RSC-401` (Inflatable Evacuation Rafts) at NMC Ambazari Staging Outpost (~0.8 km away).
7. **Confirm Resource Assignment**: Click **Assign Resource**, adjust quantity (e.g. 2 rafts), and click **Confirm Manual Assignment**.
8. **Verify Inventory & Request Status**: Notice the request transitions to **Resource Confirmed Assigned**, and the depot available quantity automatically decrements from 6 to 4 rafts.
9. **Inspect Resident Tracking**: Click **Public Tracking View** (or navigate to `/track/SN-2026-0842`). Notice the vertical progress timeline reflects stage 5 (Confirmed Resource Assignment) with assigned inventory details.
10. **Inspect Audit History**: Navigate to `/desk/audit`. Verify that every action (Verification, Override, Assignment) is logged chronologically with timestamps and coordinator actor labels.
11. **Submit a New Resident Report**: Navigate to `/report`. Submit a new assistance request for drinking water in Dharampeth. Notice the instant generation of a synthetic ID (e.g. `SN-2026-XXXX`), and confirm it appears immediately in the Coordinator Queue (`/desk/requests`)!
12. **Reset Demo Data**: Click **Reset Data** in the bottom-left sidebar anytime to restore initial seed records.

---

## Backend Integration Guide

The frontend was built to be completely decoupled from backend implementation details. All communication is routed through the `IApiService` interface defined in `src/types/api.ts`.

### 1. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
# Set mode to 'http' to switch from MockApiService to HttpApiService
VITE_API_MODE=http

# Your backend API endpoint base URL
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. Expected Backend Endpoints

The backend developer needs to implement the following REST endpoints (full request/response schemas documented in [`API_CONTRACT.md`](./API_CONTRACT.md)):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/requests` | Fetch requests with search, category, status, priority, and sorting filters |
| `GET` | `/requests/:id` | Fetch single request details |
| `POST` | `/requests` | Create assistance request from resident report form |
| `PATCH` | `/requests/:id/verification` | Update coordinator verification state |
| `PATCH` | `/requests/:id/priority` | Apply coordinator priority override with reason |
| `POST` | `/requests/:id/duplicates` | Associate record as duplicate of a primary request |
| `PATCH` | `/requests/:id/status` | Update request status (e.g. `in_progress`, `resolved`) |
| `GET` | `/resources` | Retrieve relief inventory |
| `GET` | `/requests/:id/matches` | Get recommended resource matches for a request |
| `POST` | `/requests/:id/assignments` | Confirm resource assignment and commit inventory |
| `PATCH` | `/assignments/:id/status` | Update assignment delivery status |
| `GET` | `/dashboard/metrics` | Retrieve operational indicator counts |
| `GET` | `/audit` | Retrieve chronological operational audit trail |
| `POST` | `/demo/reset` | (Optional) Reset synthetic test records |

---

## Intentional Project Boundaries

As this is a coordination layer prototype:
- **No real emergency dispatch**: SANKET coordinates community assistance; it does not dispatch police, fire, or official rescue boats.
- **No government endorsement claimed**: Uses synthetic Nagpur demonstration coordinates and non-sensitive location tags.
- **No Firebase or database setup required**: Runs 100% self-contained in the browser via `MockApiService` with persistent localStorage.
- **No simulated backend calls pretending to be real**: Clear `DEMO DATA` badge is maintained on all data screens.

---

## License

MIT License — Developed for the SANKET Nagpur Community Disaster Relief Coordination Hackathon.
