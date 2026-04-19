# Graph-First Demo Workspace

Date: `2026-04-18`
Status: accepted

## Decision

The next UI iteration should move from an overview-first product shell to a graph-first research workspace.

The graph is now the primary surface, not a secondary tab.

Supporting product elements should orbit the graph as lightweight overlays, drawers, and guided workflows rather than competing page-level destinations.

This decision establishes the workspace model, not the final graph semantics.

The default visual graph contract is now defined separately in [2026-04-18-company-only-dependency-graph.md](2026-04-18-company-only-dependency-graph.md).

## Why

The current prototype validated the bundle contract and basic navigation, but it failed as a user-facing product shell.

The main issues are:

- too much instructional copy before the user sees value
- too many separate views to understand before the product feels legible
- a graph surface that looks secondary, custom-built, and operationally awkward
- page layouts that read like generated documentation rather than a serious research tool

The intended user for this phase is not a schema author. It is a business, strategy, supply-chain, or policy researcher who wants a fast way to:

- see the system structure at a glance
- search for a company, role, stage, country, or facility
- inspect concentration and chokepoints
- move from a high-level structural read into a specific node or scenario without losing context

For that user, the right mental model is a persistent atlas or command center rather than a sequence of explainer pages.

## Implications

- The graph should remain visible for the primary desktop workflow.
- Search, scenarios, filters, and entity detail should be integrated into the same workspace.
- The UI should minimize long explanatory paragraphs and favor compact labels, chips, metrics, and contextual summaries.
- The next frontend should use a mature graph library instead of continuing the custom SVG graph chassis.
- The bundle contract remains the boundary between the durable pipeline and the replaceable UI.
- The frontend can adopt a stronger local app stack if it stays isolated under `apps/ui-prototype/`.

## Non-Goals

- locking the project into a long-term SaaS frontend architecture
- pretending the current graph already contains exhaustive supplier-customer truth
- replacing the durable pipeline contracts with UI-specific data shapes

## Follow-Up

- update `docs/V1_UI_ARCHITECTURE.md` to reflect the graph-first workspace
- create an execution plan for the rebuild
- rebuild `apps/ui-prototype/` around the new workspace model
