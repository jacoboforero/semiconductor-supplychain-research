Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Write a product-facing V1 UI architecture document that moves the project beyond the current graph-first prototype and defines the next product shell around parallel supply streams, convergence points, and explanation-first workflows.

## Why It Matters

The current prototype is proving out interaction and graph rendering, but it is not yet the right product structure for helping users understand the supply chain. The project needs an explicit UI architecture before further prototype work drifts into local optimization of the wrong chassis.

## Scope

- Define the core mental model for the V1 product experience
- Define the primary screens and user flows
- Clarify what parts of the current prototype should be reused versus rebuilt
- Describe the role of the graph inside the broader product
- Outline the next prototype slices that would validate the UI direction

## Out Of Scope

- Implementing the new UI architecture
- Changing the underlying data pipeline or contracts
- Choosing a production frontend stack

## Dependencies

- `docs/V1_PRODUCT_BRIEF.md`
- `docs/V1_SCOPE.md`
- `docs/V1_TAXONOMY.md`

## Definition Of Done

- A new canonical UI architecture doc exists under `docs/`
- The doc defines a default landing experience, screen hierarchy, and graph role
- The doc explains what can be reused from the current prototype versus what should be rebuilt
- The doc is linked from the documentation map

## Files Or Areas Likely To Change

- `docs/V1_UI_ARCHITECTURE.md`
- `docs/README.md`
- `docs/tasks/INDEX.md`

## Notes

This should be written from the product perspective, not as a frontend implementation memo.
