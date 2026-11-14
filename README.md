# Luma New Tab

A calm, customizable new-tab dashboard for **Opera** (and any Chromium browser: Chrome, Edge).

This repository is the **foundation release**. It ships a working, installable extension: the
new-tab page, a reusable design system, a modular widget framework, and local persistence.
Everything runs offline and nothing leaves the browser.

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
- Settings drawer with Appearance, Dashboard widgets, Shortcuts, Data & storage, About —
  plus clearly labelled "coming later" sections (accounts & sync, integrations, AI,
  workspaces, advanced themes, privacy) that hold no fake functionality.
- Reset-to-defaults behind a confirmation dialog.

Explicitly **not** in this phase: accounts, cloud sync, AI, integrations, workspaces,
advanced theming, collaboration. There is no backend and no mock API.

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

`npm run dev` renders the dashboard as a normal web page. Browser storage falls back to
`localStorage` there, so every save path can be exercised without the extension shell.

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
src/pages/NewTabPage.tsx    Dashboard + settings drawer + storage warning
src/components/ui/          Reusable primitives (buttons, inputs, dialog, menu, …)
src/components/dashboard/   Dashboard shell (layout from saved widget order)
src/components/settings/    Settings drawer and its sections
src/widgets/                Widget registry and the starter widgets
src/storage/                Storage adapter (chrome.storage.local → localStorage) + schema
src/state/                  Reducer, provider and actions
src/theme/                  Theme preference → <html data-theme>
src/lib/                    Formatting, search engines, URL validation, hooks
src/styles/                 Tokens, base styles, components, dashboard, settings
```

## Extension points

- **New widget**: add an id + metadata in `src/widgets/widgets.ts`, create the component in
  `src/widgets/`, register it in `src/widgets/index.tsx`. Saved dashboards pick it up
  automatically because the stored order is normalised on load.
- **New settings section**: add an entry to `SETTINGS_SECTIONS`; real sections get a
  component in `SettingsPanel`, future ones fall back to `ComingSoonSection`.
- **New theme**: add tokens under a new `[data-theme='…']` block and extend
  `ThemePreference`. Nothing else reads colours directly.

## Roadmap (later phases)

Accounts & sync · integrations (calendar, weather, bookmarks) · AI assist · workspaces ·
advanced themes · privacy controls and backup export/import · additional widgets.
