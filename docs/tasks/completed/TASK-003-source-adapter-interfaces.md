# TASK-003 Define source adapter interfaces

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Define the common interfaces and boundaries for P0 source adapters so each source can plug into the pipeline without inventing its own workflow shape.

## Why It Matters

The project will need multiple adapter styles, but still needs consistent contracts. This is the boundary that keeps the source layer from becoming a pile of one-off scripts.

## Scope

- define source adapter interfaces
- define basic capture/parse/extract boundaries
- align the interfaces with the P0 contract model

## Out Of Scope

- implementing concrete adapters
- orchestration or scheduling

## Dependencies

- [TASK-002](TASK-002-evidence-observation-models.md)
- [P0 data contracts](../../P0_DATA_CONTRACTS.md)

## Definition Of Done

- source interface modules exist
- the boundaries are documented in code or nearby README files
- the interfaces support at least the first GLEIF and EDGAR use cases

## Files Or Areas Likely To Change

- `src/semisupply/sources/`
- `tests/unit/`

## Notes

Completed with:

- shared workflow records in `src/semisupply/sources/interfaces.py`
- exports in `src/semisupply/sources/__init__.py`
- documentation update in `src/semisupply/sources/README.md`
- unit tests in `tests/unit/test_source_interfaces.py`

Validation run:

- `PYTHONPATH=src python3 -m unittest discover -s tests/unit -p 'test_*.py'`
- `python3 -m compileall src`
