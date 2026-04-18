# TASK-011 Implement initial taxonomy codification and role mappings

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Encode the first concrete internal taxonomy for supply-chain stages, company roles, and selected item categories so the product can explain the chain coherently instead of showing only generic entities.

## Why It Matters

The current prototype can display graph structure, but it still lacks the explicit category system that will make the supply chain intelligible and analytically useful. Strong taxonomy is part of the product requirement, not just a backend nicety.

## Scope

- define initial stage and role codes in code and contract docs
- provide a minimal mapping surface from source-derived facts to taxonomy codes
- add unit tests for code validity and mapping behavior

## Out Of Scope

- complete end-to-end category coverage
- external standard bridge tables beyond the first placeholders
- full UI taxonomy navigation

## Dependencies

- [V1 taxonomy](../../V1_TAXONOMY.md)
- [TASK-005](TASK-005-claim-models-and-claim-builder.md)
- [TASK-010](TASK-010-static-ui-prototype.md)

## Definition Of Done

- a coded internal taxonomy exists for the first major company and stage concepts
- tests cover the first role and stage invariants
- the taxonomy is ready to feed later normalization and UI work

## Files Or Areas Likely To Change

- `src/semisupply/taxonomy/`
- `tests/unit/`
- `docs/`

## Notes

Completed with:

- versioned taxonomy models in `src/semisupply/taxonomy/models.py`
- the default catalog in `src/semisupply/taxonomy/catalog.py`
- seeded company-to-taxonomy mappings in `src/semisupply/taxonomy/mappings.py`
- package exports in `src/semisupply/taxonomy/__init__.py`
- unit coverage in `tests/unit/test_taxonomy.py`

The mapping layer is intentionally conservative.

It uses curated seeds for known companies rather than trying to infer supply-chain roles from weak identity data alone.

Validation run:

- `PYTHONPATH=src python3 -m unittest tests.unit.test_taxonomy`
- `PYTHONPATH=src python3 -m unittest discover -s tests -p 'test_*.py'`
