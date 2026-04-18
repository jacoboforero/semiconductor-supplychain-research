# TASK-018 Make the prototype UI facility-aware

Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Expose facilities in the prototype UI so users can understand where a company’s physical footprint matters.

## Why It Matters

The current prototype explains where companies sit in the chain, but not where their important sites are. Facility awareness is the next step toward chokepoint analysis.

## Scope

- update the UI bundle handling for facilities
- show facility connections in the inspector and graph
- keep the interaction simple for non-technical users

## Out Of Scope

- advanced map visualization
- hosted production UX

## Dependencies

- [TASK-017](TASK-017-facility-resolution-and-graph-projection.md)
- [Facility grounding slice plan](../../exec-plans/active/2026-04-17-facility-grounding-slice.md)

## Definition Of Done

- the prototype can show facility nodes without becoming confusing
- company details can surface linked facilities in plain language

## Files Or Areas Likely To Change

- `apps/ui-prototype/`
- `src/semisupply/graph/`

## Notes

Maintain the current product rule: explanation first, implementation details hidden.
