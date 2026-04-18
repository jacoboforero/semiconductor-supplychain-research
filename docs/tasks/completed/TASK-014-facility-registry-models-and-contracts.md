# TASK-014 Implement facility registry models and contracts

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Encode the first durable facility data model in the pipeline so the project can represent real physical sites, not just companies and taxonomy categories.

## Why It Matters

Facility grounding is the bridge from orientation to real chokepoint and disruption analysis. It is also already part of the accepted P0 source spine and data contract direction.

## Scope

- implement facility registry primitives in code
- add facility-focused tests
- align code with the existing contract draft where needed

## Out Of Scope

- source-specific facility adapters
- facility UI presentation
- advanced facility analytics

## Dependencies

- [P0 source spine](../../decisions/2026-04-17-p0-source-spine.md)
- [P0 data contracts](../../P0_DATA_CONTRACTS.md)
- [Facility grounding slice plan](../../exec-plans/active/2026-04-17-facility-grounding-slice.md)

## Definition Of Done

- facility records are modeled in code with stable identifiers and time fields
- tests cover the core facility model behavior
- facility records can be used cleanly by future adapters and graph builders

## Files Or Areas Likely To Change

- `src/semisupply/registry/`
- `src/semisupply/normalize/`
- `tests/unit/`

## Notes

This task should keep the model small and durable. It should not overfit to any one regulator.
