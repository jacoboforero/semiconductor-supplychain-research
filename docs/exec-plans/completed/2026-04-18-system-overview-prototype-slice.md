# System Overview Prototype Slice

Status: completed

## Goal

Replace the current graph-first landing experience with the first explanation-first system overview shell described in `docs/V1_UI_ARCHITECTURE.md`.

## Scope

- introduce a new default landing experience centered on system understanding
- make the graph a subordinate analysis surface instead of the home screen
- add guided entry points for stages, scenarios, and network exploration
- keep the current prototype lightweight and fast to iterate

## Deliverables

- new landing-shell information architecture in `apps/ui-prototype/`
- first overview content sections for system structure and guided starts
- a clear pathway into the existing graph/network view
- updated demo state that reflects the new product shell

## Out Of Scope

- full stage explorer implementation
- full profile-page implementation
- full scenario-mode implementation
- production frontend architecture

## Execution Order

1. define the page-level shell for `Overview`, `Network`, and placeholder entry points
2. replace the current atlas-first default state with an overview-first state
3. introduce the first system-summary modules and guided entry blocks
4. preserve the current graph view as a reusable analysis tab or panel
5. validate the result in Firefox and adjust for readability

## Risks

- the first shell may become too abstract if it removes the graph without adding enough explanatory value
- the UI may drift into mock-application territory unless the current data and graph are still used concretely
- the overview could become too text-heavy if the system structure is not made visual enough

## Validation

- the product no longer lands directly in the atlas view
- a user can understand the supply-chain structure before opening the graph
- the graph is still reachable and useful as one analysis surface
- the new shell remains coherent in Firefox on a laptop-sized viewport
