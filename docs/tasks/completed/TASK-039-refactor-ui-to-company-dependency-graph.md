# TASK-039 Refactor UI to company-only dependency graph

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Refactor the prototype UI so the default graph renders companies as the visible nodes and dependency relationships as the visible edges.

## Why It Matters

The current UI vibe and shell quality are acceptable, but the graph still reads like an ontology map rather than a supply-chain dependency product.

That is a product-level miss. The main canvas needs to show how companies feed one another and where those paths converge.

## Scope

- make the default graph company-only
- use stage as layout guidance rather than as a visible node class
- move role, geography, facility, and company-type context into filters and the detail drawer
- preserve the current visual tone and overall shell quality
- validate the new graph behavior directly in the browser

## Out Of Scope

- full supplier-customer coverage across the company universe
- replacing the durable pipeline boundary
- removing non-company entities from the underlying data model

## Dependencies

- [TASK-023](TASK-023-seed-first-dependency-relationships.md)
- [docs/decisions/2026-04-18-company-only-dependency-graph.md](../../decisions/2026-04-18-company-only-dependency-graph.md)
- [docs/exec-plans/completed/2026-04-18-company-dependency-graph-refactor.md](../../exec-plans/completed/2026-04-18-company-dependency-graph-refactor.md)

## Definition Of Done

- the default visible graph nodes are companies only
- the default visible graph edges are dependency relationships
- non-company data are available through filters, layout, or detail panels instead of visible ontology nodes
- the graph visually communicates upstream-to-downstream flow and convergence
- the UI has been validated in-browser and still meets the current aesthetic bar

## Files Or Areas Likely To Change

- `apps/ui-prototype/`
- `docs/V1_UI_ARCHITECTURE.md`
- `src/semisupply/graph/`

## Notes

Completed as a company-only dependency workspace with curated supply edges, flow-lane layout, scenario and country corridor lenses, and Firefox-driven browser validation while preserving the current visual tone.
