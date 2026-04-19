# UI Prototype

This app is the current frontend prototype surface for exploring the semiconductor supply chain bundle.

## Stack

- `Vite`
- `React`
- `Cytoscape.js`

## Local Preview

1. `cd /Users/jacoboforero/Desktop/Research/semiconductor-supplychain-research/apps/ui-prototype`
2. `npm install`
3. `npm run dev`
4. Open the local URL printed by Vite.

For a production-style build:

1. `npm run build`
2. `npm run preview`

## Snapshot Workflow

- The app loads `public/demo/ui_bundle.json` by default.
- The default local entry now opens the V3 systems-map prototype at `/`.
- V3 separates the product into a high-level systems map and a representative-company view that keeps the same structure while exposing real company dependency links.
- Earlier prototype slices remain available at `/?ui=v1` and `/?ui=v2`.
- The checked-in demo snapshot currently contains `44` evidence-backed relationships connecting `35` companies across eight displayed stages.
- Use `Load Snapshot` to open another `ui_bundle.json` export locally.

To refresh the built-in demo snapshot from the fixture-backed pipeline:

1. `PYTHONPATH=src python3 scripts/run_v1_seed_fixture.py --artifact-root tmp/ui-prototype-demo-source`
2. `PYTHONPATH=src python3 scripts/refresh_ui_prototype_demo.py tmp/ui-prototype-demo-source/exports/p0/<run-id>/ui_bundle.json`

## Structure

- `src/App.jsx`: shell orchestration and workspace state
- `src/v2/`: isolated V2 rebuild boundary with its own workspace shell, state model, and renderer adapter
- `src/v3/`: default systems-map surface with a separate display model, DOM/SVG renderer, and representative-company view
- `src/components/`: top bar, rails, graph canvas, and detail panel
- `src/lib/`: bundle normalization, derived UI model, and graph scene assembly
- `src/config/`: staged copy, roles, and scenario definitions
- `public/demo/ui_bundle.json`: built-in demo snapshot

## Notes

- The prototype is intentionally optimized for a polished desktop demo rather than long-term frontend permanence.
- The graph is the product surface. Geography, role, and facility context should stay in filters and detail panels rather than returning to ontology-style visible nodes.
- The durable asset remains the pipeline and bundle contract; this UI layer is replaceable.
