# Graph-First UI Rebuild

Status: completed

## Goal

Replace the current page-heavy prototype shell with a graph-first research workspace that feels like a serious user-facing demo while preserving the current bundle contract.

## Scope

- redesign the product around a persistent central graph canvas
- reduce copy and explanatory card sprawl in favor of contextual overlays
- introduce a stronger frontend architecture inside `apps/ui-prototype/`
- adopt a mature graph library for pan, zoom, selection, and layout
- preserve support for the existing `ui_bundle.json` contract and local snapshot loading
- validate the result through direct browser use with Computer Use

## Deliverables

- updated `docs/V1_UI_ARCHITECTURE.md` reflecting the new product direction
- rebuilt frontend app in `apps/ui-prototype/`
- updated app README with the new local workflow
- task tracking updates for the rebuild

## Product Requirements

1. The graph is the first thing the user sees and the main object they work with.
2. The product should feel simple at first glance, but powerful after one or two interactions.
3. A user should be able to start from search, a scenario, a stage lens, or a country lens without losing spatial context.
4. Entity detail should open in a clear side panel instead of sending the user through a maze of tabs.
5. The UI should communicate trust and evidence without drowning the user in prose.
6. The visual language should feel polished, atmospheric, and intentionally designed.

## Technical Direction

- keep the durable pipeline and UI bundle untouched unless a small additive field is clearly needed
- replace the monolithic DOM script with a componentized frontend
- use a dedicated graph library for rendering and interaction
- keep the app easy to host and easy to replace later

## Execution Order

1. lock the product thesis and IA in `docs/`
2. scaffold the new frontend stack inside `apps/ui-prototype/`
3. build bundle parsing and derived graph models
4. build the graph workspace shell and primary interactions
5. rebuild scenarios, search, selection, and detail views as workspace overlays
6. validate visually in the browser and refine layout, scale, and styling

## Risks

- the current data model is structurally rich but still sparse on true dependency edges
- a force-directed graph could look exciting but be less legible than a disciplined systems layout
- a high-polish visual shell can still fail if search and selection workflows remain awkward

## Validation

- the app immediately communicates a graph-centered mental model
- key workflows work without page hunting: search, scenario start, stage focus, company inspection, geography inspection
- the graph remains readable at laptop widths
- the interface feels materially more polished than the current prototype in direct browser use

## Outcome

- shipped a rebuilt `apps/ui-prototype/` app using `Vite`, `React`, and `Cytoscape.js`
- replaced page-hopping flows with a single graph workspace plus left rail and detail drawer
- validated and refined the final layout in Firefox through Computer Use
