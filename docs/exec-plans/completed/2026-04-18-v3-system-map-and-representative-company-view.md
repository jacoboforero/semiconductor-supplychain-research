# V3 System Map And Representative Company View

Status: completed

## Goal

Build the next frontend iteration as a two-layer product:

- a high-level systems map that teaches the supply chain structure
- a representative-company view that keeps the same structure while exposing real dependency links

## Why

The graph-first V2 slice was semantically stronger than earlier prototypes, but it still behaved like a categorized company graph rather than a true systems map.

That made first-load comprehension too expensive.

## Scope

- create an isolated `src/v3/` boundary
- add a V3 display-model layer above the shared bundle model
- implement a systems-map surface with visible directionality and convergence
- implement a representative-company view using the same structural map
- keep shared search and inspector flows
- validate geometry and interaction in a live browser session

## Validation

- `npm run build` passed
- system-map geometry was measured in a live Safari WebDriver session until there were no offscreen cards, overlay collisions, or card-on-card overlaps
- the representative-company view went through the same geometry checks
- stage selection and company selection both reopened the inspector successfully in the live browser session

## Notes

- Firefox Computer Use access was blocked by MCP approval denial during this pass, so Safari WebDriver plus live DOM geometry checks were used as the reliable validation fallback.
- V3 uses a custom DOM/SVG systems-map renderer instead of relying on Cytoscape for the default surface.
