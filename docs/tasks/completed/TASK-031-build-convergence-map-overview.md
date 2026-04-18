Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Build the convergence-map overview surface so the semiconductor supply chain is presented as parallel dependency streams feeding critical manufacturing junctions.

## Why It Matters

The product needs a more truthful and intuitive system visualization than a flat left-to-right chain or a graph dump. The convergence map is the central explanatory object for the new overview-first UI.

## Scope

- Define the first visual structure for parallel streams and convergence points
- Encode the first high-level product narrative around inputs, manufacturing junctions, and outputs
- Connect the map to guided entry points for stage, network, and scenario exploration

## Out Of Scope

- Full stage pages
- Full graph replacement
- Detailed scenario modeling

## Dependencies

- `docs/V1_UI_ARCHITECTURE.md`
- `docs/V1_TAXONOMY.md`
- `TASK-030`

## Definition Of Done

- The overview includes a clear convergence-oriented map
- Parallel streams and merge points are more legible than in the current atlas
- A non-technical user can understand the system structure without reading the graph directly

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

This was completed through a Firefox-validated convergence landscape that shows parallel inputs, critical manufacturing junctions, and coarse output clusters.
