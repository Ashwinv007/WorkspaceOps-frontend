# WorkspaceOps Frontend

A Next.js 16 web application for managing workspaces, work items, documents, and entities — with real-time updates via Socket.IO.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Data Fetching | TanStack React Query v5 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod |
| Real-time | Socket.IO Client |
| Toasts | Sonner |
| Date Utils | date-fns |

## Features

- **Authentication** — JWT-based login and signup; token stored in `localStorage`, auto-cleared on 401
- **Workspaces** — Create and switch between workspaces; role-based access (admin/member)
- **Dashboard** — Overview stats, expiry alerts, onboarding checklist, and recent work item activity
- **Work Items** — Full CRUD; table and Kanban board views; link documents to items
- **Documents** — Upload, edit, and track documents; expiry alerts; dynamic metadata via document type schema
- **Entities** — Create and manage entities with custom field support
- **Settings**
  - Document Types — Define schemas with custom fields
  - Work Item Types — Configure work item categories
  - Members — Invite and manage workspace members
- **Audit Logs** — Filterable activity log for workspace events
- **Real-time** — Socket.IO room per workspace; cache invalidated automatically on remote changes

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & Signup pages
│   ├── (app)/
│   │   ├── workspaces/  # Workspace selector
│   │   └── [workspaceId]/
│   │       ├── dashboard/
│   │       ├── work-items/
│   │       ├── documents/
│   │       ├── entities/
│   │       ├── audit-logs/
│   │       └── settings/
│   └── layout.tsx
├── components/
│   ├── features/        # Feature-specific components
│   ├── layout/          # AppShell, Sidebar, TopBar
│   ├── shared/          # EmptyState, StatCard, StatusBadge, etc.
│   └── ui/              # shadcn/ui primitives
├── context/
│   ├── AuthContext.tsx
│   ├── WorkspaceContext.tsx
│   └── SocketProvider.tsx
└── lib/
    ├── api/             # Axios API modules per resource
    ├── hooks/           # Custom React hooks
    ├── socket/          # Socket.IO client
    └── types/           # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- The [WorkspaceOps backend](http://localhost:4000) running locally

### Install & Run

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

The API client points to `http://localhost:4000` by default (see `src/lib/api/client.ts`).

### Other Scripts

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Authentication Flow

1. User signs up or logs in → receives a JWT token and `userId`
2. Token is stored in `localStorage` under `workspaceops_token`
3. Every API request automatically attaches `Authorization: Bearer <token>` via Axios interceptor
4. On any 401 response, the token is cleared and the user is redirected to `/login`

## Real-time Updates

Each workspace page mounts a `SocketProvider` that joins the workspace's Socket.IO room. Server-emitted events (e.g. `work-item:status-changed`) trigger TanStack Query cache invalidations so the UI updates without a manual refresh.
