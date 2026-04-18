# TASK-019 Curate the 200-company master list

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Create the first repo-managed 200-company universe for V1 with deliberate coverage across the semiconductor supply chain.

## Why It Matters

V1 is defined around a curated 200-company universe. Until that list exists in the repo, the graph remains a prototype slice rather than the intended V1-scale asset.

## Scope

- compile the first 200-company master list
- keep the mix aligned to the planned segment allocation
- bias toward chokepoint relevance rather than market-cap popularity

## Out Of Scope

- full relationship mapping
- exhaustive facility enumeration
- final analytics workflows

## Dependencies

- [V1 scope](../../V1_SCOPE.md)
- [Company universe slice plan](../../exec-plans/active/2026-04-17-company-universe-slice.md)

## Definition Of Done

- the repo contains a stable first-pass 200-company universe file
- the list covers the intended major supply-chain stages
- the list is suitable for downstream taxonomy and ingestion work

## Files Or Areas Likely To Change

- `docs/`
- `contracts/`
- `tests/fixtures/`

## Notes

Completed with the first repo-managed `contracts/v1/company_universe.v1.json` contract and validation tests for exact 200-company coverage.
