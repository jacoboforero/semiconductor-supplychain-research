# TASK-042 Expand V2 graph-native workflows and semantic zoom

Status: `backlog`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Expand the V2 slice into a richer graph-native product workspace once the first vertical slice is validated.

## Why It Matters

The first slice should prove the direction. This task turns that direction into a broader interaction system without prematurely bloating the initial rebuild.

## Scope

- compare mode
- country corridor mode inside the V2 shell
- richer scenario overlays
- semantic zoom behavior
- stronger camera choreography and graph reveal behavior

## Out Of Scope

- exhaustive data coverage
- non-graph product surfaces unrelated to the core V2 workspace

## Dependencies

- [TASK-041](TASK-041-build-v2-full-canvas-vertical-slice.md)
- [docs/V2_PRODUCT_SPEC.md](../../V2_PRODUCT_SPEC.md)

## Definition Of Done

- V2 supports more than one compelling path into the graph without regressing into dashboard sprawl
- zoom levels feel intentional rather than purely technical
- the graph remains the dominant visual object while richer workflows are added

## Files Or Areas Likely To Change

- `apps/ui-prototype/src/v2/`

## Notes

Do not start this expansion until the vertical slice is clearly better than V1 in direct browser use.

The stage model and first wider corridor pass have now landed under [TASK-044](../completed/TASK-044-expand-v2-stage-model-and-demo-corridors.md). The remaining work here is interaction depth, not basic stage honesty.
