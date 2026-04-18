# TASK-017 Implement facility resolution and graph projection

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Resolve facility records into canonical sites and project them into the graph with company and geography links.

## Why It Matters

Without resolution and graph projection, facility ingestion remains isolated and cannot support product analysis or UI exploration.

## Scope

- facility normalization and crosswalk logic
- graph node and edge support for facilities
- runner and UI bundle updates
- tests for facility projection

## Out Of Scope

- advanced facility scoring
- facility network algorithms

## Dependencies

- [TASK-015](TASK-015-epa-facility-adapter.md)
- [TASK-016](TASK-016-korea-prtr-facility-adapter.md)
- [Facility grounding slice plan](../../exec-plans/active/2026-04-17-facility-grounding-slice.md)

## Definition Of Done

- facilities appear in the graph projection with stable identifiers
- facilities link to operators and countries
- tests cover resolution and projection behavior

## Files Or Areas Likely To Change

- `src/semisupply/normalize/`
- `src/semisupply/graph/`
- `src/semisupply/runs/`
- `tests/unit/`
- `tests/integration/`

## Notes

This task should be selective and pragmatic. Do not aim for perfect global facility resolution.
