# The D-I NIL Map

An interactive data report about Division I NIL market concentration, modeled roster-market estimates, public NCAA NIL disclosure snapshots, and a five-season college-football event panel.

## Files

- `index.html` — the scrolling report with eight findings, varied charts, animated money symbols, and the “Where would you play?” quiz.
- `dashboard.html` — the focused interactive dashboard for the qualifying football panel, with season, conference, team, play-type, measure, and breakdown controls, summary numbers, four changing charts, a data table, and reset control.
- `football_dashboard.js` — browser-side filters, calculations, charts, KPIs, and table for the qualifying five-season football panel.
- `styles.css` — the shared responsive visual system for the report and dashboard.
- `report.js` — browser-side report calculations and the donut, lollipop, dumbbell, stacked, bubble, dot-plot, and slope-chart visualizations.
- `dashboard.js` — browser-side dashboard filtering, calculations, charts, table, school explorer, and reset control.
- `fun.js` — the falling-money animation and quiz interaction.
- `data/nil_data.js` — modeled 2026 Division I conference, sport, football-position, and Power 4 program data.
- `data/nil_history.js` — browser-ready public NCAA NIL Assist disclosure snapshots for 2024 and 2025.
- `data/football_success.json` — 2025 Power 4 football records matched to the 2026 all-sport program-market estimates.
- `data/division1_market.json` — JSON copy of the modeled conference-market layer used if the inline JavaScript data is unavailable.
- `data/nil_summary.json` — compact JSON copy of the public disclosure summary used as a fallback.
- `data/football_plays_2021_2025.csv.gz` — the qualifying 872,023-row event-level panel; one row is one team-attributed play in one game.
- `data/football_team_seasons.json` — browser-ready rollup with one row per team-season.
- `data/football_play_types.json` — browser-ready rollup with one row per team-season-play-type.
- `data/football_dataset_manifest.json` — row count, column count, periods, groups, and field documentation for the qualifying dataset.
- `scripts/build_snapshot.py` — validation script for the modeled NIL snapshot.
- `scripts/build_football_panel.py` — reproducible downloader/transformer that creates the compressed event panel and browser rollups from the public cfbfastR-data season files.

## Data sources

- The modeled conference and program layer comes from The Sideline NIL Tracker’s NIL by Conference directory: <https://thesideline.co/nil-tracker/conferences>.
- The historical disclosure layer comes from the NCAA NIL Assist public data dashboard: <https://nilassist.ncaa.org/data-dashboard/>.
- The football position context is a separate modeled analysis from termiNIL: <https://www.terminil.com/blog/lowest-nil-value-college-football-roster>.
- The football records come from the NCAA’s 2025 conference standings: <https://fs.ncaa.org.s3.amazonaws.com/Docs/stats/football_records/Standings.pdf>.
- The qualifying panel comes from the SportsDataverse cfbfastR-data repository: <https://github.com/sportsdataverse/cfbfastR-data>. Its source files cover 2021–2025 college-football events. The project keeps a reduced, compressed event file plus reproducible build script in the repository.

The modeled values are estimates, not verified contracts, guaranteed athlete pay, salaries, conference distributions, or collective budgets. The NCAA layer reports de-identified disclosure aggregates, so it is kept separate from the modeled market layer. The success panels compare 2026 all-sport program estimates with 2025 football records. The available comparable disclosure snapshots are 2024 and 2025 and they cover different date windows. The report places those comparable disclosure metrics beside the 2026 model, and the conference full-market and median charts include a clearly labeled historical backcast using the national market-history series.

The assignment dataset requirements are met by the football event panel: 872,023 rows, 22 columns, five seasons, 332 team groups, at least four categorical fields, and multiple numeric fields. The dashboard loads the team-season and play-type rollups in the browser and recalculates its figures, charts, and table after filtering by season, conference, team, play type, and measure.

## Run locally

From this project folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. GitHub Pages can serve the same static files from the repository’s main branch.

To rebuild the qualifying panel from the public source files:

```bash
python3 scripts/build_football_panel.py
```

The script downloads the five source CSVs when they are not already cached, writes the compressed event file, and writes the two browser rollups plus the manifest.
