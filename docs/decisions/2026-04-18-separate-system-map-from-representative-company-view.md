# 2026-04-18 Separate System Map From Representative Company View

## Status

Accepted

## Context

The earlier graph-first rebuild improved the product semantics by switching to company-only dependency nodes, but it still left one major product problem unresolved:

- the first screen was still a company graph
- the user needed to parse many nodes before understanding the structure
- the visual layout still implied a more linear stage sequence than intended

The product needs two different abstraction layers:

- a systems map that teaches the structure
- a representative-company view that proves the underlying graph value

## Decision

The default V3 experience will separate those two surfaces.

V3 will:

- open into a systems map, not a freeform company graph
- keep visible direction and convergence as first-class visual requirements
- provide a second view that keeps the same structure while replacing abstract categories with a small set of representative companies and real dependency links
- keep the full company dependency graph underneath both views through the shared bundle model

## Consequences

Positive:

- the product can teach the supply chain instantly
- the company graph no longer has to carry the full burden of first-load comprehension
- the representative-company view remains grounded in real relationships without cluttering the default map

Tradeoffs:

- the display taxonomy must now be maintained as a distinct layer
- some multi-role firms will need a documented primary placement in the representative-company view
- V3 uses a custom DOM/SVG composition layer instead of relying on Cytoscape for the default surface
