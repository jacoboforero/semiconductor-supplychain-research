Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Make dense network views readable by changing the level of detail shown at different zoom levels and by aggregating companies or facilities into metanodes when the user is still looking at a broad slice.

## Why It Matters

The current network still exposes too many raw nodes for useful pattern recognition in many contexts. The product needs semantic zoom and aggregation so the network behaves more like a navigable landscape and less like a static node dump.

## Scope

- add semantic zoom behavior to the current network view
- introduce metanodes for grouped companies or facilities in broad views
- make default network slices open at the right abstraction level for overview, stage, profile, and country contexts
- preserve a clear path to reveal more detail when the user intentionally zooms or drills in

## Out Of Scope

- full scenario-mode implementation
- new underlying data sources or relationship ingestion
- production-grade graph layout or WebGL rendering

## Dependencies

- `docs/V1_UI_ARCHITECTURE.md`
- `TASK-030`
- `TASK-031`
- `TASK-033`

## Definition Of Done

- broad network views no longer open with an unreadable cloud of company nodes
- grouped views reveal meaningful patterns at a glance
- zooming or drilling in can reveal more node-level detail without losing the user's place
- the behavior is validated in Firefox

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

This was completed by adding grouped company and facility metanodes, zoom-triggered detail changes, and tighter stage/role/country network slices validated in Firefox.
