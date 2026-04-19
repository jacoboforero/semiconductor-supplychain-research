# Company-Dependency Graph Refactor

Status: completed

## Goal

Refactor the product from a typed-entity atlas graph into a company-only dependency graph while preserving the current visual vibe and shell quality.

## Why

The current UI quality is materially better than the earlier prototype, but the graph semantics are still wrong for the intended product.

The product graph must show how companies feed one another across the semiconductor supply chain and where those flows converge.

## Scope

- make the default visual graph company-only
- make dependency or supply relationships the main visible edges
- keep stage, role, geography, and facility data in the durable model but move them out of the primary visible node layer
- preserve the current atmospheric, premium visual direction where possible
- avoid inventing dependency edges that the data do not support

## Non-Goals

- exhaustive supplier-customer coverage across the full 200-company universe
- removing non-company entities from the underlying model
- replacing the current pipeline architecture or bundle boundary wholesale

## Critical Product Requirements

1. The default visible graph nodes are companies or organizations.
2. The default visible graph edges are evidence-backed dependency relationships.
3. The graph should read as upstream-to-downstream flow, not as a generic network dump.
4. Convergence into foundry, packaging, OSAT, and other critical nodes should be visually obvious.
5. Geography, role, and facility information should appear through filters, layout cues, badges, and the detail drawer.
6. The current UI vibe and aesthetic quality should be preserved as much as possible.

## Workstreams

### 1. Dependency Data Slice

- define the first repo-managed dependency seed contract
- encode a narrow, evidence-backed set of typed company-to-company edges
- project those edges into the graph layer and UI bundle
- make edge predicates and evidence available to the UI

### 2. Bundle And Projection Refactor

- decide how the bundle exposes dependency edges separately from ontology or metadata edges
- preserve compatibility for non-graph metadata needed by the detail drawer and filters
- keep provenance and confidence visible for dependency edges

### 3. UI Graph Refactor

- render companies as the only default graph nodes
- use stage as layout guidance instead of a visible node class
- move role, geography, and facility handling into filters and panel content
- support path tracing, neighborhood inspection, and convergence-focused scenarios

### 4. Validation

- validate the new dependency graph directly in the browser with Computer Use
- verify the graph still feels premium and intuitive on laptop-sized screens
- verify sparse evidence coverage is communicated honestly rather than hidden

## Suggested Execution Order

1. land the dependency seed contract and first curated edges
2. extend the projector and `ui_bundle.json` export to carry dependency relationships cleanly
3. refactor the frontend graph scene to company-only nodes and dependency edges
4. rebuild scenarios and filters around the new graph semantics
5. run browser-driven validation and a final visual polish pass

## Risks

- the first dependency edge set may be too sparse to create a satisfying graph without careful curation
- multi-role companies can create ambiguous stage placement if layout rules are not explicit
- the UI can regress into a cleaner-looking but still misleading map if dependency evidence and fallback behavior are not handled carefully

## Validation

- a user can visually follow company-to-company flow across the chain
- selecting a company reveals metadata without polluting the main canvas
- scenarios highlight dependency paths rather than just ontology neighborhoods
- the product still feels calm, polished, and demo-ready in direct browser use

## Outcome

- added a repo-managed dependency seed contract with evidence-backed company-to-company relationships
- projected typed `SUPPLIES_TO` edges into the graph and `ui_bundle.json`
- rebuilt the frontend into a company-only dependency workspace with flow lanes, convergence lenses, and traceable edge detail
- validated full-flow, scenario, country-corridor, and company-inspection workflows directly in Firefox with Computer Use

## Dependencies

- [docs/decisions/2026-04-18-company-only-dependency-graph.md](../../decisions/2026-04-18-company-only-dependency-graph.md)
- [docs/tasks/completed/TASK-023-seed-first-dependency-relationships.md](../../tasks/completed/TASK-023-seed-first-dependency-relationships.md)
