# TASK-008 Implement P0 run orchestration and manifests

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Implement the first reproducible pipeline run layer so the existing source adapters, claim builders, resolution logic, and graph projector can execute as one tracked P0 run with manifests and output artifacts.

## Why It Matters

The repo now has the core domain pieces for a first end-to-end slice, but it still lacks a real pipeline entry point. Without a run layer, the system is a library collection rather than an executable workflow.

## Scope

- define a small run manifest contract
- implement a P0 pipeline runner that wires the current stages together
- write output manifests that point to the normalized and projected artifacts
- add unit or integration coverage for a fixture-backed happy path

## Out Of Scope

- scheduler integration
- cloud deployment
- full historical snapshot management

## Dependencies

- [TASK-004](TASK-004-gleif-edgar-adapters.md)
- [TASK-005](TASK-005-claim-models-and-claim-builder.md)
- [TASK-006](TASK-006-company-resolution-and-crosswalks.md)
- [TASK-007](TASK-007-initial-graph-projection.md)

## Definition Of Done

- one command can run the current P0 slice end to end on fixture-backed inputs
- a run manifest records what executed and what artifacts were produced
- tests cover the basic orchestration path

## Files Or Areas Likely To Change

- `src/semisupply/`
- `contracts/`
- `scripts/`
- `tests/integration/`

## Notes

Completed with:

- run manifest models in `src/semisupply/runs/models.py`
- `P0PipelineRunner` in `src/semisupply/runs/p0.py`
- package exports in `src/semisupply/runs/__init__.py`
- a thin command entry point in `scripts/run_p0_fixture.py`
- fixture-backed integration coverage in `tests/integration/test_p0_runner.py`

The runner now writes local artifacts under `normalized/`, `graph/`, and `logs/` and records a reproducible manifest for each run.

Validation run:

- `PYTHONPATH=src python3 -m unittest tests.integration.test_p0_runner`
- `PYTHONPATH=src python3 -m unittest discover -s tests -p 'test_*.py'`
- `PYTHONPATH=src python3 scripts/run_p0_fixture.py --artifact-root tmp/p0-fixture-run`
- `python3 -m compileall src`
