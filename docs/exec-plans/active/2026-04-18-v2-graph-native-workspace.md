# V2 Graph-Native Workspace

Status: active

## Goal

Build the next frontend iteration as an immersive graph-native workspace that is visually much closer to the intended product vision than the current V1 shell.

## Why

The current prototype is now semantically correct enough to validate the company-only dependency graph, but it still feels like a dashboard with a graph in the middle.

That is not the target product.

## Scope

- freeze the current V1 shell except for bug fixes
- create an isolated V2 frontend boundary
- introduce a renderer adapter between React and the graph renderer
- build a full-canvas vertical slice before expanding the rest of the workflows
- validate the V2 slice directly in Firefox with Computer Use

## Non-Goals

- rewriting the durable data pipeline for visual reasons alone
- solving every analytical workflow in the first V2 slice
- removing V1 before V2 proves itself

## Execution Order

1. establish the V2 boundary and renderer adapter
2. build a full-canvas shell with floating controls
3. implement company selection and company drawer
4. implement upstream/downstream trace mode
5. implement one scenario overlay
6. validate the slice in Firefox
7. expand into compare mode, corridor workflows, and semantic zoom
8. replace V1 only after the V2 slice is clearly superior

## Validation

- the graph visually dominates the desktop viewport
- the user can start from overview, search, or scenario without hunting through layout chrome
- detail appears on demand instead of permanently shrinking the canvas
- Firefox validation confirms the product feels immersive rather than boxed-in

## Progress

- `2026-04-18`: phase 1 completed. The repo now has an isolated `src/v2/` boundary, shared snapshot loading, a renderer adapter, and a separate V2 mount path at `/?ui=v2`.
- `2026-04-18`: phase 2 completed. The first full-canvas V2 slice now ships with floating search, a flow-lens dock, an on-demand inspector drawer, and graph camera gutters so the workspace reads as a graph-native surface rather than a boxed dashboard.
- `2026-04-18`: validation was partially constrained by stale Firefox Computer Use imagery, so live headless captures against the local V2 URL were used as the reliable visual check after Firefox navigation was exercised.
- `2026-04-18`: the V2 stage model was expanded from a collapsed input lane into eight explicit display stages, and the built-in dependency demo was widened from `21` to `33` evidence-backed relationships so the graph now shows connected companies in materials, wafers, masks, equipment, fab, packaging, and downstream device stages.
- `2026-04-18`: laptop validation found the downstream side of the graph was still getting squeezed by the control stack; the V2 layout was tightened and re-validated in Firefox plus headless browser captures so the right-side flow is at least inside the usable canvas at `1440px` width.

## Risks

- the renderer boundary may expose limitations in Cytoscape that force a later renderer swap
- a full-canvas workspace can become visually noisy without strict overlay discipline
- sparse dependency coverage can weaken the effect of an immersive graph if the first corridor slices are not curated carefully

## Dependencies

- [docs/V2_PRODUCT_SPEC.md](../../V2_PRODUCT_SPEC.md)
- [docs/V2_FRONTEND_ARCHITECTURE.md](../../V2_FRONTEND_ARCHITECTURE.md)
- [docs/decisions/2026-04-18-freeze-v1-build-v2-in-parallel.md](../../decisions/2026-04-18-freeze-v1-build-v2-in-parallel.md)
- [docs/tasks/active/TASK-040-establish-v2-frontend-boundary-and-renderer-adapter.md](../../tasks/active/TASK-040-establish-v2-frontend-boundary-and-renderer-adapter.md)
