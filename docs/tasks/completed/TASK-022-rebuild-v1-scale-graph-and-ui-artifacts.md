# TASK-022 Rebuild V1-scale graph and UI artifacts

Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Generate the first larger-scale graph and prototype artifacts from the curated 200-company universe.

## Why It Matters

This is the step where the project stops being a small proof-of-concept graph and starts resembling the intended V1 exploration surface.

## Scope

- rebuild graph artifacts from the expanded universe
- regenerate UI bundle outputs
- tune the prototype lightly if readability degrades at the larger scale

## Out Of Scope

- baseline analytics workflows
- hosted productization

## Dependencies

- [TASK-021](TASK-021-expand-source-backed-seed-inputs.md)
- [Company universe slice plan](../../exec-plans/completed/2026-04-17-company-universe-slice.md)

## Definition Of Done

- the graph and UI bundle are rebuilt from the expanded universe
- the prototype remains understandable at the larger scale

## Files Or Areas Likely To Change

- `apps/ui-prototype/`
- `src/semisupply/graph/`
- `src/semisupply/runs/`

## Notes

Completed with a rebuilt 200-company UI bundle, refreshed built-in demo assets, and light prototype copy/readability updates.
