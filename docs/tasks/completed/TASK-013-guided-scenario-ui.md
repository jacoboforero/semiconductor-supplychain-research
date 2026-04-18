# TASK-013 Implement guided scenario and explanation views in the prototype UI

Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Add plain-language scenario framing and guided explanation views so the prototype does not rely on the user to infer why a set of nodes and edges matters.

## Why It Matters

The prototype needs to make sense to a business or research user without expecting them to understand the repo, the bundle format, or the graph model.

## Scope Completed

- added guided starting views in the left panel
- replaced technical run-oriented copy with business-facing orientation copy
- changed the default right panel from raw schema inspection to plain-language explanation
- removed the default auto-selection that made the graph open in a dimmed, confusing state
- improved the graph layout so the lane structure is visually legible

## Out Of Scope

- advanced analytics
- full scenario authoring workflow
- polished production UX

## Dependencies

- [TASK-012](TASK-012-taxonomy-enriched-graph-and-demo-data.md)
- [V1 product brief](../../V1_PRODUCT_BRIEF.md)

## Definition Of Done

- the UI offers guided entry points
- a non-technical viewer can get oriented without reading repo docs
- the default screen explains the map in plain language

## Files Or Areas Changed

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

This was explicitly prototype-scoped and did not change the underlying data pipeline contracts.
