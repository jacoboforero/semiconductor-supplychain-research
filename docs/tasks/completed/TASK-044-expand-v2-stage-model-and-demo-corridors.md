# TASK-044 Expand V2 stage model and demo corridors

Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Make the V2 graph read as a broader semiconductor flow, not a narrowed `inputs -> wafer fab -> packaging` sketch, while expanding the evidence-backed connected slice enough to support that view honestly.

## Why It Matters

The earlier V2 slice still implied that several supported upstream parts of the chain were absent, even though the underlying company universe already included them. That mismatch weakened both product clarity and trust in the graph.

## Scope

- replace the collapsed V2 lane semantics with explicit display stages for:
  - design enablement
  - materials and chemicals
  - wafers and substrates
  - masks and reticles
  - manufacturing equipment
  - wafer fabrication
  - packaging and test
  - device companies
- update the V2 shell and graph renderer to use those stages
- tighten the laptop layout so the far-right flow is less likely to hide behind controls
- expand the curated dependency seed with additional public, evidence-backed upstream relationships
- rebuild the checked-in demo bundle and validate the updated workspace in browser

## Out Of Scope

- exhaustive corridor coverage
- mining or raw-mineral companies as first-class graph nodes
- deeper semantic-zoom and compare workflows beyond the current V2 scope

## Definition Of Done

- V2 visibly supports all current product stages without rendering ontology entities as graph nodes
- the default demo bundle contains connected companies in materials, wafers and substrates, masks and reticles, manufacturing equipment, wafer fabrication, packaging, and downstream device companies
- the V2 canvas validates cleanly enough at laptop width to continue iteration from this base

## Validation

- `PYTHONPATH=src python3 scripts/run_v1_seed_fixture.py --artifact-root tmp/ui-prototype-demo-source`
- `PYTHONPATH=src python3 scripts/refresh_ui_prototype_demo.py tmp/ui-prototype-demo-source/exports/p0/<run-id>/ui_bundle.json`
- `PYTHONPATH=src python3 -m compileall src`
- `npm run build`
- Firefox Computer Use navigation to `http://127.0.0.1:4175/?ui=v2`
- headless browser screenshots against `http://127.0.0.1:4175/?ui=v2`

## Files Or Areas Changed

- `contracts/v1/company_dependency_edges.v1.json`
- `apps/ui-prototype/src/config/constants.js`
- `apps/ui-prototype/src/lib/bundle.js`
- `apps/ui-prototype/src/v2/`
- `apps/ui-prototype/public/demo/ui_bundle.json`

## Notes

- This pass increased the curated dependency slice from `21` to `33` relationships and from `17` to `26` connected companies in the built-in demo.
- It is a first serious corridor expansion, not the end of dependency curation. Broader corridor density still belongs to [TASK-043](../backlog/TASK-043-expand-curated-dependency-corridors-for-v2.md).
- Richer graph-native workflows and semantic zoom still belong to [TASK-042](../backlog/TASK-042-expand-v2-graph-native-workflows-and-semantic-zoom.md).
