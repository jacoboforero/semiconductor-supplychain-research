# TASK-009 Implement UI bundle export and prototype data contract

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Implement a stable UI-oriented export bundle so the prototype frontend can consume one explicit data contract instead of reading raw run artifacts directly.

## Why It Matters

The pipeline can now execute end to end, but the current artifact set is still optimized for pipeline traceability, not frontend consumption. A UI bundle reduces frontend coupling to internal artifact structure and makes the prototype faster to build and change.

## Scope

- define a small UI bundle contract derived from graph projection and run manifest data
- implement a builder that emits summary metrics plus graph data for the prototype
- wire the bundle into the P0 runner as a written export artifact
- add test coverage for bundle contents

## Out Of Scope

- full frontend implementation
- hosted API endpoints
- production-grade caching or pagination

## Dependencies

- [TASK-007](TASK-007-initial-graph-projection.md)
- [TASK-008](TASK-008-p0-run-orchestration-and-manifests.md)

## Definition Of Done

- a typed UI bundle contract exists
- the P0 runner writes a UI bundle artifact
- tests cover the basic export shape and summary metrics

## Files Or Areas Likely To Change

- `src/semisupply/graph/`
- `src/semisupply/runs/`
- `tests/`

## Notes

Completed with:

- `UiBundle`, `UiBundleSummary`, and `UiBundleBuilder` in `src/semisupply/graph/ui_bundle.py`
- runner integration in `src/semisupply/runs/p0.py`
- bundle-focused tests in `tests/unit/test_ui_bundle.py`
- updated integration coverage in `tests/integration/test_p0_runner.py`

The UI bundle deliberately collapses duplicate raw graph edges into display edges so the prototype frontend does not need to solve claim-level graph deduplication itself.

Validation run:

- `PYTHONPATH=src python3 -m unittest tests.unit.test_ui_bundle tests.integration.test_p0_runner`
- `PYTHONPATH=src python3 -m unittest discover -s tests -p 'test_*.py'`
- `PYTHONPATH=src python3 scripts/run_p0_fixture.py --artifact-root tmp/p0-ui-bundle-run-2`
- `python3 -m compileall src`
