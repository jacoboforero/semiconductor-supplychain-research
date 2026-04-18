# TASK-016 Implement Korea PRTR facility adapter

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Add the first Asia facility adapter so the facility model is validated across more than one regulator and geography.

## Why It Matters

The accepted P0 source spine explicitly pairs Korea PRTR with the first Asia disclosure path.

## Scope

- implement a fixture-backed Korea PRTR adapter
- emit facility records, evidence, and observations
- add tests for the initial extraction contract

## Out Of Scope

- multilingual OCR workflow
- full production scraping or anti-bot handling

## Dependencies

- [TASK-014](../active/TASK-014-facility-registry-models-and-contracts.md)
- [Facility grounding slice plan](../../exec-plans/active/2026-04-17-facility-grounding-slice.md)

## Definition Of Done

- Korea PRTR facility extraction works against initial fixtures
- tests cover the output contract

## Files Or Areas Likely To Change

- `src/semisupply/sources/p0/`
- `tests/fixtures/`
- `tests/unit/`

## Notes

Keep the first version simple and contract-driven.
