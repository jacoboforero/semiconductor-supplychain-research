# TASK-047 Expand V3 representative-company coverage

Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Broaden the evidence-backed dependency slice so the V3 representative-company map can support more credible corridors, category anchors, and scenario variants.

## Why It Matters

V3 now has the right product abstraction, but the representative-company view is only as compelling as the visible company relationships underneath it.

More coverage makes it easier to:

- swap in different representative sets
- strengthen category anchors
- demonstrate more than one believable corridor through the map

## Scope

- expand public evidence-backed company-to-company dependency relationships
- prioritize coverage that improves V3 display categories
- reduce single-company categories where possible

## Out Of Scope

- changing the V3 display taxonomy itself
- replacing the systems-map renderer

## Dependencies

- [TASK-045](TASK-045-build-v3-system-map-and-representative-company-view.md)
- [TASK-043](../backlog/TASK-043-expand-curated-dependency-corridors-for-v2.md)

## Delivered

- expanded the curated dependency contract from `33` to `44` evidence-backed company relationships
- raised the connected V3 company slice from `26` to `35`
- added new visible anchors in `design_stack`, `wafers_and_substrates`, `masks_and_reticles`, `wafer_fabrication`, and `packaging_and_test`
- strengthened the representative-company view with:
  - `Siemens EDA` in design
  - `Siltronic` and `Soitec` in wafers/substrates
  - `Dai Nippon Printing` in masks/reticles
  - `GlobalFoundries` as a second credible fab hub
  - `Powertech Technology` in packaging/test
- widened company-view stage expansion so selected categories can reveal the full connected slice without truncating valid representative companies

## Validation

- `PYTHONPATH=src python3 scripts/run_v1_seed_fixture.py --artifact-root tmp/ui-prototype-demo-source`
- `PYTHONPATH=src python3 scripts/refresh_ui_prototype_demo.py tmp/ui-prototype-demo-source/exports/p0/<run-id>/ui_bundle.json`
- `npm run build`
- `PYTHONPATH=src python3 -m compileall src`
- Safari WebDriver geometry and screenshot validation confirmed:
  - no offscreen stage cards in the default V3 system map
  - no offscreen or overlapping stage cards in the default V3 company view at `1440x900`
  - downstream stage expansion now surfaces all `7` connected downstream companies
