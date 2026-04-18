# TASK-025 Add baseline concentration and chokepoint analytics

Status: `backlog`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Add the first baseline analytics outputs so the 200-company graph can answer concentration and chokepoint questions directly.

## Why It Matters

The graph is now large enough to orient a user. V1 still needs basic analytical outputs to justify itself as a risk product.

## Scope

- compute role and geography concentration summaries
- add first chokepoint-oriented aggregate views or metrics
- expose these summaries in the bundle and prototype UI

## Out Of Scope

- full disruption simulation
- advanced scoring models
- polished dashboard productization

## Dependencies

- [TASK-022](completed/TASK-022-rebuild-v1-scale-graph-and-ui-artifacts.md)

## Definition Of Done

- the pipeline emits first baseline concentration outputs
- the prototype can surface those outputs without requiring schema knowledge
- the result helps answer at least one V1 risk question directly

## Files Or Areas Likely To Change

- `src/semisupply/analysis/`
- `src/semisupply/graph/`
- `apps/ui-prototype/`
- `tests/unit/`

## Notes

Favor simple, legible analytics over early scoring sophistication.
