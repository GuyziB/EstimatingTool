# BMS Estimating Tool
**Panta Contracting Limited — BMS & Controls Department**

A lightweight, browser-based estimating tool for BMS and controls projects. Built as a single HTML file — no installation, no server, no dependencies beyond a modern browser.

---

## Features

### Estimate Builder
- **Project details** — site, client, reference number and date
- **Section headers** — organise estimates into named sections (e.g. `AHU-01 — Heat Recovery Unit`)
- **Pre-built blocks** — insert complete material and labour packages from the block library in two clicks
- **Field device picker** — quick-add common Belimo field devices at qty 1
- **Price List Search** — load a supplier CSV and search across thousands of items by description or part number; filter by supplier (Belimo, Distech, Fuji)
- **Batch Import** — paste a list of manufacturer part numbers (with optional quantities) and inject all matched lines into the estimate in one go
- **Blank line** — add a manual line anywhere
- **Inline editing** — edit qty, unit, description, part number, cost code, work package, rate, markup and labour hours directly in the table
- **Row reordering** — move any line up or down with ▲ ▼ buttons
- **Live summary** — rate total, labour total and grand total update in real time
- **CSV export** — download a structured CSV ready for import into Panta's cost management system

### Block Library
- Browse and filter all pre-built blocks by category
- Expand any block to inspect its line items
- Edit existing blocks or create new ones
- Changes are live for the current session

---

## Block Categories

| Category | Examples |
|---|---|
| DDC Controllers | ECY-203, ECY-600, ECY-APEX, ECY-S1000 with display |
| Control Panels | DoL starter, VFD panel, VCP, FDCP, AHU full panel, water level alarm |
| Integrated Systems | HRU, BMS supervisor software, BMS server, IP network |
| Field Equipment | Inverters, valves, sensors, conductivity, heat meters, level sensors |
| Labour | AGV pair, BMS pair, BMS Tech, BMS Engineer single rates |
| Misc Blocks | ZenDALI, tenant fit-out wireless sensing |
| Common Field Devices | Belimo butterfly valves (DN50–DN125), temp sensors, actuators, DPS |

---

## Price List Integration

The tool accepts a **supplier price list CSV** with the following column structure:

| Col | Field | Notes |
|---|---|---|
| 1 | Supplier | e.g. `Belimo`, `Distech`, `Fuji` |
| 2 | Description | Full item description |
| 3 | Part Number | Manufacturer part number |
| 4 | List Price | Used as fallback if selling price is empty |
| 5 | Selling Price | **Primary rate used in estimates** |
| 6 | Extra | Optional notes / lead time / remarks |

To load: click **📂 Load Price List CSV** in the header and select your file.

### Price List Search
Type any description fragment or part number. Results update in real time. Click **+ Add** to insert a line at qty 1.

### Batch Import
Click **📋 Batch Import** and paste part numbers — one per line, with an optional quantity after a comma:

```
01DT-1LN, 3
01DT-1LR, 1
HS-D TH 140 VV, 3
TS-DI 150, 1
22DC-11
```

- Part numbers with spaces are handled correctly — the comma is the only delimiter
- Exact match only against manufacturer part number (no fuzzy logic)
- Unmatched part numbers are added as **error lines** (highlighted red) so nothing is silently dropped
- A result banner summarises matched vs unmatched after import

---

## CSV Export Format

The exported CSV contains the following columns:

```
Qty | Unit | Description | Part No | Job Ref | Code | (__) | Work Pkg | Rate | Rate Total | Labour | Labour Total
```

- **Code** — Panta cost code (e.g. `416` = Field Devices, `900` = Labour)
- **Work Pkg** — work package number (default `3`)
- **Rate Total** — `Qty × Rate × Markup`
- **Labour Total** — `Qty × Labour hours`

Export is triggered via **📤 Export CSV** in the toolbar or summary panel. The file downloads directly, named using your reference number and date.

---

## Usage — Standalone HTML

1. Download `BMS_Estimating_Tool.html`
2. Open in any modern browser (Chrome, Edge, Firefox)
3. No internet connection required after initial load

> The tool runs entirely in the browser. No data is sent to any server. All state is held in memory — refresh the page to reset.

---

## Usage — GitHub Pages

1. Fork or clone this repository
2. Ensure `BMS_Estimating_Tool.html` is in the root (or rename to `index.html` for the root URL)
3. Go to **Settings → Pages**
4. Set source to `main` branch, root folder
5. GitHub Pages will publish the tool at `https://<your-org>.github.io/<repo-name>/`

---

## File Structure

```
/
├── index.html              # The full application (single file)
└── README.md               # This file
```

All React, ReactDOM and Babel dependencies are loaded from the Cloudflare CDN at runtime. No build step required.

---

## Tech Stack

| Layer | Detail |
|---|---|
| UI framework | React 18 (via CDN) |
| JSX compilation | Babel Standalone (in-browser) |
| Styling | Inline styles — no CSS framework |
| Data | Hardcoded block library + runtime CSV load |
| Build tooling | None |

---

## Roadmap / Potential Enhancements

- [ ] Save / restore estimate as JSON (session persistence)
- [ ] Full block library restoration (all original Schrack panel blocks)
- [ ] Code auto-assignment based on supplier
- [ ] Network Operations Centre (NOC) integration hooks
- [ ] Print / PDF output

---

## Maintained by

**Guy Baranyay** — Head of BMS & Controls Department  
Panta Contracting Limited, Malta
