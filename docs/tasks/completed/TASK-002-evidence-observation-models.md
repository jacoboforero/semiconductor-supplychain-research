# TASK-002 Implement evidence and observation models

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Implement the first typed models for source snapshots, evidence records, and observations so the pipeline can represent source-bound facts before claim generation.

## Why It Matters

This is the foundation for provenance-first ingestion. Without these models, later claim logic and graph loading will be too informal.

## Scope

- define typed Python models for source snapshots, evidence, and observations
- align the models with `docs/P0_DATA_CONTRACTS.md`
- add small unit tests for the initial model behavior

## Out Of Scope

- claim generation logic
- graph loading logic
- source-specific adapter implementations

## Dependencies

- [TASK-001](TASK-001-registry-primitives.md)
- [P0 data contracts](../../P0_DATA_CONTRACTS.md)

## Definition Of Done

- typed models exist in `src/semisupply/`
- tests cover basic model construction and validation
- contract alignment is documented where needed

## Files Or Areas Likely To Change

- `src/semisupply/`
- `tests/unit/`

## Notes

Completed with:

- source-layer records in `src/semisupply/sources/models.py`
- package exports in `src/semisupply/sources/__init__.py`
- unit tests in `tests/unit/test_source_models.py`

Validation run:

- `PYTHONPATH=src python3 -m unittest discover -s tests/unit -p 'test_*.py'`
- `python3 -m compileall src`
