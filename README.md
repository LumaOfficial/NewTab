# Luma New Tab

A calm, customizable new-tab dashboard for **Opera** (and any Chromium browser: Chrome, Edge).

This repository is the **foundation release** plus the **account, sync and integrations
foundation**. The new-tab page, design system, widget framework and local persistence all work
offline with no account. Signing in adds optional sync through the small account service in
`server/`; nothing else leaves the browser.

> Luma is an original product. It takes inspiration only from the *category* of new-tab
> dashboards — the branding, design system, copy and code here are its own.

## What's in this phase

- New-tab page with clock, date, greeting, search, shortcuts, notes and tasks.
- Light / dark / system themes driven by one token set.
- Reusable primitives: button, icon button, card, input, textarea, select, switch,
  segmented control, dialog, menu, badge, empty state.
- Modular widgets: add one to `src/widgets/widgets.ts` + a component + one registry line.
- Local storage for theme, widget visibility/order, shortcuts, notes, tasks and settings,
  restored when the browser reopens.
- Settings drawer with Appearance, Dashboard widgets, Shortcuts, Data & storage, Recently
  deleted, About — plus clearly labelled "coming later" sections (AI, workspaces, advanced
  themes) that hold no fake functionality.
- Reset-to-defaults behind a confirmation dialog.

Also in this phase:

- **Accounts**: email/password sign-up and sign-in, email verification, account recovery and
  password reset, sign out, sign out everywhere, device management, session persistence, and
  Google/Apple/Microsoft sign-in buttons that stay disabled until their OAuth clients exist.
- **Sync**: six individually toggleable categories, automatic and manual sync, last-synced
  time, pending/offline/failed states with retry, conflicts compared side by side, category
  version numbers, and local changes queued while offline.
- **Data safety**: soft deletion with a "Recently deleted" list (50 items, restore or purge),
  never deleting local data on sign-out, and validation on every read.
- **Integrations**: per-service cards with permissions, connect/disconnect, and honest states
  (`connected`, `needs credentials`, `needs reconnect`, `unavailable`, `no connection needed`).
- **Privacy controls**: export, delete synchronized data, disconnect every integration, sign
  out everywhere, delete account — each behind a confirmation.

Explicitly **not** in this phase: AI, collaboration, advanced widgets, the full onboarding
flow, and any integration that would need credentials this repository does not have.

## Requirements

- Node.js 20.19+ (or 22.12+) and npm for the build tooling.
- Opera, Chrome or Edge to load the unpacked extension.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173 — the same UI, using browser localStorage
npm run typecheck  # TypeScript, no emit
npm run build      # type-check + production bundle in dist/
```

The account service is optional; the dashboard runs without it.

```bash
cd server && npm install
npm start          # http://localhost:8000 — /api/health reports readiness
```

`npm run dev` renders the dashboard as a normal web page and proxies `/api` to
`http://localhost:8000` (override with `LUMA_API_PROXY_TARGET`). Set `VITE_LUMA_API_URL` when
building the extension against a deployed account service — an extension build also needs a
host permission for that origin before sign-in can work inside Opera.

## Load the extension

1. `npm run build`
2. Opera: open `opera://extensions` → enable **Developer mode** → **Load unpacked** → pick
   the generated `dist/` folder. (Chrome: `chrome://extensions`, Edge: `edge://extensions`.)
3. Open a new tab — Luma replaces it.

The manifest registers the page with `chrome_url_overrides.newtab` and requests a single
permission, `storage`.

## Storage model

One versioned record (`luma.dashboard.v1`) holds the whole dashboard:

```ts
interface DashboardData {
  settings: DashboardSettings; // theme, clock format, name, search engine, widget order/visibility
  shortcuts: Shortcut[];
  notes: Note[];
  tasks: Task[];
}
```

Reads are validated field by field (`sanitizeDashboard`), so older or hand-edited data
degrades to defaults instead of breaking the page. Writes are debounced and failures are
surfaced to the user rather than silently dropped.

## Project structure

```
public/manifest.json        Manifest V3 definition + icons
src/main.tsx                Entry
src/pages/NewTabPage.tsx    Dashboard + settings drawer + account panel + storage warning
src/components/ui/          Reusable primitives (buttons, inputs, dialog, menu, …)
src/components/dashboard/   Dashboard shell (layout from saved widget order)
src/components/settings/    Settings drawer and its sections
src/components/account/     Sign-in, recovery, account, devices, sync, integrations, privacy
src/account/                Account provider, device identity, shared types
src/services/               HTTP client + auth, sync, integration and privacy services
src/sync/                   Sync categories (slice/apply/fingerprint) and the sync provider
src/widgets/                Widget registry and the starter widgets
src/storage/                Storage adapter (chrome.storage.local → localStorage) + schema
src/state/                  Reducer, provider and actions
src/theme/                  Theme preference → <html data-theme>
src/lib/                    Formatting, search engines, URL validation, hooks
src/styles/                 Tokens, base styles, components, dashboard, settings, account
server/                     Optional account service: Express, JSON store, scrypt, sessions
```

## Extension points

- **New widget**: add an id + metadata in `src/widgets/widgets.ts`, create the component in
  `src/widgets/`, register it in `src/widgets/index.tsx`. Saved dashboards pick it up
  automatically because the stored order is normalised on load.
- **New settings section**: add an entry to `SETTINGS_SECTIONS`; real sections get a
  component in `SettingsPanel`, future ones fall back to `ComingSoonSection`.
- **New theme**: add tokens under a new `[data-theme='…']` block and extend
  `ThemePreference`. Nothing else reads colours directly.

## Account service

`server/` is a small Express service with a single JSON store — no database server to run.

- Passwords are stored only as salted scrypt hashes. Sessions are random opaque tokens in an
  HttpOnly `luma_session` cookie, one row per device, so "sign out everywhere" really revokes.
- Each sync category carries a version. A push with a stale `baseVersion` answers `409` with the
  remote copy, and the client shows the local-versus-cloud comparison instead of overwriting.
- Integration tokens are encrypted with AES-256-GCM using `LUMA_TOKEN_KEY`.
- Social sign-in and OAuth integrations implement the real authorization-code flow but stay
  inert until the matching client credentials exist (`GOOGLE_CLIENT_ID`, `MICROSOFT_CLIENT_ID`,
  `APPLE_CLIENT_ID`, `SPOTIFY_CLIENT_ID`, `WEATHER_API_KEY`). Without them the UI says
  "setup needed" and the API answers `needs_credentials` — no connection is ever faked.
- Email verification and password reset codes are echoed in the UI only when
  `LUMA_EXPOSE_DEV_CODES=1` (the sandbox), because no mail provider is connected.

## Roadmap (later phases)

Onboarding · calendar/weather widgets · AI assist · workspaces · advanced themes · backup
import.
