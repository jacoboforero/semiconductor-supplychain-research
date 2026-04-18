Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Refine the atlas so it feels graph-first and navigable in Firefox-sized laptop viewports, with less above-the-fold clutter and a less aggressively shrunken default overview.

## Why It Matters

The current prototype technically supports navigation, but Firefox testing shows two practical problems: the graph starts too low on the page, and the default fit makes the overview too small to feel like a landscape the user can meaningfully explore.

## Scope

- Rebalance the layout so the graph gets more immediate screen priority
- Reduce the vertical cost of the header and surrounding chrome where needed
- Adjust the default graph sizing and auto-fit logic so the overview stays explorable
- Validate the result against Firefox-sized viewport captures

## Out Of Scope

- Replacing the prototype with a production UI stack
- Rebuilding the graph layout algorithm from scratch
- Adding new data layers or analytics

## Dependencies

- [TASK-026](../completed/TASK-026-graph-navigation-controls.md)

## Definition Of Done

- The atlas is substantially more visible above the fold in Firefox-sized laptop viewports
- The default overview no longer feels overly miniaturized
- Users can still pan and zoom meaningfully after the layout change
- The updated behavior is validated through Firefox automation and screenshots

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

This is a product-feel pass based on Firefox interaction testing, not a change to the underlying graph data contracts.
