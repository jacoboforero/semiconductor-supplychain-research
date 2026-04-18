# TASK-005 Implement claim models and initial claim builder

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Implement the first typed claim models and a minimal observation-to-claim builder so the pipeline can move from source-bound facts to normalized assertions.

## Why It Matters

The current pipeline can now emit canonical company records, evidence records, and observations. The next missing layer is the claim system that turns observations into typed, confidence-bearing assertions suitable for graph projection.

## Scope

- define typed claim models
- define minimal claim status and review metadata
- implement a small claim-builder surface that can consume observations
- add unit tests for claim construction and validation

## Out Of Scope

- graph loader implementation
- graph database integration
- broad claim-inference heuristics across all source families

## Dependencies

- [TASK-004](TASK-004-gleif-edgar-adapters.md)
- [P0 data contracts](../../P0_DATA_CONTRACTS.md)

## Definition Of Done

- claim models exist in `src/semisupply/claims/`
- at least one builder path exists from observations to claims
- unit tests cover key invariants and happy paths

## Files Or Areas Likely To Change

- `src/semisupply/claims/`
- `tests/unit/`

## Notes

Completed with:

- `ClaimRecord`, `ClaimType`, `ClaimStatus`, and `ReviewStatus` in `src/semisupply/claims/models.py`
- `DirectObservationClaimBuilder` in `src/semisupply/claims/builder.py`
- unit coverage in `tests/unit/test_claim_models.py`
- contract alignment for literal-valued claims in `docs/P0_DATA_CONTRACTS.md`

The initial builder is intentionally narrow.

It handles direct company identity and country facts emitted by the current GLEIF and EDGAR adapters and leaves broader inference work for later tasks.

Validation run:

- `PYTHONPATH=src python3 -m unittest tests.unit.test_claim_models`
- `PYTHONPATH=src python3 -m unittest discover -s tests/unit -p 'test_*.py'`
- `python3 -m compileall src`
