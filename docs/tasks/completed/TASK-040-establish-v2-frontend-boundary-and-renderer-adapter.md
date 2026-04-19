# TASK-040 Establish V2 frontend boundary and renderer adapter

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Create the architectural foundation for V2 so the next UI rebuild can proceed without entangling itself with the current V1 shell.

## Why It Matters

This is the main anti-debt task for the frontend. Without a clean V2 boundary and renderer adapter, the next rebuild will likely repeat the same pattern of layout coupling and incremental shell hacks.

## Scope

- create an isolated `src/v2/` frontend boundary
- define the first renderer adapter contract
- define the V2 workspace state model
- keep V1 available while V2 is under construction

## Out Of Scope

- rebuilding all user workflows
- replacing Cytoscape immediately
- retiring V1

## Dependencies

- [docs/V2_PRODUCT_SPEC.md](../../V2_PRODUCT_SPEC.md)
- [docs/V2_FRONTEND_ARCHITECTURE.md](../../V2_FRONTEND_ARCHITECTURE.md)
- [docs/decisions/2026-04-18-freeze-v1-build-v2-in-parallel.md](../../decisions/2026-04-18-freeze-v1-build-v2-in-parallel.md)
- [docs/exec-plans/active/2026-04-18-v2-graph-native-workspace.md](../../exec-plans/active/2026-04-18-v2-graph-native-workspace.md)

## Definition Of Done

- the repo contains a clean V2 frontend boundary
- React components no longer need to know renderer internals directly for V2 work
- the first V2 scene can be rendered without depending on V1 layout structure
- V1 remains intact while V2 is being built

## Files Or Areas Likely To Change

- `apps/ui-prototype/src/`
- `apps/ui-prototype/README.md`

## Notes

Completed on `2026-04-18`.

The repo now contains an isolated `apps/ui-prototype/src/v2/` boundary with its own workspace shell, state model, scene bridge, and Cytoscape renderer adapter. V1 remains available at `/`, while the parallel V2 slice is mounted at `/?ui=v2`.
