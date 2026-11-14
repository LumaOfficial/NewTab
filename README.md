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
- A widget library of 57 widgets in eight categories (essentials, productivity, time,
  navigation, media, information, browser, personal), each lazy-loaded and isolated behind
  an error boundary. Widgets that need a permission or a connected service say so instead of
  pretending to work.
- A layout editor: drag widgets by their handle, resize, pin, hide, lock the layout, apply
  one of eight presets, save a layout and reuse it, and restore the previous arrangement.
- Workspaces: each one keeps its own theme, layout, widgets, notes, tasks, shortcuts and
  calendar; create, rename, duplicate, delete, plus a temporary guest workspace.
- 14 built-in themes plus a custom theme editor, light / dark / system modes, and controls for
  background, typography, surfaces and motion — all driven by one token set.
- Accessibility settings: high contrast, reduced motion, large text, colour-blind-safe accents
  and text spacing, plus remappable keyboard shortcuts.
- A first-run onboarding wizard that picks a theme, a layout and starting widgets.
- Reusable primitives: button, icon button, card, input, textarea, select, switch,
  segmented control, dialog, menu, badge, empty state.
- Local storage for every workspace, restored when the browser reopens, validated field by
  field on read.
- Settings drawer with Appearance, Themes, Layouts, Workspaces, Widgets, Accessibility,
  Shortcuts, Onboarding, Data & storage, Recently deleted, Account and About — plus clearly
  labelled "coming later" sections that hold no fake functionality.
- Reset-to-defaults and layout reset behind confirmation dialogs.

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

Explicitly **not** in this phase: AI, collaboration, calendar and weather data from a real
provider, and any integration that would need credentials this repository does not have.

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

One versioned record (`luma.dashboard.v1`) holds every workspace plus the settings that are
shared across them:

```ts
interface DashboardRoot {
  version: number;
  activeWorkspaceId: string;
  workspaces: Workspace[]; // each with its own DashboardData + layout history
  customThemes: CustomTheme[];
  savedLayouts: SavedLayout[];
  onboarding: OnboardingState;
}

interface DashboardData {
  settings: DashboardSettings; // theme, layout, background, accessibility, keyboard, widgets…
  shortcuts: Shortcut[];
  notes: Note[];
  tasks: Task[];
  events: CalendarEvent[];
  trash: TrashEntry[]; // soft-deleted notes, tasks and shortcuts
  widgetState: Record<string, Record<string, unknown>>;
}
```

Reads are validated field by field (`sanitizeDashboard`), so older or hand-edited data
degrades to defaults instead of breaking the page. Writes are debounced and failures are
surfaced to the user rather than silently dropped.

## Project structure

```
public/manifest.json        Manifest V3 definition + icons
src/main.tsx                Entry
src/pages/NewTabPage.tsx    Dashboard + onboarding + settings drawer + account panel
src/components/ui/          Reusable primitives (buttons, inputs, dialog, menu, …)
src/components/dashboard/   Dashboard shell, layout editor, workspace switcher, background
src/components/onboarding/  First-run wizard (theme, layout, starting widgets)
src/components/settings/    Settings drawer and its sections
src/components/account/     Sign-in, recovery, account, devices, sync, integrations, privacy
src/account/                Account provider, device identity, shared types
src/services/               HTTP client + auth, sync, integration and privacy services
src/sync/                   Sync categories (slice/apply/fingerprint) and the sync provider
src/widgets/catalogue.ts    Every widget's metadata (no React) — the single source of truth
src/widgets/registry.tsx    Widget id → lazily imported component
src/widgets/<category>/     Widget components, grouped by category
src/widgets/presets.ts      Preset layouts
src/storage/                Storage adapter (chrome.storage.local → localStorage) + schema
src/state/                  Reducer, provider and actions
src/theme/                  Built-in themes, custom themes, <html data-theme> application
src/lib/                    Formatting, dates, keyboard, search engines/tools, hooks
src/styles/                 Tokens, base styles, components, dashboard, customization, settings
server/                     Optional account service: Express, JSON store, scrypt, sessions
```

## Extension points

- **New widget**: append a descriptor to `WIDGETS` in `src/widgets/catalogue.ts`, write the
  component next to its category in `src/widgets/<category>/`, and add one line to
  `src/widgets/registry.tsx`. Saved dashboards pick it up automatically because stored
  layouts are normalised on load.
- **New settings section**: add an entry to `SETTINGS_SECTIONS`; real sections get a
  component in `SettingsPanel`, future ones fall back to `ComingSoonSection`.
- **New theme**: append a `BuiltInTheme` in `src/theme/themes.ts`. Tokens are applied through
  CSS variables, so nothing else reads colours directly.

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

AI assist · collaboration · real calendar, weather, media and email providers (they need
OAuth clients and API keys) · backup import.
