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
- **Sections without blocks, copy/paste and section scratch notes** — see below
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

## Prices: loaded from file, never stored here

This repository holds **no prices**. Block lines, field devices and labour lines show €0 until a price file is loaded.

Load **`Estimating_Price_File.csv`** with **📂 Load Price File (CSV)**. The file is built locally (OneDrive) by
`Files/_Estimating_Core/scripts/build_price_file.py` from:

- the **Pricing Library** (supplier cost prices; net, original supplier document first, newest); and
- **`panta_rates.csv`** (Panta cost rates: labour, panel building, containment, allowances).

On load, every block line is priced in this order:
1. a Panta rate for that exact block line (key `PR:<block_id>:<line_id>`); then
2. the line's manufacturer part number.

A banner reports how many block lines were priced and lists any left at €0.
Non-EUR library prices are listed in search with a warning but are never used to fill a block.

**All rates are cost.** Markup defaults to 1; set it per line (materials).

## Labour: hours, not euros

- **Labour** column = hours per unit; **Labour Total** = qty × hours (exported as hours, matching Elec_Est columns S and T).
- Labour is never priced per line. The summary shows total hours × the **estimate labour rate** (default €33/h from `LAB:RATE` in the price file; editable per estimate).
- Labour block lines (BMS Pair, BMS Engineer, AGV, Tech) insert as 1 h per unit at Rate €0. Exceptions at other rates are amended by hand.
- Grand total = material + labour cost.

File columns 1-6 (read by the app): `Supplier, Description, Part Number, List Price, Net Price, Extra`.
Columns 7+ are traceability (`Currency, UoM, Price_ID, Source_Doc_ID, Document_Date, Price_Basis, Source`).

### Price List Search
Type any description fragment or part number. Results update in real time. Click **+ Add** to insert a line at qty 1.

### Saving your work (Edge / Chrome)
- **💾 Save to job folder**: pick the job folder (e.g. `...\3. Small Jobs\SJ624 - TEVA System16 Move`). The tool writes `SJ624_estimate.json` (the full estimate, to reopen) and `SJ624_estimate.csv` (for `CSV to Elec_Est.bat`). Then **Save** or **Ctrl+S** overwrites them.
- **📂 Open job folder**: pick a job folder; the newest `*_estimate.json` in it is opened exactly as saved (rates are not re-priced).
- **Recent jobs**: one click (plus the browser's Allow prompt) to reopen the last 8 job folders.
- **Autosave**: the current estimate is kept in this browser and restored after a refresh or closed tab. The job folder file is the real record.
- **Price file is remembered**: after the first load, **↻ Load Estimating_Price_File.csv** reloads it in one click (or automatically if the browser already has permission).
- **New estimate** asks for a second click if there are unsaved changes.

### Sections, copy and paste, scratch notes (v3.6)
- **Adding into a section**: click a section header (it turns lighter blue with a yellow edge, "◀ adding here"). Block, Field Device, Price List Search, Batch Import, Blank Line, Labour Line and Import (lines only) then add at the end of that section. "add to end of estimate instead" clears it.
- **+ Section**: a section header on its own, no block needed.
- **Copy / Cut / Paste**: tick lines (or the box on a section header to tick its whole section), then Copy or Cut. Paste goes into the selected section, or use ⤵ on any row to paste directly below it (⤵ on a header pastes at the top of that section). A cut moves the lines once; a copy can be pasted again. **Delete** removes ticked lines (second click to confirm). Copying stays inside the tool.
- **⧉ Duplicate** on a section header copies the section, its lines and its notes (e.g. AHU-01 to AHU-02).
- **📝 Scratch notes** on each section: for the exclusions, questions and assumptions you'd otherwise jot on paper. They are listed under Notes / Scope / Exclusions ("check these before sending"), saved with the job, and written to `<ref>_notes.txt` in the job folder on Save. They are **not** in the CSV, so the Elec_Est converter is unaffected.

### Import Estimate CSV
**📥 Import Estimate CSV** appends lines from a CSV in this tool's export format: a previous export, or output from the `quote-ahu` / `cam-cush-vcp` skills. Section rows (`*** ... ***`) become section headers; markup is recovered from Rate Total. Use it to combine skill output with other scope, then edit and export.

### To the Elec_Est template
Drag the exported CSV onto `quoting_agent\CSV to Elec_Est.bat` (runs `csv_to_elec_est.py`). It writes a paste-in block (one template item per section; simple or mixed with SUBI per markup code) to `quoting_agent\output\`. Insert Copied Cells into the live Elec_Est.

### Batch Import
Click **📋 Batch Import** and paste part numbers, one per line, with an optional quantity after a comma:

```
01DT-1LN, 3
HS-D TH 140 VV, 3
TS-DI 150, 1
```

- Exact match only against manufacturer part number (no fuzzy logic)
- Unmatched part numbers are added as **error lines** (highlighted red) so nothing is silently dropped

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
├── index.html              # The full application (single file; no prices)
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
| Data | Block structure in code; all prices from runtime CSV load |
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
