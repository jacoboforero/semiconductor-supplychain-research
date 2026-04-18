# Company Universe Slice

Status: completed

## Goal

Move the project from a facility-aware prototype into the first real V1-scale company universe build.

## Scope

- curate the first 200-company master list
- encode the curated universe in repo-managed data files
- assign role and segment mappings for the curated list
- run the current source spine against the expanded universe where supported
- regenerate graph and UI artifacts at a more V1-like scale

## Deliverables

- curated 200-company master list
- seeded taxonomy coverage for the master list
- updated fixtures or seed inputs for the expanded universe
- runner outputs and demo artifacts for the larger universe

## Out Of Scope

- complete dependency relationship coverage
- full baseline analytics suite
- production deployment

## Execution Order

1. curate the 200-company universe
2. encode seeded taxonomy mappings
3. expand source-backed seed inputs
4. rebuild graph and UI artifacts

## Risks

- curation drift toward brand-heavy coverage instead of chokepoint coverage
- taxonomy seeding may become inconsistent if done without a strict source list
- the UI may need light tuning once the graph is materially larger

## Validation

- the repo contains a stable 200-company master list
- the graph can be rebuilt against the expanded universe
- the resulting prototype remains intelligible at the larger scale
