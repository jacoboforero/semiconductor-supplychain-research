# TASK-024 Add policy overlays and restricted-entity graphing

Status: `backlog`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Bring the first public policy overlays into the graph so the prototype can expose restricted entities and policy-sensitive nodes.

## Why It Matters

Export controls and sanctions are part of the product definition, and they materially change how a user interprets supply-chain risk.

## Scope

- add first adapters for `BIS` and `OFAC`
- normalize restricted entities and policy records into the graph model
- show policy-linked nodes or edges in the prototype

## Out Of Scope

- complete global sanctions coverage
- legal workflow tooling
- automated alerting

## Dependencies

- [TASK-022](completed/TASK-022-rebuild-v1-scale-graph-and-ui-artifacts.md)

## Definition Of Done

- BIS and OFAC data can be ingested through the shared pipeline contracts
- policy overlay records project into the graph
- the prototype can surface policy-linked entities clearly

## Files Or Areas Likely To Change

- `src/semisupply/sources/`
- `src/semisupply/graph/`
- `apps/ui-prototype/`
- `tests/fixtures/`

## Notes

Bias toward operable list ingestion, not broad policy scraping.
