# TASK-045 Build V3 system map and representative-company view

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Build a new V3 frontend slice that separates:

- the default systems map
- the representative-company map

while keeping both powered by the same dependency bundle and company inspector flows.

## Why It Matters

The product needed a cleaner abstraction layer than the V2 graph workspace could provide.

Without that separation, the first-load experience kept forcing a company graph to do the job of a systems diagram.

## Scope

- add `apps/ui-prototype/src/v3/`
- implement a V3 display taxonomy and map model
- render the default systems map with explicit directional flow and convergence
- add a second representative-company view in the same structural map
- make V3 the default local entry while preserving `?ui=v1` and `?ui=v2`
- validate both views in a live browser session

## Definition Of Done

- the default view teaches the supply-chain structure without exploratory clicking
- the company view keeps the same structure while showing representative companies and dependency links
- no obvious offscreen cards, overlay collisions, or card overlaps remain in the validated laptop-sized browser layout
- stage selection and company selection both drive the inspector correctly

## Files Or Areas Changed

- `apps/ui-prototype/src/main.jsx`
- `apps/ui-prototype/src/v3/`
- `apps/ui-prototype/README.md`
- `docs/V3_PRODUCT_SPEC.md`
- `docs/V3_FRONTEND_ARCHITECTURE.md`
