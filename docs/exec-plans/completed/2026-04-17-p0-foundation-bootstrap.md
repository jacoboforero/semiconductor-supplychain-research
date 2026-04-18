# P0 Foundation Bootstrap

Status: completed

## Goal

Move the repository from planning-only into the first implementation-ready shape without overcommitting to a final architecture.

## Scope

- lock the P0 source spine
- lock the initial pipeline runtime
- define the first data-contract draft
- scaffold the initial implementation layout

## Deliverables

- decision record for the P0 source spine
- decision record for the initial runtime
- P0 data contract document
- initial repo scaffold:
  - `src/semisupply/`
  - `contracts/`
  - `scripts/`
  - `tests/`
  - `apps/ui-prototype/`

## Out Of Scope

- production ingestion code
- graph database selection
- orchestration framework
- hosted deployment
- production frontend architecture

## First Code Slice After This

The first actual implementation work should target:

1. company registry primitives
2. evidence and observation models
3. source adapter interfaces
4. one source adapter pair:
   - GLEIF
   - EDGAR issuer metadata

## Validation

- repo structure matches `docs/REPO_STRUCTURE_PLAN.md`
- docs reference the new source-spine and contract decisions
- scaffold remains small and easy to navigate
