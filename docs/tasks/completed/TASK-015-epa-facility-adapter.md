# TASK-015 Implement EPA ECHO and FRS facility adapter

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Add the first public U.S. facility adapter so the pipeline can ingest regulator-backed facility records tied to semiconductor-relevant operators.

## Why It Matters

EPA gives the strongest first U.S. facility grounding path in the accepted P0 source spine.

## Scope

- implement capture and extraction flow for EPA ECHO and or FRS fixture-backed inputs
- emit facility records, evidence, and observations
- add adapter tests

## Out Of Scope

- live network synchronization at scale
- full facility deduplication across all sources

## Dependencies

- [TASK-014](../active/TASK-014-facility-registry-models-and-contracts.md)
- [Facility grounding slice plan](../../exec-plans/active/2026-04-17-facility-grounding-slice.md)

## Definition Of Done

- EPA adapter outputs facility-aware records and evidence
- tests cover the initial extraction behavior

## Files Or Areas Likely To Change

- `src/semisupply/sources/p0/`
- `tests/fixtures/`
- `tests/unit/`

## Notes

Prefer a clean fixture-backed adapter first, then expand.
