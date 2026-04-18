Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Fix the graph viewport so normal vertical scrolling continues to move the page even when the cursor is over the atlas, while preserving intentional horizontal movement and zoom interactions.

## Why It Matters

The current atlas still feels like a scroll trap. If vertical wheel gestures get captured by the graph container, the experience feels broken even when the rest of the navigation model is improving.

## Scope

- Route vertical wheel intent to page scrolling when the cursor is over the graph
- Preserve horizontal wheel/trackpad movement inside the graph
- Preserve zoom behavior for pinch and modifier-assisted zoom
- Validate the updated behavior against Firefox-specific testing

## Out Of Scope

- Reworking the graph layout
- Changing the underlying data bundle or graph projection
- Replacing direct-manipulation drag behavior

## Dependencies

- [TASK-026](../completed/TASK-026-graph-navigation-controls.md)
- [TASK-027](../completed/TASK-027-firefox-atlas-layout-and-viewport-polish.md)

## Definition Of Done

- Vertical wheel scrolling works naturally over the graph area
- Horizontal movement still works inside the atlas when the user intends it
- Zoom interactions still work
- The behavior is checked against Firefox

## Files Or Areas Likely To Change

- `apps/ui-prototype/app.js`
- `apps/ui-prototype/styles.css`

## Notes

This is a targeted interaction fix driven by Firefox behavior on a Mac trackpad.
