# TASK-012 Implement taxonomy-enriched graph structure and demo data

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Enrich the prototype graph and demo dataset so a non-technical user can understand the supply chain in category terms such as fabless, foundry, OSAT, equipment, and wafers, instead of seeing only company-to-country links.

## Why It Matters

The current prototype is still too technical and too thin for the user bar we actually care about. A richer demo with taxonomy-backed role and segment structure is the shortest path to a UI that a business user or researcher can understand.

## Scope

- apply taxonomy mappings during pipeline runs
- emit role and segment context in the graph or UI bundle
- expand the fixture-backed demo dataset beyond one company
- keep the structure explicit about what is curated versus source-derived

## Out Of Scope

- full real-world relationship coverage
- production-grade data ingestion breadth
- final UI polish

## Dependencies

- [TASK-009](TASK-009-ui-bundle-export.md)
- [TASK-011](TASK-011-initial-taxonomy-codification.md)

## Definition Of Done

- the demo bundle expresses company role or segment context clearly
- the fixture-backed demo includes multiple companies across the chain
- the prototype UI is materially easier for a non-coder to interpret

## Files Or Areas Likely To Change

- `src/semisupply/graph/`
- `src/semisupply/runs/`
- `src/semisupply/taxonomy/`
- `tests/fixtures/`
- `apps/ui-prototype/`

## Notes

Completed with:

- role and segment graph structure in `src/semisupply/graph/projector.py`
- taxonomy-aware run output in `src/semisupply/runs/p0.py`
- richer multi-company fixtures in `tests/fixtures/p0/`
- an auto-loading demo bundle in `apps/ui-prototype/demo/`
- UI updates in `apps/ui-prototype/` so segment and role nodes render distinctly

The current demo now expresses the chain in business terms:

- Apple as fabless design
- TSMC as foundry
- ASE and Amkor as backend packaging and test
- ASML, Applied Materials, and Lam Research as equipment
- Shin-Etsu and GlobalWafers as wafer-related suppliers
- Synopsys and Cadence as design software

Validation run:

- `PYTHONPATH=src python3 -m unittest discover -s tests -p 'test_*.py'`
- `PYTHONPATH=src python3 scripts/run_p0_fixture.py --artifact-root tmp/p0-taxonomy-demo-run`
- `node --check apps/ui-prototype/app.js`
- `node --check apps/ui-prototype/demo/demo-bundle.js`
