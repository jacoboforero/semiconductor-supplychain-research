# TASK-020 Seed taxonomy mappings for the 200-company universe

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Map the curated 200-company universe onto the project taxonomy so the larger graph has deliberate structural coverage.

## Why It Matters

The 200-company list only becomes analytically useful once roles and segments are assigned consistently.

## Scope

- seed role mappings for the curated universe
- seed segment mappings for the curated universe
- validate coverage against the planned allocation mix

## Out Of Scope

- facility-level role mapping
- advanced dependency semantics

## Dependencies

- [TASK-019](TASK-019-curate-200-company-master-list.md)
- [Company universe slice plan](../../exec-plans/completed/2026-04-17-company-universe-slice.md)

## Definition Of Done

- the 200-company universe has seeded role and segment mappings
- the mapping set is usable by the current graph projector

## Files Or Areas Likely To Change

- `src/semisupply/taxonomy/`
- `tests/unit/`
- `docs/`

## Notes

Completed with contract-driven taxonomy defaults and overrides loaded from `contracts/v1/company_taxonomy.v1.json`.
