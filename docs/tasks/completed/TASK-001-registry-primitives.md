# TASK-001 Implement registry primitives

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Implement the first company-registry primitives for canonical company records, identifiers, aliases, and basic role metadata.

## Why It Matters

The company registry is the foundation for nearly every later workflow in the project: source ingestion, facility matching, claim generation, graph loading, and UI exploration.

## Scope

- define initial typed models for canonical company records
- define identifier and alias representations
- define minimal role-assignment representations
- add unit tests for the initial registry models

## Out Of Scope

- source adapter implementations
- facility models
- claim generation
- graph loading

## Dependencies

- [P0 data contracts](../../P0_DATA_CONTRACTS.md)
- [P0 source spine decision](../../decisions/2026-04-17-p0-source-spine.md)

## Definition Of Done

- typed registry models exist in `src/semisupply/registry/`
- unit tests exist for basic model construction and key invariants
- the model aligns with the P0 contract document

## Files Or Areas Likely To Change

- `src/semisupply/registry/`
- `tests/unit/`

## Notes

Completed with:

- typed registry models in `src/semisupply/registry/models.py`
- package exports in `src/semisupply/registry/__init__.py`
- unit tests in `tests/unit/test_registry_models.py`

Validation run:

- `PYTHONPATH=src python3 -m unittest discover -s tests/unit -p 'test_*.py'`
- `python3 -m compileall src`
