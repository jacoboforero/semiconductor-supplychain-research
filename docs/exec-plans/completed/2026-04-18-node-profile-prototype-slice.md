# Node Profile Prototype Slice

Status: completed

## Goal

Replace inspector-style company and facility detail panels with briefing-style profile views that explain why a node matters before exposing graph structure and evidence detail.

## Scope

- introduce reusable profile layouts for companies and facilities
- emphasize plain-English summaries, strategic importance, geography, and dependency context
- preserve the network as one way to enter a profile instead of the only way to understand a node
- keep the implementation lightweight within the existing prototype shell

## Deliverables

- a first company-profile view in `apps/ui-prototype/`
- a first facility-profile view or facility-aware profile treatment
- updated routing from overview, stage explorer, or network interactions into profile pages
- a detail experience that feels product-facing rather than diagnostic

## Out Of Scope

- full scenario-mode implementation
- deep causal path tracing
- redesign of the underlying node or evidence contracts

## Execution Order

1. define the reusable profile shell and page states
2. rebuild company detail as a profile page with plain-English importance, role, and geography
3. extend the same pattern to facilities or facility-linked node views
4. preserve evidence and graph access as secondary tabs or sections
5. validate the result in Firefox and tighten the reading flow

## Risks

- profiles could become verbose if they are not structured around the user’s actual questions
- the shell could drift away from the current prototype data if the views over-promise unavailable relationships
- evidence could become too hidden if explanation displaces traceability completely

## Validation

- company and facility views read like product pages rather than debugging panels
- a user can understand why a selected node matters without relying on graph fluency
- evidence remains accessible but no longer dominates the first reading experience
