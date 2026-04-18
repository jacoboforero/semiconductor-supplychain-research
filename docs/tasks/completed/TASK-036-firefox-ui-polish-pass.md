Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Run a Firefox-driven UI polish pass across the current prototype views so the layout, sizing, spacing, and placement of information feel cleaner, more intuitive, and less prototype-awkward.

## Why It Matters

The product shell is now structurally stronger, but layout problems can still make it feel cluttered, uneven, or harder to read than it should be. Visual polish is necessary before the next product slice compounds those rough edges.

## Scope

- inspect the main prototype views in Firefox
- tighten spacing, hierarchy, and panel sizing
- reduce awkward empty space or overly dense sidebars
- improve visual balance without changing the underlying product structure

## Out Of Scope

- new product workflows
- new data ingestion or graph semantics
- scenario-mode implementation

## Dependencies

- `TASK-030`
- `TASK-031`
- `TASK-032`
- `TASK-033`
- `TASK-035`

## Definition Of Done

- the main prototype views read more cleanly in Firefox
- panel sizing and placement feel intentional rather than accidental
- the UI remains understandable without technical explanation
- the pass is validated through fresh Firefox screenshots

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

This should be driven by rendered Firefox output rather than code-only judgment.

Completed through Firefox-based screenshot comparison across overview, stage, network, and profile views. The pass rebalanced overview panel spans, tightened the shell chrome, made the network graph more visually dominant, improved Firefox laptop breakpoint behavior, and reopened the polished build in Firefox.
