# Scenario Prototype Slice

Status: completed

## Goal

Build the first explicit scenario-analysis flow so the prototype can explain disruption, chokepoints, and likely blast radius without requiring open-ended graph interpretation.

## Scope

- introduce a reusable scenario page or state inside `apps/ui-prototype/`
- support at least one concrete disruption walkthrough
- show affected stages, exposed companies or facilities, and a plain-English blast-radius explanation
- preserve the network as a supporting lens rather than the only scenario interface

## Deliverables

- at least one guided scenario page in the prototype
- scenario-specific summary, exposure cards, and next-step navigation
- a clear handoff from scenario mode into stage, profile, or network views
- Firefox validation of readability and flow

## Out Of Scope

- full quantitative analytics
- exhaustive scenario library
- production-grade simulation or probabilistic modeling

## Execution Order

1. define the scenario-page shell inside the current prototype
2. choose the first disruption walkthrough from the product brief
3. render blast-radius explanation and affected entities using current graph data
4. add navigation into the supporting stage, profile, and network views
5. validate in Firefox and tighten the reading flow

## Risks

- scenario copy could overstate certainty if it is not grounded tightly in the current dataset
- the scenario could become too abstract if it does not point to concrete companies, facilities, or stages
- the page could feel like a static memo unless it clearly hands off into the rest of the product shell

## Validation

- the prototype supports at least one explicit disruption scenario
- blast radius is understandable without graph fluency
- the scenario page feels like analysis rather than a renamed graph lens
