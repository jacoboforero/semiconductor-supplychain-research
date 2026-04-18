Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Build the first system-overview prototype shell so the product no longer lands in a graph-first atlas and instead opens into an explanation-first overview of the semiconductor supply chain.

## Why It Matters

The new UI architecture is only useful if the first product surface changes. This slice is the bridge from the current prototype to a more credible product shell that can teach the user the structure of the system before exposing graph complexity.

## Scope

- Replace the current default landing experience with a structured overview shell
- Introduce the first high-level sections for system understanding, not just graph exploration
- Provide entry points into stages, scenarios, and network exploration
- Keep the current graph view available as a subordinate analysis surface rather than the home screen

## Out Of Scope

- Building full stage pages
- Building full company or facility profile pages
- Building the full scenario mode
- Reworking the data pipeline or bundle format beyond what the new shell requires

## Dependencies

- `docs/V1_UI_ARCHITECTURE.md`
- `docs/V1_PRODUCT_BRIEF.md`
- `docs/V1_SCOPE.md`

## Definition Of Done

- The prototype no longer defaults to the current atlas-style home screen
- The new landing experience emphasizes system structure, convergence, and guided entry points
- The graph remains accessible but is no longer the primary chassis
- The slice is validated in Firefox as a usable product-facing overview

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`
- `apps/ui-prototype/demo/*`
- `docs/exec-plans/active/*`

## Notes

This was completed by replacing the graph-first landing screen with an overview shell that introduces guided entry points and keeps the network as a subordinate surface.
