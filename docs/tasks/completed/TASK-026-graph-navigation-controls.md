Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Add viewport controls and direct-manipulation navigation to the prototype graph so a non-technical user can zoom, pan, and re-center the atlas without losing the simplified overview model.

## Why It Matters

The 200-company atlas is now broad enough that static rendering alone is not sufficient. Users need a clear, simple way to move around the graph and focus on one part of the chain at a time.

## Scope

- Add explicit zoom controls to the prototype graph UI
- Add pan behavior so users can move around the graph directly
- Add fit-to-view behavior that respects the current focused slice
- Update the prototype copy so the navigation model is understandable
- Verify the refined behavior against the built-in 200-company atlas

## Out Of Scope

- Reworking the underlying graph projection or bundle contract
- Adding advanced graph layouts or physics
- Replacing the prototype with a production frontend stack

## Dependencies

- [TASK-022](../completed/TASK-022-rebuild-v1-scale-graph-and-ui-artifacts.md)
- [TASK-013](../completed/TASK-013-guided-scenario-ui.md)

## Definition Of Done

- Users can zoom in and out from the UI without changing the dataset
- Users can move around the graph intentionally instead of relying on default browser behavior alone
- The prototype can automatically fit the current visible graph slice into view
- The resulting interaction remains understandable for a non-technical user

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

This is still prototype work. The goal is not feature-complete graph tooling; it is enough navigation to make the atlas usable at the current scale.
