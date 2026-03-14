# Backend Handoff — Entity Validation & API Changes

## 1. Enforce Unique SELF Entity Per Workspace

**Endpoint:** `POST /workspaces/{workspaceId}/entities` and `PUT /workspaces/{workspaceId}/entities/{entityId}`

**Requirement:** A workspace must have at most one entity with `role = "SELF"`. If a create or update request would result in more than one SELF entity, reject it.

**Response:** `400 Bad Request` or `409 Conflict`
```json
{ "message": "A SELF entity already exists in this workspace." }
```

---

## 2. Validate Parent Entity Role

**Endpoint:** `POST /workspaces/{workspaceId}/entities` and `PUT /workspaces/{workspaceId}/entities/{entityId}`

**Requirement:** If a `parentId` is provided, the referenced parent entity must NOT have `role = "EMPLOYEE"`. Only CUSTOMER, VENDOR, and SELF entities can be parents.

**Response:** `400 Bad Request`
```json
{ "message": "Parent entity cannot be an EMPLOYEE." }
```

> Note: The frontend already enforces this in the UI by filtering the parent dropdown. The backend check is for API-level integrity.

---

## 3. Add `parentId` Query Filter to Entity List

**Endpoint:** `GET /workspaces/{workspaceId}/entities`

**Requirement:** Add an optional `parentId` query parameter to allow fetching entities by their parent.

**Current supported params:** `role` (optional)
**New param:** `parentId` (optional, string — entity UUID)

**Example:** `GET /workspaces/ws_123/entities?parentId=ent_456`

**Response:** Same `{ entities: [...], count: N }` shape, filtered to entities where `parentId` matches.

> Note: The frontend currently works around the absence of this filter by fetching all entities and filtering client-side. Adding this param will make it efficient for large workspaces.
