# TASK-041 Build V2 full-canvas vertical slice

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Build the first V2 product slice as a full-canvas graph workspace with one strong end-to-end flow.

## Why It Matters

The product vision should be tested through one excellent vertical slice before the rest of the interface is rebuilt around it.

## Scope

- full-canvas desktop graph shell
- floating search and quick-start controls
- on-demand company drawer
- upstream/downstream trace interaction
- one scenario overlay
- Firefox validation on laptop-sized viewports

## Out Of Scope

- compare mode
- full semantic zoom system
- every current lens or panel workflow

## Dependencies

- [TASK-040](TASK-040-establish-v2-frontend-boundary-and-renderer-adapter.md)
- [docs/exec-plans/active/2026-04-18-v2-graph-native-workspace.md](../../exec-plans/active/2026-04-18-v2-graph-native-workspace.md)

## Definition Of Done

- the graph is visually dominant on desktop
- company search, company selection, and trace mode work in the V2 slice
- one scenario can be entered without leaving the main workspace
- direct browser validation confirms V2 is materially closer to the intended product vision than V1

## Files Or Areas Likely To Change

- `apps/ui-prototype/src/v2/`
- `apps/ui-prototype/src/`

## Notes

Completed on `2026-04-18`.

The first V2 slice now delivers:

- a full-canvas graph shell
- floating search and flow-lens dock overlays
- an on-demand inspector drawer
- scenario, lane, and corridor entry points built around dependency flow
- browser validation through Firefox Computer Use attempts plus live headless captures against the local V2 URL

The slice is materially closer to the intended graph-native product direction than V1, but it is still not the final visual standard.
