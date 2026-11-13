# Luma New Tab

A calm, modular new-tab dashboard, built as an Opera-compatible browser extension
(Manifest V3) with a React + Vite front end. Everything — shortcuts, notes, tasks and
preferences — is stored locally and works offline.

This repository is a **foundation release**: the dashboard, design system, widget system
and settings shell are in place so later phases can add accounts, sync, integrations, AI
features and workspaces without reworking what exists. Nothing in the "coming later"
sections is implemented yet, and nothing is presented as if it were.

## What's here

- **New-tab page** with a large clock and date, greeting, search bar, and quick shortcuts.
- **Starter widgets**: clock, greeting, search, shortcuts, notes, tasks.
- **Light and dark themes** with a system-following default.
- **Settings drawer** with Appearance, Dashboard widgets, Shortcuts, Data & storage,
  About, and clearly-labelled planned sections (accounts, integrations, AI, workspaces,
  advanced themes, privacy).
- **Local persistence**: theme, widget visibility and order, shortcuts, notes, tasks and
  dashboard settings survive a browser restart.
- **Reset to defaults** with a confirmation dialog.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests for the storage/search/time helpers
npm run build    # production build → dist/
```

`npm run dev` runs the dashboard as a normal web page. Because the extension APIs are
absent there, storage falls back to `localStorage`; the packaged extension uses
`chrome.storage.local` instead.

## Installing in Opera (and Chrome / Edge)

1. `npm run build`
2. Open `opera://extensions` (or `chrome://extensions`, `edge://extensions`).
3. Enable **Developer mode**, choose **Load unpacked**, and select the `dist/` folder.
4. Open a new tab — Luma New Tab replaces the default new-tab page.

`dist/` contains `manifest.json`, `background.js`, `index.html` and the bundled assets.
The only declared permission is `storage`, plus the toolbar action.

## Architecture

```
src/
  main.jsx, App.jsx        app shell
  lib/                     pure logic (no React): defaults, validation/normalization,
                           storage, search + URL rules, time helpers, ordering
  state/                   DashboardProvider (single source of truth), theme hook
  components/
    ui/                    Button, IconButton, Field, Input, Switch, SegmentedControl,
                           Dialog, Menu, Icon
    layout/                header + brand
    widgets/               WidgetShell (shared card chrome)
    dashboard/             WidgetGrid
    dialogs/               shortcut and note create/edit dialogs
    settings/              settings panel + sections
  widgets/                 one module per widget + the registry that maps ids to components
  styles/                  tokens, base, components, widgets, settings
```

### Adding a widget

1. Add its id to `WIDGET_IDS` in `src/lib/defaults.js`.
2. Create the component in `src/widgets/` rendering a `<WidgetShell>`.
3. Register it in `src/widgets/registry.jsx` (title, description, grid span, component).

The dashboard grid, settings widget list, visibility toggles and reordering all derive
from that registry; stored layouts are normalized against it on load.

### Adding a settings page

Add an entry to `src/components/settings/sections.jsx`. Implemented sections pass a
component; planned ones use `ComingSoonSection` with `planned: true`.

### Data model

`luma.dashboard.v1` in `chrome.storage.local` (or `localStorage` in the dev preview):

```json
{
  "version": 1,
  "settings": { "theme": "system", "clockFormat": "12h", "searchEngine": "duckduckgo", "displayName": "" },
  "layout": { "order": ["clock", "greeting", "search", "shortcuts", "notes", "tasks"], "hidden": [] },
  "shortcuts": [{ "id": "sc_…", "label": "Example", "url": "https://example.com/" }],
  "notes": [{ "id": "nt_…", "text": "…", "updatedAt": 0 }],
  "tasks": [{ "id": "tk_…", "text": "…", "done": false, "createdAt": 0 }]
}
```

Everything read from storage is validated and normalized in `src/lib/normalize.js`, so a
malformed record or an older layout degrades gracefully instead of breaking the page.

## Design notes

- All colors, type and spacing come from CSS custom properties in `src/styles/tokens.css`;
  the `data-theme` attribute on `<html>` drives light/dark.
- Animations are short and respect `prefers-reduced-motion`.
- Only http(s) shortcut URLs are accepted and stored, so links are always safe to render.
- No network calls, no analytics, no accounts, no fake data.

## Roadmap (later phases)

Accounts and sync, integrations, AI features, workspaces, advanced themes, and privacy &
security controls. These appear in settings as "Coming later" and are not implemented.
