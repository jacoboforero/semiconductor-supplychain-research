# Freeze V1 And Build V2 In Parallel

Date: `2026-04-18`
Status: accepted

## Decision

The current V1 frontend will be treated as a semantic proof and fallback demo surface.

Major product and visual ambition work should now move into a separate V2 frontend slice built in parallel rather than continuing to evolve the V1 shell in place.

## Why

The current prototype is directionally correct on graph semantics, but it still carries too many layout assumptions from the dashboard-like shell that produced it.

Continuing to mutate that shell would likely create:

- more layout hacks
- tighter coupling between React state and rendering details
- harder future cleanup
- more time spent polishing an architecture that is no longer the target

## Implications

- V1 should receive only obvious bug fixes and data-parity improvements.
- V2 should be built in an isolated boundary, preferably under `apps/ui-prototype/src/v2/`.
- The graph renderer should sit behind an adapter so a Cytoscape replacement remains possible later.
- The first V2 implementation target is a vertical slice, not a full rebuild of every workflow.

## Follow-Up

- [docs/V2_PRODUCT_SPEC.md](../V2_PRODUCT_SPEC.md)
- [docs/V2_FRONTEND_ARCHITECTURE.md](../V2_FRONTEND_ARCHITECTURE.md)
- [docs/exec-plans/active/2026-04-18-v2-graph-native-workspace.md](../exec-plans/active/2026-04-18-v2-graph-native-workspace.md)
