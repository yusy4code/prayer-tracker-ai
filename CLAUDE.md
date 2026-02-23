# CLAUDE.md — Prayer Tracker AI

## Project Overview

A standalone web app for Muslims to track their five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha). Zero dependencies — pure HTML, CSS, and vanilla JavaScript with IndexedDB for local data persistence.

**Live URL:** https://prayer-tracking-ai.netlify.app/

---

## Architecture

No build process, no package manager, no framework. Three files make up the entire app:

| File | Purpose |
|------|---------|
| [index.html](index.html) | UI structure, tab layout, modals |
| [app.js](app.js) | All application logic and IndexedDB operations |
| [styles.css](styles.css) | All styling, responsive/mobile-first |

Open `index.html` directly in a browser to run locally. No server required.

---

## Data Model

Each record in IndexedDB (`prayerDB`, store `prayers`, key `date`):

```js
{
  date: "YYYY-MM-DD",       // primary key (local timezone)
  prayers: ["Fajr", "Asr"]  // array of completed prayer names
}
```

Five prayers: `Fajr`, `Dhuhr`, `Asr`, `Maghrib`, `Isha` (order matters for display).

---

## Key Functions in app.js

| Function | Description |
|----------|-------------|
| `initDB()` | Opens/creates the IndexedDB database |
| `initTodayView()` | Loads today's record and renders prayer cards |
| `togglePrayer(date, prayer)` | Adds or removes a prayer from a record |
| `loadHistory()` | Renders history table with month/year filtering |
| `loadStatistics()` | Renders calendar, streaks, and completion rates |
| `ensureTodayRecord()` | Seeds an empty record for today on startup so the stats calendar always renders |
| `calculateStreaks()` | Current and longest streaks (all 5 prayers = valid day); forward pass for longest, backward pass for current |
| `renderCalendar(year, month)` | Monthly calendar with color-coded days |
| `openEditModal(date)` | Opens bulk-edit modal for a specific date |
| `saveEdit()` | Saves modal changes back to IndexedDB |

---

## Tab Structure

Three tabs: **Today**, **History**, **Statistics**

- **Today** — Prayer cards with toggle checkboxes, daily progress bar
- **History** — Table view of past records, filters (month/year/show-pending), add/edit past dates
- **Statistics** — Calendar at top, streak counters, overall/weekly/monthly rates, per-prayer bar chart

---

## Important Conventions

- **Dates** are always `YYYY-MM-DD` strings in local timezone (not UTC/GMT)
- **Streak threshold:** A day counts toward a streak only if all 5 prayers are completed; today is excluded from the calculation if still in progress
- **Future dates** cannot be added or edited — enforced in UI
- **No server-side code** — all data is local to the user's browser via IndexedDB
- **Responsive/mobile-first** — test changes on mobile viewport widths

---

## Common Tasks

**Add a new feature:**
- UI markup goes in `index.html`
- Logic goes in `app.js`
- Styling goes in `styles.css`
- No imports, no modules — all code is in global scope

**Modify the database schema:**
- Increment the `DB_VERSION` constant and add an `onupgradeneeded` handler
- Be careful not to break existing records (backwards compatibility)

**Test locally:**
- Open `index.html` in a browser (Chrome recommended for IndexedDB DevTools)
- Use DevTools → Application → IndexedDB to inspect stored data

**Deploy:**
- Push to `main` branch; Netlify auto-deploys from the repo

---

## Git Conventions

Commit messages are short and imperative (e.g., `Adding show pending filter`, `Style changes for mobile view`). No conventional commits prefix required.
