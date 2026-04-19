# TASK-023 Seed first dependency relationships and typed predicates

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-18`

## Goal

Add the first evidence-backed dependency relationships so the graph can move beyond structural categorization into real dependency reasoning.

## Why It Matters

The 200-company universe now explains who is in the chain. V1 still needs typed links that explain who depends on whom and in what way.

This is now on the critical path for the main product graph, because the default UI is expected to visualize company-to-company dependency flow rather than a typed ontology map.

## Scope

- define the first repo-managed dependency seed contract
- encode a limited set of typed company-to-company relationships with predicate support
- project those relationships into the graph without collapsing them into generic links

## Out Of Scope

- full supplier-customer coverage
- probabilistic relationship inference at scale
- scenario analytics beyond the seeded edges

## Dependencies

- [TASK-022](TASK-022-rebuild-v1-scale-graph-and-ui-artifacts.md)
- [docs/decisions/2026-04-18-company-only-dependency-graph.md](../../decisions/2026-04-18-company-only-dependency-graph.md)

## Definition Of Done

- the repo contains a first dependency seed contract
- typed dependency edges appear in the graph projection
- the resulting edges are explainable in the prototype without raw schema leakage

## Files Or Areas Likely To Change

- `contracts/`
- `src/semisupply/claims/`
- `src/semisupply/graph/`
- `apps/ui-prototype/`

## Notes

Completed with a repo-managed `company_dependency_edges.v1.json` contract, typed dependency projection in the durable graph layer, and seeded evidence-backed relationships exposed in the prototype without raw schema leakage.
