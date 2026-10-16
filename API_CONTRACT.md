# SANKET Nagpur — Frontend-to-Backend API Contract & Integration Guide

This document defines the strict, typed API contracts expected by the **SANKET Nagpur** frontend application.

The frontend is architected with a clean adapter pattern (`src/services/api/`).
- By default, it operates in **mock mode** (`VITE_API_MODE=mock`) with fully persistent browser-side localStorage (`MockApiService`).
- To connect a real backend, set `VITE_API_MODE=http` and define `VITE_API_BASE_URL` in `.env`.
- The frontend adapter (`HttpApiService`) makes standard `fetch` calls matching the specifications below without needing any changes to UI components.

---

## 1. Global Standards & Wire Formats

- **Base URL**: Configured via `VITE_API_BASE_URL` (e.g. `http://localhost:8000/api`).
- **Content-Type**: `application/json; charset=utf-8`
- **Timestamps**: ISO 8601 UTC strings (e.g., `"2026-10-16T18:30:00.000Z"`).
- **Coordinate Arrays**: `[latitude, longitude]` as `[number, number]`. (Nagpur center: `[21.1458, 79.0882]`).

### Standard Response Envelope
All endpoints return an envelope containing `data`, `success`, and a server `timestamp`:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation",
  "timestamp": "2026-10-16T18:30:00.000Z"
}
```

### Standard Error Envelope
HTTP error status codes (`400`, `404`, `422`, `500`) must return:

```json
{
  "success": false,
  "code": "REQUEST_NOT_FOUND",
  "message": "Assistance request SN-2026-9999 was not found.",
  "status": 404,
  "details": { ... }
}
```

---

## 2. Core Domain Models & Shared Enums

### Incident Category (`IncidentCategory`)
`"rescue" | "medical" | "water" | "food" | "shelter" | "supplies" | "flood" | "other"`

### Request Operational Status (`RequestStatus`)
`"submitted" | "verified" | "matching" | "assigned" | "in_progress" | "resolved" | "invalid" | "duplicate"`

### Priority Level (`PriorityLevel`)
`"CRITICAL" | "HIGH" | "MEDIUM" | "LOW"`

### Coordinator Verification State (`VerificationState`)
`"unverified" | "verified" | "needs_info" | "flagged_duplicate" | "invalid"`

### Reported Urgency Level (`UrgencyLevel`)
`"immediate" | "high" | "moderate" | "low"`

### Vulnerability Indicators (`VulnerabilityIndicator`)
`"elderly" | "infants" | "medical_condition" | "trapped_water" | "disabled" | "pregnant"`

### Resource Category (`ResourceCategory`)
`"water" | "food" | "shelter" | "supplies" | "rescue" | "volunteers"`

### Resource Stock Status (`ResourceStatus`)
`"AVAILABLE" | "LOW_STOCK" | "DEPLETED" | "COMMITTED"`

### Assignment Status (`AssignmentStatus`)
`"ASSIGNED" | "DISPATCHED" | "DELIVERED" | "CANCELLED"`

---

## 3. Endpoints Specification

### 3.1 Requests

#### `GET /requests`
Query assistance requests with optional filters and sorting.

- **Query Parameters**:
  - `search` *(string, optional)*: Substring search across ID, location, description.
  - `category` *(IncidentCategory | "all", optional)*
  - `priority` *(PriorityLevel | "all", optional)*
  - `verificationState` *(VerificationState | "all", optional)*
  - `status` *(RequestStatus | "all", optional)*
  - `sortBy` *("urgency" | "waiting_time" | "affected_count" | "recent", optional)*

- **Response `data`**: Array of `AssistanceRequest` objects.

---

#### `GET /requests/:id`
Retrieve full details of a specific request.

- **Parameters**: `id` *(string, e.g. "SN-2026-0842")*
- **Response `data`**: `AssistanceRequest` object, or `404 Not Found`.

---

#### `POST /requests`
Submit a new community assistance report (public resident form).

- **Request Body**:
```json
{
  "category": "rescue",
  "locationName": "Ambazari Catchment, Canal Road",
  "coordinates": [21.1307, 79.0494],
  "reportedUrgency": "immediate",
  "affectedCount": 8,
  "vulnerabilities": ["trapped_water", "elderly", "infants"],
  "description": "Ground floor submerged up to 4.5 feet. Need inflatable evacuation.",
  "residentName": "Resident A.",
  "contactPhone": "+91 98XXX-XX412",
  "evidenceFileName": "flood_water_level.jpg"
}
```

- **Backend Responsibility**:
  1. Generate unique readable synthetic ID (e.g. `SN-2026-XXXX`).
  2. Compute rule-based priority assessment factors.
  3. Initialize `status` as `"submitted"` and `verificationState` as `"unverified"`.
  4. Append entry to audit history.

- **Response `data`**: Newly created `AssistanceRequest`.

---

#### `PATCH /requests/:id/verification`
Coordinator updates verification status.

- **Request Body**:
```json
{
  "verificationState": "verified",
  "notes": "Spoke with resident ham operator; confirmed water level at 4 feet.",
  "verifiedBy": "Coordinator V. Sharma (Desk 02)"
}
```

- **Response `data`**: Updated `AssistanceRequest`.

---

#### `PATCH /requests/:id/priority`
Coordinator manually overrides the rule-based suggested priority.

- **Request Body**:
```json
{
  "newPriority": "CRITICAL",
  "reason": "Water rising rapidly due to spillway surge; elderly residents trapped on ground floor.",
  "overriddenBy": "Coordinator V. Sharma (Desk 02)"
}
```

- **Validation Rule**: `reason` must be provided (minimum 10 characters).
- **Response `data`**: Updated `AssistanceRequest`.

---

#### `POST /requests/:id/duplicates`
Associate a request as a duplicate of a primary incident record.

- **Request Body**:
```json
{
  "primaryRequestId": "SN-2026-0842",
  "notes": "Same apartment complex reported by neighbor.",
  "flaggedBy": "Coordinator V. Sharma (Desk 02)"
}
```

- **Response `data`**: Updated `AssistanceRequest` (with `status: "duplicate"`, `duplicateOfId`).

---

#### `PATCH /requests/:id/status`
Transition request operational status.

- **Request Body**:
```json
{
  "status": "resolved",
  "notes": "Relief supplies received and confirmed distributed.",
  "updatedBy": "Coordinator V. Sharma (Desk 02)"
}
```

- **Response `data`**: Updated `AssistanceRequest`.

---

### 3.2 Resources & Matching

#### `GET /resources`
Retrieve relief inventory.

- **Query Parameters**: `category` *(ResourceCategory | "all", optional)*
- **Response `data`**: Array of `ResourceItem` objects.

---

#### `GET /requests/:id/matches`
Find plausible matching resources for a verified request.

- **Parameters**: `id` *(string)*
- **Response `data`**: Array of `ResourceMatch` objects:
```json
[
  {
    "resource": {
      "id": "RES-RSC-401",
      "name": "Inflatable Evacuation Rafts & Life Jackets",
      "category": "rescue",
      "storageLocation": "NMC Ambazari Staging Outpost",
      "coordinates": [21.1290, 79.0480],
      "availableQuantity": 6,
      "unit": "rafts"
    },
    "matchScore": 95,
    "suitabilityExplanation": "Direct category match for rescue assistance. Located ~0.8 km away.",
    "recommendedQuantity": 2,
    "distanceKmApprox": 0.8
  }
]
```

---

#### `POST /requests/:id/assignments`
Coordinator explicitly commits resources to a request.

- **Request Body**:
```json
{
  "resourceId": "RES-RSC-401",
  "allocatedQuantity": 2,
  "notes": "Dispatch via western canal embankment road."
}
```

- **Backend Responsibility**:
  1. Decrement resource `availableQuantity` by `allocatedQuantity`.
  2. Increment resource `assignedQuantity`.
  3. Update request `status` to `"assigned"` with assigned resource details.
  4. Generate and store `AssignmentRecord` (`ASN-XXXX`).
  5. Append entry to audit history.

- **Response `data`**:
```json
{
  "request": { ... },
  "assignment": { ... }
}
```

---

#### `PATCH /assignments/:id/status`
Update assignment delivery lifecycle.

- **Request Body**:
```json
{
  "status": "DELIVERED",
  "notes": "Signed off by ward volunteer on site.",
  "updatedBy": "Coordinator V. Sharma (Desk 02)"
}
```

- **Backend Responsibility**: If `status === "DELIVERED"`, decrement `assignedQuantity` and increment `deliveredQuantity` on the resource.
- **Response `data`**: Updated `AssignmentRecord`.

---

### 3.3 Dashboard Metrics & Audit

#### `GET /dashboard/metrics`
Aggregated operational metrics for dashboard counters.

- **Response `data`**:
```json
{
  "awaitingVerificationCount": 2,
  "highPriorityUnmetCount": 3,
  "awaitingAssignmentCount": 2,
  "totalActiveRequestsCount": 6,
  "availableResourcesCount": 6,
  "resolvedRequestsCount": 1,
  "totalAffectedPersonsCount": 75,
  "criticalRequestsCount": 2
}
```

---

#### `GET /audit`
Chronological operational log.

- **Query Parameters**: `targetId` *(string, optional)*
- **Response `data`**: Array of `AuditEntry` objects sorted most recent first.

---

#### `POST /demo/reset`
Restores synthetic test data to baseline demo seed (mock mode support).

- **Response `data`**: `{ "reset": true }`
