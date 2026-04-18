# Facility Grounding Slice

Status: completed

## Goal

Move the project from company-and-taxonomy orientation into the first real facility-aware implementation slice.

## Scope

- define the first encoded facility registry and observation contracts in code
- implement the first public facility adapters:
  - EPA ECHO and FRS
  - Korea PRTR
- add facility normalization and graph projection
- expose facilities in the prototype UI without changing the product’s core interaction model

## Deliverables

- facility registry models and tests
- EPA facility adapter and tests
- Korea PRTR facility adapter and tests
- facility resolution and graph projection support
- prototype UI updates that show facility connections in plain language

## Out Of Scope

- graph database selection
- hosted deployment
- production facility completeness
- advanced disruption analytics
- full policy overlay implementation

## Execution Order

1. facility models and contracts
2. EPA ECHO and FRS adapter
3. Korea PRTR adapter
4. facility normalization and graph projection
5. prototype UI facility view

## Risks

- facility identity matching can get messy quickly across regulators
- public sources may differ in site naming granularity and operator naming quality
- prototype UX can get noisy if facility detail is dumped without narrative framing

## Validation

- facility-aware tests pass
- the runner can emit facilities into the graph and UI bundle
- the prototype still makes sense to a non-technical viewer after facility nodes are added
