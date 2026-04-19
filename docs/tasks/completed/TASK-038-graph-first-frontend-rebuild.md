# TASK-038 Graph-first frontend rebuild

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Rebuild the prototype UI as a graph-first research workspace that is intuitive, visually strong, and credible as a real demo product.

## Why It Matters

The current prototype validated the bundle and some product ideas, but it does not meet the usability or design bar for a serious user-facing demo. The next phase needs a clearer product thesis, stronger graph tooling, and much better visual execution.

## Scope

- update the canonical UI architecture to reflect the graph-first direction
- replace the current page-heavy frontend shell
- adopt a mature graph interaction library
- validate and refine the new UI in the browser with Computer Use

## Out Of Scope

- expanding the durable pipeline beyond what the current bundle already supports
- claiming richer dependency truth than the current graph actually contains
- building a production multi-user platform

## Dependencies

- [docs/decisions/2026-04-18-graph-first-demo-workspace.md](../../decisions/2026-04-18-graph-first-demo-workspace.md)
- [docs/exec-plans/completed/2026-04-18-graph-first-ui-rebuild.md](../../exec-plans/completed/2026-04-18-graph-first-ui-rebuild.md)

## Definition Of Done

- the app opens into a graph-first workspace
- the primary graph workflows are intuitive in direct browser use
- the visual design is materially stronger and more product-like than the current prototype
- the repo docs and task state reflect the rebuild

## Files Or Areas Likely To Change

- `docs/V1_UI_ARCHITECTURE.md`
- `docs/tasks/INDEX.md`
- `apps/ui-prototype/`

## Notes

Completed as a graph-first `Vite + React + Cytoscape` workspace with direct browser validation and a rebuilt interaction model centered on the network view.
