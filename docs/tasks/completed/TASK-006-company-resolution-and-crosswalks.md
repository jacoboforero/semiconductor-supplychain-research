# TASK-006 Implement company resolution and source crosswalks

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Implement the first cross-source company resolution layer so records from GLEIF, EDGAR, and later adapters can converge on shared canonical entities instead of staying siloed by source.

## Why It Matters

The pipeline now has source adapters, observations, and claims, but the same company will still fragment across sources unless we add a durable normalization layer. Without this step, the graph and UI will over-count important entities and weaken concentration analysis.

## Scope

- define a minimal company crosswalk or linkage model
- implement deterministic matching from strong identifiers first
- support manual-review states for unresolved or ambiguous matches
- add unit tests for happy paths and conflict cases

## Out Of Scope

- broad fuzzy matching across the full company universe
- facility resolution
- UI review workflows

## Dependencies

- [TASK-001](TASK-001-registry-primitives.md)
- [TASK-004](TASK-004-gleif-edgar-adapters.md)
- [TASK-005](TASK-005-claim-models-and-claim-builder.md)

## Definition Of Done

- a shared company-resolution contract exists
- deterministic identifier-based linkage works for the first sources
- tests cover exact-match and unresolved-match flows

## Files Or Areas Likely To Change

- `src/semisupply/normalize/`
- `src/semisupply/registry/`
- `tests/unit/`

## Notes

Completed with:

- `CompanyResolver`, `SourceCompanyRecord`, `CompanyCrosswalk`, and `CompanyResolutionDecision` in `src/semisupply/normalize/company_resolution.py`
- a package export in `src/semisupply/normalize/__init__.py`
- unit coverage in `tests/unit/test_company_resolution.py`

The initial resolver is intentionally conservative.

It auto-merges on strong identifiers first, then on exact normalized name plus country, and routes conflicting same-type identifiers to manual review instead of guessing.

Validation run:

- `PYTHONPATH=src python3 -m unittest tests.unit.test_company_resolution`
- `PYTHONPATH=src python3 -m unittest discover -s tests/unit -p 'test_*.py'`
- `python3 -m compileall src`
