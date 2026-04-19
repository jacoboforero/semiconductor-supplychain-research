# Company-Only Dependency Graph

Date: `2026-04-18`
Status: accepted

## Decision

The default product graph should be a company-only dependency graph.

The main visible nodes in the product graph are companies or organizations.

The main visible edges in the product graph are evidence-backed dependency relationships.

Stage, role, geography, and facility data remain important, but they should primarily inform:

- layout
- filtering
- badges and metadata
- detail-drawer content
- secondary or internal analytical views

They should not dominate the primary graph canvas as peer node classes.

## Why

The previous graph-first rebuild clarified an important mismatch.

The rebuilt workspace improved aesthetics, interaction quality, and product feel, but it still visualized the graph more like an ontology map than a supply dependency map.

That is not the intended product object.

The product goal is for a user to:

- visually trace how upstream suppliers feed downstream manufacturing
- see convergence into critical manufacturing and packaging nodes
- understand chokepoints through visible dependency flow rather than through typed entity clutter

If the canvas is filled with stage, role, country, and facility nodes, the graph stops reading like a supply chain and starts reading like an internal data model.

## Implications

- the next backend slice must add first-class company-to-company dependency edges that are suitable for the default UI graph
- the UI should preserve the current aesthetic direction while changing the graph semantics underneath it
- the default graph layout should be stage-guided and convergence-oriented without requiring stages to appear as visible nodes
- metadata entities should still exist in the durable model and may appear in overlays, filters, debugging views, or secondary analysis surfaces
- the product should not invent fake dependency edges just to make the graph look denser

## Non-Goals

- removing stage, role, geography, or facility modeling from the data layer
- pretending v1 has full supplier-customer coverage across the industry
- forbidding ontology-style graphs for internal analysis or debugging

## Follow-Up

- update the product and UI planning docs so this requirement is explicit
- plan the dependency-graph refactor as a data-plus-frontend slice
- update the task backlog so dependency seeding and the company-only UI refactor are clearly represented
