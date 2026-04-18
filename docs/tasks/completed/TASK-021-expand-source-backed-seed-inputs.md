# TASK-021 Expand source-backed seed inputs for the 200-company universe

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Expand the current seed inputs and fixtures so the pipeline can run against a materially larger company universe.

## Why It Matters

The pipeline can already run end to end. It now needs broader seed inputs so it can exercise the V1-scale company universe rather than a small demo subset.

## Scope

- expand or replace the current company seed fixtures
- ensure the runner can ingest the larger seed set without breaking contracts
- keep the source-backed inputs manageable for local iteration

## Out Of Scope

- live bulk synchronization from every source
- production refresh orchestration

## Dependencies

- [TASK-019](TASK-019-curate-200-company-master-list.md)
- [TASK-020](TASK-020-seed-taxonomy-for-200-company-universe.md)
- [Company universe slice plan](../../exec-plans/completed/2026-04-17-company-universe-slice.md)

## Definition Of Done

- the source-backed seed inputs cover the curated universe at first-pass scale
- the runner completes successfully against the expanded seed set

## Files Or Areas Likely To Change

- `tests/fixtures/`
- `scripts/`
- `src/semisupply/runs/`

## Notes

Completed with the curated seed adapter, reproducible seed-fixture generator, and a 200-company runner path.
