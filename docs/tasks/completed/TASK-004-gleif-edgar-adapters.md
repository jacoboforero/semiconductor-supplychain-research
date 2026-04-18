# TASK-004 Implement GLEIF and EDGAR issuer adapters

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Implement the first concrete P0 adapters for GLEIF and EDGAR issuer metadata.

## Why It Matters

These adapters are the first proof that the source spine, registry model, and evidence workflow actually fit together in code.

## Scope

- implement GLEIF ingestion for company identity fields
- implement EDGAR issuer metadata ingestion
- normalize outputs into the first registry and observation contracts

## Out Of Scope

- full filing text extraction
- OpenDART, EPA, Korea PRTR, BIS, OFAC, or USGS adapters

## Dependencies

- [TASK-001](TASK-001-registry-primitives.md)
- [TASK-002](TASK-002-evidence-observation-models.md)
- [TASK-003](TASK-003-source-adapter-interfaces.md)

## Definition Of Done

- concrete adapter code exists
- unit or integration tests cover basic happy paths
- outputs align with the P0 contracts

## Files Or Areas Likely To Change

- `src/semisupply/sources/p0/`
- `src/semisupply/registry/`
- `tests/`

## Notes

Completed with:

- `GleifCompanyAdapter`
- `EdgarIssuerAdapter`
- shared P0 adapter helpers in `src/semisupply/sources/p0/common.py`
- unit tests in `tests/unit/test_p0_adapters.py`

This work also refined the shared extraction bundle so source adapters can emit normalized `CompanyRecord` objects directly.

Validation run:

- `PYTHONPATH=src python3 -m unittest discover -s tests/unit -p 'test_*.py'`
- `python3 -m compileall src`
