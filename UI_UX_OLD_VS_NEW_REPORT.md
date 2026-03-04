# WorkspaceOps — UI/UX Design Improvement Report

> **Status:** Awaiting approval before implementation
> **Scope:** Visual design, UX polish, and aesthetic improvements only — zero API/data-flow changes
> **Approach:** Flat-design SaaS minimalism (neutral palette, tight typography, token-based colors)

---

## Table of Contents

1. [Design System Foundation](#1-design-system-foundation)
2. [Auth Screens](#2-auth-screens)
3. [Workspace Selection](#3-workspace-selection)
4. [App Shell — Sidebar + TopBar](#4-app-shell--sidebar--topbar)
5. [Dashboard](#5-dashboard)
6. [Stat Cards](#6-stat-cards)
7. [StatusBadge Component](#7-statusbadge-component)
8. [AlertBanner Component](#8-alertbanner-component)
9. [Onboarding Checklist](#9-onboarding-checklist)
10. [PageIntro Component](#10-pageintro-component)
11. [Feature Tables](#11-feature-tables)
12. [Work Items — Kanban Cards](#12-work-items--kanban-cards)
13. [Empty States](#13-empty-states)
14. [Dialogs & Forms](#14-dialogs--forms)
15. [Summary: File-by-File Change List](#15-summary-file-by-file-change-list)

---

## 1. Design System Foundation

### `src/app/globals.css`

The CSS was recently stripped back to its core shadcn defaults. Several token layers and component utilities need to be restored and improved.

#### Issues Found

```
STRIPPED TOKENS (need restoring):
  ✗ Surface color tokens  (surface-1, surface-2, surface-floating) — removed
  ✗ Semantic colors       (success, warning, info + foregrounds)   — removed
  ✗ Typography scale      (text-body 15px, line-height 1.55)       — removed
  ✗ Component classes     (.page-shell, .page-title, etc.)         — removed
  ✗ Body subtle gradient                                           — removed
  ✗ Spacing tokens        (space-1 through space-16)               — removed

CONSEQUENCE:
  • OnboardingChecklist uses bg-surface-1 → will render transparent
  • PageIntro uses page-title / page-subtitle → will render as browser-default text
  • AlertBanner still uses hardcoded amber classes
  • Body font-size falls back to browser default 16px (inconsistent feel)
```

#### Proposed: Restore + Improve Token Layer

```
OLD globals.css (current — stripped):
────────────────────────────────────────────────────
:root {
  --radius: 0.625rem;
  [only shadcn core tokens]
  --sidebar-ring: oklch(0.708 0 0);   ← ends here
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }   ← no font-size/line-height
}


NEW globals.css (restored + improved):
────────────────────────────────────────────────────
@theme inline {
  [existing shadcn tokens...]
  --color-surface-1: var(--surface-1)          ← restore
  --color-surface-2: var(--surface-2)          ← restore
  --color-surface-floating: var(--surface-floating) ← restore
  --color-success: var(--success)              ← restore
  --color-success-foreground: var(--success-foreground) ← restore
  --color-warning: var(--warning)              ← restore
  --color-warning-foreground: var(--warning-foreground) ← restore
  --color-info: var(--info)                    ← restore
  --color-info-foreground: var(--info-foreground) ← restore
}

:root {
  [existing tokens...]
  --surface-1: oklch(0.995 0 0)                ← restore
  --surface-2: oklch(0.985 0 0)                ← restore
  --surface-floating: oklch(1 0 0)             ← restore
  --success: oklch(0.62 0.19 149)              ← restore
  --success-foreground: oklch(0.99 0 0)        ← restore
  --warning: oklch(0.75 0.16 78)               ← restore
  --warning-foreground: oklch(0.25 0.02 80)    ← restore
  --info: oklch(0.57 0.16 253)                 ← restore
  --info-foreground: oklch(0.99 0 0)           ← restore
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body {
    @apply bg-background text-foreground antialiased;
    font-size: 0.9375rem;    ← 15px (restore)
    line-height: 1.55;       ← restore
    background-image: linear-gradient(180deg,
      oklch(1 0 0) 0%, oklch(0.99 0 0) 100%); ← subtle depth
  }
  h1 { line-height: 1.2; }
  h2, h3 { line-height: 1.25; }
}

@layer components {
  .page-shell   { @apply mx-auto w-full max-w-[1200px] space-y-6 p-8; }
  .page-title   { @apply text-[1.75rem] font-semibold tracking-tight; }
  .page-subtitle { @apply mt-1 text-sm text-muted-foreground; }
  .surface-panel { @apply rounded-xl border border-border/70 bg-surface-floating; }
}
```

---

## 2. Auth Screens

### `src/app/(auth)/layout.tsx` + `src/app/(auth)/login/page.tsx`

#### Current State

```
┌─────────────────────────────────────────────────────────────┐
│  bg-muted/40  ← flat gray, no depth or atmosphere           │
│                                                             │
│             ┌───────────────────────┐                       │
│             │ WorkspaceOps          │ ← 2xl font-bold only  │
│             ├───────────────────────┤                       │
│             │ Sign in to your       │ ← CardHeader title    │
│             │ account               │                       │
│             │ Enter your email...   │ ← CardDescription     │
│             │ ─────────────────── │                       │
│             │ [Email             ]  │                       │
│             │ [Password          ]  │                       │
│             │ ─────────────────── │                       │
│             │ [      Sign In     ]  │                       │
│             │  Don't have account?  │                       │
│             └───────────────────────┘                       │
│                  max-w-sm, no shadow                        │
└─────────────────────────────────────────────────────────────┘

Issues:
  ✗ Auth layout stripped to just flex-center bg-muted/40 — no atmosphere
  ✗ Brand is only "WorkspaceOps" bold text — no tagline or identity
  ✗ Card has no elevation (no shadow) — blends into flat background
  ✗ CardTitle "Sign in to your account" repeats intent already clear from context
  ✗ Missing helpful footer text: "After sign in, you will select a workspace"
  ✗ Missing aria-invalid, autoComplete attributes (accessibility regression)
  ✗ No visual brand mark / icon prefix
```

#### Proposed: Atmospheric Brand-First Auth

```
NEW:
┌─────────────────────────────────────────────────────────────┐
│  Radial gradient bg (very subtle: oklch(0.97) → oklch(0.99))│
│  pointer-events-none overlay for depth                      │
│                                                             │
│       ┌ brand block (above card) ─────────────────┐        │
│       │  ◈  WorkspaceOps                           │        │
│       │  Workspace operations, simplified.         │        │
│       └────────────────────────────────────────────┘        │
│                                                             │
│       ┌ card (border-border/80 shadow-sm) ─────────┐       │
│       │  Welcome back               ← CardTitle    │       │
│       │  Sign in to your account    ← CardDesc     │       │
│       │  ─────────────────────────────────────── │       │
│       │  Email                                    │       │
│       │  [you@example.com                       ]  │       │
│       │  Password                                 │       │
│       │  [••••••                                 ]  │       │
│       │  ─────────────────────────────────────── │       │
│       │  [         Sign In          ]             │       │
│       │  After sign in, select a workspace.  ← p  │       │
│       │  Don't have an account? Sign up           │       │
│       └────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘

Changes:
  ✓ Auth layout: restore radial-gradient bg (pointer-events-none overlay)
  ✓ Add brand block ABOVE card: small icon + name + one-line tagline
  ✓ Card: add shadow-sm and border-border/80
  ✓ CardTitle: "Welcome back" (warmer, emotional vs functional)
  ✓ Restore helpful footer text: "After sign in, you will select a workspace"
  ✓ Restore aria-invalid and autoComplete on all inputs
  ✓ Card width: max-w-md (from max-w-sm) — slightly more comfortable
```

---

## 3. Workspace Selection

### `src/app/(app)/workspaces/page.tsx`

#### Current State

```
┌─────────────────────────────────────────────────────────────┐
│  WorkspaceOps  (text-xl font-bold)       [← Sign out]       │
├─────────────────────────────────────────────────────────────┤
│  bg-muted/40                                                │
│  max-w-4xl                                                  │
│                                                             │
│  Your Workspaces              [+ New Workspace]             │
│  Select a workspace to continue, or create a new one        │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Acme HQ  [OWN] │  │ Dev Sandbox    │  │ ...          │  │
│  │                │  │ [ADMIN]        │  │              │  │
│  │ Created Jan... │  │ Created Feb... │  │              │  │
│  │ ──────────── │  │ ──────────── │  │              │  │
│  │ [  Open →  ]   │  │ [  Open →  ]   │  │              │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                  2-col / 3-col grid                         │
└─────────────────────────────────────────────────────────────┘

Issues:
  ✗ 3-column grid cards are too compact — name gets truncated
  ✗ Header "WorkspaceOps" is text-xl font-bold only — no brand mark
  ✗ Role badge is inline in CardHeader — competes with workspace name visually
  ✗ "Open →" label is generic — doesn't convey "enter this workspace"
  ✗ Hardcoded roleVariant map duplicates StatusBadge component logic
  ✗ max-w-4xl is wide for a selection screen — user's eye travels too far
  ✗ No hover state on cards
```

#### Proposed: Focused Workspace Picker

```
NEW:
┌─────────────────────────────────────────────────────────────┐
│  ◈ WorkspaceOps                          [← Sign out]       │
├─────────────────────────────────────────────────────────────┤
│  bg-muted/40 with subtle gradient                           │
│  max-w-2xl mx-auto py-12 px-6                               │
│                                                             │
│  Choose a workspace           [+ New Workspace]             │
│  Select below to continue                                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ◈ Acme HQ                          [OWNER]  →       │   │
│  │    Created Jan 5, 2025                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ◈ Dev Sandbox                      [ADMIN]  →       │   │
│  │    Created Feb 2, 2025                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                  single-column list cards                   │
└─────────────────────────────────────────────────────────────┘

Changes:
  ✓ Single-column full-width cards (easier vertical scanning)
  ✓ Cards become clickable rows (onClick on full card, not just button)
  ✓ Remove redundant Open button — entire card is the CTA
  ✓ Add hover: border-border → border-foreground/25, shadow-sm
  ✓ Role badge uses <StatusBadge type="role"> instead of duplicated roleVariant map
  ✓ Building2 icon prefix for visual identity
  ✓ Header brand mark: small icon + "WorkspaceOps"
  ✓ Narrow to max-w-2xl for focus
  ✓ Title: "Choose a workspace" (clearer intent than "Your Workspaces")
```

---

## 4. App Shell — Sidebar + TopBar

### `src/components/layout/Sidebar.tsx` + `TopBar.tsx` + `AppShell.tsx`

#### Current State

```
┌──────────────────┬───────────────────────────────────────┐
│  w-60 border-r   │  h-12 border-b                        │
│  bg-sidebar      │  [breadcrumbs]        [ROLE badge]    │
├──────────────────┼───────────────────────────────────────┤
│ ┌──────────────┐ │  main: p-6                            │
│ │ Workspace    │ │  (double-padding: dashboard also p-8) │
│ │ Name   ⇅    │ │                                       │
│ └──────────────┘ │                                       │
│                  │                                       │
│  Dashboard       │                                       │
│  Entities        │                                       │
│  Documents       │                                       │
│  Work Items      │                                       │
│                  │                                       │
│  ▾ Settings      │  ← collapsible opens sub-items       │
│    Members       │                                       │
│    Doc Types     │                                       │
│    WI Types      │                                       │
│  Audit Logs      │                                       │
│                  │                                       │
├──────────────────│                                       │
│  ○ My Account    │                                       │
│  Sign out        │                                       │
└──────────────────┴───────────────────────────────────────┘

Issues:
  ✗ No section grouping labels — navigation is a flat undifferentiated list
  ✗ Collapsible settings breaks visual rhythm and requires 2 clicks to reach sub-pages
  ✗ Active state = bg-accent only, no left-border indicator (industry standard)
  ✗ "My Account" text is vague — doesn't show who is logged in
  ✗ Workspace switcher is a ghost button — low affordance, blends in
  ✗ AppShell main has p-6 AND dashboard has its own p-8 → double padding
  ✗ TopBar h-12 is very compact (48px) — breadcrumb text feels cramped
  ✗ Role badge is small outline badge — easy to miss
```

#### Proposed: Grouped Navigation Sidebar

```
NEW:
┌──────────────────┬───────────────────────────────────────┐
│  w-60 border-r   │  h-14 border-b                        │
│  bg-sidebar      │  [breadcrumbs]          [ROLE pill]   │
├──────────────────┼───────────────────────────────────────┤
│ ┌──────────────┐ │  main: p-0  ← pages control own p-8  │
│ │◈ Acme HQ  ⇅ │ │                                       │
│ └──────────────┘ │                                       │
│                  │                                       │
│  WORKSPACE       │  ← text-[10px] uppercase tracking     │
│ ▌ Dashboard      │  ← active: 2px left border + bg      │
│  Entities        │                                       │
│  Documents       │                                       │
│  Work Items      │                                       │
│                  │                                       │
│  ADMIN ONLY      │  ← section label (only if isAdmin)   │
│  Members         │  ← flat list, no collapsible          │
│  Doc Types       │                                       │
│  WI Types        │                                       │
│  Audit Logs      │                                       │
│                  │                                       │
├──────────────────│                                       │
│  ashwin@co.com   │  ← show real email from auth context  │
│  Sign out        │                                       │
└──────────────────┴───────────────────────────────────────┘

Changes:
  ✓ Add section labels: "WORKSPACE" and "ADMIN ONLY"
    className: "px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
  ✓ Remove Collapsible — flatten Settings sub-pages under ADMIN ONLY label
  ✓ Active nav item: add left border indicator
    className: "border-l-2 border-primary bg-accent font-medium"
    (inactive: no border, borderLeft transparent for layout stability)
  ✓ Workspace switcher: add Building2 icon prefix for clearer affordance
  ✓ TopBar: h-14 (56px, up from h-12/48px) — more comfortable
  ✓ Role badge: slightly more prominent — maybe "secondary" variant with padding
  ✓ User section: show auth context email (UserCircle icon + email text)
  ✓ AppShell main: remove p-6 — each page handles its own padding
```

**ASCII: Active State Before vs After**

```
BEFORE (no left border):              AFTER (left border + bg):
┌──────────────────────────┐         ┌──────────────────────────┐
│ ■ Dashboard              │         │▌■ Dashboard              │
│   bg-accent fill only    │         │  border-l-2 border-primary│
└──────────────────────────┘         └──────────────────────────┘
```

---

## 5. Dashboard

### `src/app/(app)/[workspaceId]/dashboard/page.tsx`

#### Current State

```
dashboard/page.tsx (custom p-8 space-y-6 wrapper):
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                  │
│  Workspace overview                                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Entities │  │Documents │  │WorkItems │  ← stat cards    │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│  [AlertBanner — renders here if documents expiring]         │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────┐             │
│  │ Document Types     │  │ Work Item Types    │             │
│  │ • TypeA  [Exp][3f] │  │ • Task    [EMPL]  │             │
│  │ Manage →           │  │ Manage →           │             │
│  └────────────────────┘  └────────────────────┘             │
└─────────────────────────────────────────────────────────────┘

Issues:
  ✗ Uses own p-8 wrapper instead of .page-shell (inconsistent with all other pages)
  ✗ Dashboard title is "text-2xl font-bold" — not using page-title class
  ✗ OnboardingChecklist is NOT rendered on this page (missing import!)
  ✗ AlertBanner is after stats — urgent info should appear first
  ✗ Config cards (Doc Types, WI Types) use plain Card — visually identical to stat cards
  ✗ No section separator between stats and config
  ✗ Loading skeleton has its own p-8 → double padding with AppShell
```

#### Proposed: Information-Priority Dashboard

```
NEW (page-shell class, consistent with all pages):
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                  │
│  Workspace overview                                         │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [AlertBanner — moved ABOVE stats — urgent info first]      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Entities │  │Documents │  │WorkItems │  ← stat cards    │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│  [OnboardingChecklist — added back (was missing!)]          │
│                                                             │
│  CONFIGURATION                         ← section label     │
│  ┌────────────────────┐  ┌────────────────────┐             │
│  │ Document Types     │  │ Work Item Types    │             │
│  │ bg-surface-1 bg    │  │ bg-surface-1 bg   │             │
│  │ • TypeA  [Exp][3f] │  │ • Task    [EMPL]  │             │
│  │ [Manage types →]   │  │ [Manage types →]  │             │
│  └────────────────────┘  └────────────────────┘             │
└─────────────────────────────────────────────────────────────┘

Changes:
  ✓ Replace custom p-8 wrapper → .page-shell class (consistent padding)
  ✓ Title → use page-title class (text-[1.75rem] font-semibold tracking-tight)
  ✓ AlertBanner: move above stat cards (urgency-first layout)
  ✓ Add OnboardingChecklist import and render it (currently MISSING)
  ✓ Section label "CONFIGURATION" before the 2-col type cards
  ✓ Config cards: add bg-surface-1 to differentiate from stat cards
  ✓ Config cards footer: use Button variant="link" instead of raw <Link>
  ✓ Loading skeleton: use page-shell class (removes double padding)
```

---

## 6. Stat Cards

### `src/components/shared/StatCard.tsx`

#### Current State

```
┌──────────────────────┐
│ Documents            │  ← text-sm font-medium text-muted (CardTitle)
│ ─────────────────── │
│ 89                   │  ← text-3xl font-bold
│                      │
│  ●  Valid       62   │  ← inline style dot (hex #16a34a)
│  ●  Expiring    18   │  ← inline style dot (hex #d97706)
│  ●  Expired      9   │  ← inline style dot (hex #dc2626)
└──────────────────────┘

Issues:
  ✗ Color dots use inline style={{ backgroundColor: hex }} — raw hex bypasses tokens
  ✗ Entity breakdown items have NO color dots (inconsistent with Documents/WorkItems)
  ✗ Title is text-sm — too small for a card header anchor
  ✗ CardTitle class (text-sm) makes it feel like a caption, not a heading
  ✗ No visual context for what the total number means
  ✗ No hover state — cards look static
```

#### Proposed: Token-Based Stat Cards

```
NEW:
┌──────────────────────┐
│  DOCUMENTS           │  ← text-[11px] uppercase tracking-wider muted
│  89 total            │  ← text-3xl bold + "total" in text-xs muted
│ ─────────────────── │
│  ●  Valid       62   │  ← bg-success class (from token)
│  ●  Expiring    18   │  ← bg-warning class (from token)
│  ●  Expired      9   │  ← bg-destructive class (from token)
└──────────────────────┘

Color dot classes (replace inline styles):
  Documents:
    Valid:    className="bg-success"         ← was style={{ backgroundColor: '#16a34a' }}
    Expiring: className="bg-warning"         ← was style={{ backgroundColor: '#d97706' }}
    Expired:  className="bg-destructive"     ← was style={{ backgroundColor: '#dc2626' }}

  WorkItems:
    Active:    className="bg-info"           ← was style={{ backgroundColor: '#2563eb' }}
    Completed: className="bg-success"        ← was style={{ backgroundColor: '#16a34a' }}
    Draft:     className="bg-muted-foreground/40" ← no color was there before

  Entities: Add neutral dots bg-muted-foreground/40 for consistency

Typography:
  CardTitle: text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground
  Total:     text-3xl font-bold + <span className="text-xs font-normal ml-1.5 text-muted-foreground">total</span>

Changes:
  ✓ Replace all 3 inline style color dots with Tailwind token classes
  ✓ Entity breakdown: add bg-muted-foreground/40 dots (currently missing)
  ✓ WorkItems Active: add bg-info dot (currently missing)
  ✓ Title upgraded to uppercase tracking label style
  ✓ Add "total" label next to count for context
  ✓ Card: add hover:shadow-sm transition-shadow duration-150
```

---

## 7. StatusBadge Component

### `src/components/shared/StatusBadge.tsx`

#### Current State

```tsx
// ✗ Hardcoded Tailwind palette classes bypass the design token system
const colorMap: Record<string, string> = {
  VALID:     "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  EXPIRING:  "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  EXPIRED:   "bg-red-100   text-red-800   border-red-200   hover:bg-red-100",
  ACTIVE:    "bg-blue-100  text-blue-800  border-blue-200  hover:bg-blue-100",
  COMPLETED: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  HIGH:      "bg-red-100   text-red-800   border-red-200   hover:bg-red-100",
  MEDIUM:    "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
}
```

#### Proposed: Token-Based Badge Colors

```tsx
// ✓ Semantic token classes — adapts automatically if tokens change
const colorMap: Record<string, string> = {
  VALID:     "bg-success/15    text-success              border-success/20",
  EXPIRING:  "bg-warning/15    text-warning-foreground   border-warning/20",
  EXPIRED:   "bg-destructive/10 text-destructive         border-destructive/20",
  ACTIVE:    "bg-info/15       text-info                 border-info/20",
  COMPLETED: "bg-success/15    text-success              border-success/20",
  HIGH:      "bg-destructive/10 text-destructive         border-destructive/20",
  MEDIUM:    "bg-warning/15    text-warning-foreground   border-warning/20",
}
```

```
Visual output comparison (VALID badge):

OLD:  bg-green-100 text-green-800     ← fixed to Tailwind green-* palette
NEW:  bg-success/15 text-success      ← driven by --success OKLCH token

If --success token updates → all badges update.
If Tailwind palette changes → old approach breaks. New approach stays stable.
```

---

## 8. AlertBanner Component

### `src/components/features/dashboard/AlertBanner.tsx`

#### Current State

```
[⚠] You have 9 expired and 18 expiring soon documents.   [View expiring documents →]
    border-amber-300 bg-amber-50 text-amber-900

Issues:
  ✗ bg-amber-50, border-amber-300, text-amber-900 → all hardcoded Tailwind amber
  ✗ AlertTriangle icon: text-amber-600 → hardcoded
  ✗ CTA uses text arrow → glyph instead of icon
  ✗ Expired (urgent) and expiring (caution) not visually distinguished
```

#### Proposed: Tokenized Warning Alert

```
NEW:
[⚠] 9 documents expired · 18 expiring soon              [Review →  ]
    border-warning/30 bg-warning/8 text-foreground

Changes:
  ✓ border-amber-300  → border-warning/30
  ✓ bg-amber-50       → bg-warning/8
  ✓ text-amber-900    → text-foreground  (better contrast ratio)
  ✓ text-amber-600 icon → text-warning-foreground
  ✓ CTA: add <ArrowRight className="h-3.5 w-3.5" /> instead of → glyph
  ✓ Separate expired count from expiring (expired is more urgent)
```

---

## 9. Onboarding Checklist

### `src/components/features/dashboard/OnboardingChecklist.tsx`

Well-structured — needs visual polish only.

#### Current State

```
┌─────────────────────────────────────────────────────────────┐
│ Setup checklist                                             │
│ Complete these quick tasks to fully operationalize...       │
│                                                             │
│  2 of 4 completed                                    50%   │
│  [████████████░░░░░] ← h-2 progress bar (thin)             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ✓ Add your first entity             (looks same)     │  │
│  │ ○ Set up document types             [Open →]         │  │
│  │ ✓ Upload first document             (looks same)     │  │
│  │ ○ Create first work item            [Open →]         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Issues:
  ✗ Done and pending items look nearly identical — no visual hierarchy
  ✗ "Open →" uses ghost/sm — easy to miss
  ✗ Progress bar h-2 is thin — weak visual indicator
  ✗ "Setup checklist" title is bland
  ✗ "2 of 4 completed" is left-aligned, percentage right — split feels disconnected
```

#### Proposed: Clear Progress + Hierarchy

```
NEW:
┌─────────────────────────────────────────────────────────────┐
│ Get started                               2 / 4 done        │
│ Complete these steps to set up your workspace.              │
│                                                             │
│  [█████████████░░░░░░░░░░░] 50%  ← h-2.5 (slightly thicker)│
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ✓ Add your first entity        (opacity-60, dimmed)  │  │
│  │ ✓ Upload first document        (opacity-60, dimmed)  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌── NEXT ──────────────────────────────────────────────┐  │
│  │ ○ Set up document types             [ Go → ]         │  │
│  │   Define templates for uploads                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ○ Create first work item            [ Go → ]         │  │
│  │   Track and assign tasks                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Changes:
  ✓ Title: "Get started" (warmer than "Setup checklist")
  ✓ Header right: "2 / 4 done" (compact, scannable)
  ✓ Completed items: opacity-60 (visually deprioritized)
  ✓ First pending item: "NEXT UP" micro-label for guidance
  ✓ CTA button: variant="outline" size="sm" (from ghost — more visible)
  ✓ Progress bar: h-2.5 (from h-2)
  ✓ Progress label: inline right of bar (remove separate split row)
```

---

## 10. PageIntro Component

### `src/components/shared/PageIntro.tsx`

#### Current State

```
Entities                             [+ Add Entity]
Manage and track customers, employees, vendors
─────────────────────────────────────────────────
25 entities  ← raw text, uppercase tracking

Issues:
  ✗ page-title / page-subtitle classes removed from globals.css → unstyled
  ✗ Meta text is raw uppercase tracking — too heavy as plain text
  ✗ border-border/70 is slightly too light — separator disappears on white bg
  ✗ pb-4 — tight before content
```

#### Proposed: Polished Page Header

```
NEW:
Entities                             [+ Add Entity]
Manage and track customers, employees, vendors
─────────────────────────────────────────────────
[25 entities] ← Badge variant="secondary" pill

Changes:
  ✓ Restore page-title class in globals.css (required)
  ✓ Meta text: wrap in <Badge variant="secondary" className="text-xs">
     (from raw uppercase text — more contained, scannable)
  ✓ Separator: border-border (full, not /70) — cleaner visual cut
  ✓ pb-5 (from pb-4) — slightly more breathing room
```

---

## 11. Feature Tables

### All entity/document/work-item tables

#### Current State

```
┌────────────────────────────────────────────────────────────┐
│  Name          │  Role      │  Created     │ Actions       │
├────────────────────────────────────────────────────────────┤
│  Acme Corp     │ [CUSTOMER] │ Jan 5, 2025  │ [✏][🗑]       │
│  John Doe      │ [EMPLOYEE] │ Jan 6, 2025  │ [✏][🗑]       │
└────────────────────────────────────────────────────────────┘

Issues:
  ✗ No hover state on rows — no interactivity affordance
  ✗ Action buttons h-8 w-8 (32px) — below 44px touch target guideline
  ✗ Delete button has no tooltip — unclear it's admin-only
  ✗ Clickable name cells have no cursor-pointer
  ✗ Table header lacks visual weight
  ✗ Actions column not right-aligned — inconsistent
```

#### Proposed: Interactive Table Rows

```
NEW:
┌────────────────────────────────────────────────────────────┐
│  Name          │  Role      │  Created     │    Actions    │
├────────────────────────────────────────────────────────────┤
│  Acme Corp     │ [CUSTOMER] │ Jan 5, 2025  │   [✏]  [🗑]  │ ← on hover
│  John Doe      │ [EMPLOYEE] │ Jan 6, 2025  │              │
└────────────────────────────────────────────────────────────┘
  ↑ hover: bg-muted/40 — row highlights on mouse-over

Changes:
  ✓ TableRow: "hover:bg-muted/40 transition-colors duration-100"
  ✓ Action buttons: h-9 w-9 (from h-8 w-8) — larger hit area
  ✓ Delete button: add Tooltip "Remove (admin only)"
  ✓ Clickable name cells: add "cursor-pointer" class
  ✓ Table header: add font-medium to TableHead (was default weight)
  ✓ Actions TableHead: text-right, actions TableCell: flex justify-end
```

---

## 12. Work Items — Kanban Cards

### `src/components/features/work-items/WorkItemCard.tsx`

#### Current State

```
┌──────────────────────────────────────┐
│ Fix invoice processing   [HIGH ▸]    │  ← priority top-right
├──────────────────────────────────────┤
│ Acme Corp                            │  ← entity, no icon
│ 📅 Jan 15, 2025                      │  ← CalendarDays h-3.5 w-3.5 (tiny)
├──────────────────────────────────────┤
│ [Unstart]   [Complete ✓]             │  ← emoji ✓, vague "Unstart" label
└──────────────────────────────────────┘

Issues:
  ✗ "Complete ✓" uses emoji ✓ character — not an icon
  ✗ "Unstart" is non-standard vocabulary — confusing
  ✗ CalendarDays icon h-3.5 w-3.5 is too small to read
  ✗ Entity name has no icon — plain muted text
  ✗ No hover state on card
```

#### Proposed: Cleaner Work Item Card

```
NEW:
┌──────────────────────────────────────┐
│ [HIGH]                               │  ← priority badge top-left anchor
│ Fix invoice processing               │  ← title below priority
├──────────────────────────────────────┤
│ 👤 Acme Corp                         │  ← User2 icon h-3.5 w-3.5
│ 📅 Jan 15, 2025                      │  ← CalendarDays h-4 w-4
├──────────────────────────────────────┤
│ [To Draft]   [✓ Complete]            │  ← CheckIcon from lucide
└──────────────────────────────────────┘

Changes:
  ✓ "Complete ✓" emoji → <Check className="h-3.5 w-3.5 mr-1" />
  ✓ "Unstart" → "To Draft" (clearer mental model)
  ✓ CalendarDays: h-4 w-4 (from h-3.5 w-3.5)
  ✓ Entity name: add <User2 className="h-3.5 w-3.5 text-muted-foreground mr-1" />
  ✓ Priority badge: move to its own row above title for cleaner layout
  ✓ Card: add "hover:shadow-sm transition-shadow duration-150 cursor-pointer"
  ✓ "Complete" button: variant="success" (clear positive action signal)
```

---

## 13. Empty States

### `src/components/shared/EmptyState.tsx` (across all feature pages)

#### Current State

```
              ┌──────────────────────────┐
              │                          │
              │  [Users icon — h-12 w-12 │
              │   text-muted-foreground] │ ← large, same color as description
              │                          │
              │  No entities found       │ ← text-lg
              │  Create your first       │ ← text-sm muted
              │  entity to start...      │
              │                          │
              │  [+ Add Entity]          │
              │                          │
              └──────────────────────────┘
                   py-16, centered

Issues:
  ✗ h-12 icon is large but same color as description text — no visual hierarchy
  ✗ py-16 is a lot of vertical dead space
  ✗ Icon has no visual container — floats in space
```

#### Proposed: Contained Empty State

```
NEW:
              ┌──────────────────────────┐
              │                          │
              │   ┌──────────────┐        │
              │   │  [icon h-8]  │  ← icon in bg-muted/60 rounded-xl p-3
              │   └──────────────┘        │
              │                          │
              │  No entities yet         │ ← text-base font-semibold
              │  Add customers, vendors, │ ← text-sm muted (specific)
              │  employees, or self.     │
              │                          │
              │  [+ Add Entity]          │
              │                          │
              └──────────────────────────┘
                   py-12 (tighter)

Changes:
  ✓ Icon: wrap in <div className="bg-muted/60 rounded-xl p-3 mb-3">
  ✓ Icon size: h-8 w-8 (from h-12) inside container — cleaner
  ✓ py-12 (from py-16) — tighter, less dead space
  ✓ Title: text-base font-semibold (from text-lg) — proportionate
```

---

## 14. Dialogs & Forms

### All feature dialogs

#### Current State

```
Issues across all dialogs:
  ✗ Cancel button uses variant="outline" — same visual weight as primary action
  ✗ Required asterisk (*) is plain text — not colored red
  ✗ Form spacing inconsistent: some use space-y-3, others space-y-4
  ✗ No DialogDescription in most dialogs — accessibility gap
  ✗ Upload dialog step indicators use custom numbered circles with weak styling
```

#### Proposed: Consistent Dialog Pattern

```
Standardize across all dialogs:
  ✓ Cancel button: variant="ghost" (de-emphasize)
  ✓ Primary button: variant="default" (emphasize)
  ✓ Required asterisk: <span className="text-destructive ml-0.5">*</span>
  ✓ Form spacing: space-y-4 everywhere (standardize)
  ✓ Add DialogDescription to all dialogs (1 short sentence)
  ✓ sm:max-w-md for simple forms, sm:max-w-lg for complex (upload stepper)

Upload stepper (UploadDocumentDialog) step indicators:
  OLD: Custom numbered circles with manual border/fill logic
  NEW: Use numbered circles with clearer active/complete distinction
       Complete: bg-primary text-primary-foreground + CheckIcon
       Active:   border-2 border-primary text-primary (current)
       Pending:  border border-border text-muted-foreground
```

---

## 15. Summary: File-by-File Change List

### Priority 1 — Foundation (must do first, others depend on these)

| File | Change | Risk |
|------|--------|------|
| `src/app/globals.css` | Restore surface tokens, semantic colors, body styles, component classes | 🟡 Medium (CSS only) |
| `src/components/shared/StatusBadge.tsx` | Replace hardcoded Tailwind colors → token classes | 🟢 Low |
| `src/components/features/dashboard/AlertBanner.tsx` | Replace amber hardcoded → warning token | 🟢 Low |
| `src/components/shared/StatCard.tsx` | Replace inline style dots → token Tailwind classes | 🟢 Low |

### Priority 2 — Layout & Shell

| File | Change | Risk |
|------|--------|------|
| `src/app/(auth)/layout.tsx` | Restore radial gradient | 🟢 Low |
| `src/app/(auth)/login/page.tsx` | Brand block, shadow-sm, restore aria/helper text | 🟢 Low |
| `src/app/(auth)/signup/page.tsx` | Same as login | 🟢 Low |
| `src/components/layout/AppShell.tsx` | Remove main p-6 | 🟢 Low |
| `src/components/layout/Sidebar.tsx` | Section labels, flatten settings, active indicator, email in user section | 🟡 Medium |
| `src/components/layout/TopBar.tsx` | h-14 (from h-12) | 🟢 Low |

### Priority 3 — Pages & Feature Components

| File | Change | Risk |
|------|--------|------|
| `src/app/(app)/workspaces/page.tsx` | Single-col cards, use StatusBadge, hover state | 🟢 Low |
| `src/app/(app)/[workspaceId]/dashboard/page.tsx` | page-shell, AlertBanner position, add OnboardingChecklist, section label | 🟡 Medium |
| `src/components/features/dashboard/OnboardingChecklist.tsx` | Visual polish only (opacity, button variant, title) | 🟢 Low |
| `src/components/shared/PageIntro.tsx` | Badge meta, border weight, pb-5 | 🟢 Low |
| `src/components/shared/EmptyState.tsx` | Icon container, py-12 | 🟢 Low |
| `src/components/features/work-items/WorkItemCard.tsx` | Replace emoji, icon sizes, label changes, hover | 🟢 Low |

### Priority 4 — Tables & Dialogs (polish pass)

| File | Change | Risk |
|------|--------|------|
| All \*Table.tsx | Row hover, cursor-pointer, button h-9 | 🟢 Low |
| All \*Dialog.tsx | Cancel→ghost, required asterisk, add DialogDescription | 🟢 Low |
| `UploadDocumentDialog.tsx` | Stepper visual polish | 🟢 Low |

---

## Design Principles Applied

```
╔══════════════════════════════════════════════════════════════╗
║  DESIGN PHILOSOPHY: Minimal Operational SaaS                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Visual Hierarchy  Size → Weight → Color (in that order)    ║
║  Spacing           8pt rhythm: 4, 8, 12, 16, 24, 32, 40px  ║
║  Color System      Neutral palette + semantic status tokens  ║
║  Typography        Single typeface, 4 sizes, 3 weights       ║
║  Motion            150–200ms ease, transform/opacity only    ║
║  Density           Medium — enough space, not wasteful       ║
║                                                              ║
║  KEEP  ✓  Black/white/gray neutral palette                   ║
║  KEEP  ✓  Lucide icons throughout                            ║
║  KEEP  ✓  All data flows, API calls, business logic          ║
║  KEEP  ✓  shadcn/ui component library                        ║
║  ADD   ✓  Token-based semantic colors for status indicators  ║
║  ADD   ✓  Surface background hierarchy (surface-1/2)         ║
║  ADD   ✓  Navigation section grouping labels                 ║
║  ADD   ✓  Active state left-border indicator in sidebar      ║
║  FIX   ✓  OnboardingChecklist missing from dashboard         ║
║  FIX   ✓  Double padding in AppShell + dashboard pages       ║
║  REMOVE✓  Hardcoded hex colors in StatCard/StatusBadge       ║
║  REMOVE✓  Emoji characters in button labels                  ║
║  REMOVE✓  Collapsible Settings in sidebar (flatten it)       ║
╚══════════════════════════════════════════════════════════════╝
```

---

## What We Are NOT Changing

- ✅ All API calls, response parsing, and React Query logic
- ✅ Route structure and Next.js navigation
- ✅ Form validation schemas (zod + react-hook-form)
- ✅ Auth flow (login → workspace → dashboard)
- ✅ Role-based access control rendering
- ✅ Multi-step upload dialog logic (only step indicator visuals)
- ✅ The neutral/black primary color tone
- ✅ All functional behavior of components
