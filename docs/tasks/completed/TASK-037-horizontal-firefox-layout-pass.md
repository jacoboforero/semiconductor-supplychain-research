Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Rework the Firefox desktop layout so the prototype uses horizontal space better and avoids feeling unnecessarily stacked or vertically stretched.

## Why It Matters

The current UI is cleaner than before, but key views still feel too vertical for a desktop research tool. Better horizontal density should make the product feel more like an intentional workspace and less like a sequence of oversized cards.

## Scope

- rebalance desktop Firefox breakpoints
- keep more panels side by side on laptop and desktop widths
- increase horizontal density inside stage, profile, and network layouts
- validate the result with fresh Firefox renders

## Out Of Scope

- new product workflows
- changes to the data model or graph semantics
- scenario-mode implementation

## Dependencies

- `TASK-036`

## Definition Of Done

- the main desktop Firefox views use horizontal space more effectively
- the layout feels less vertically stretched
- the graph workspace and detail panels remain readable
- the pass is validated through fresh Firefox screenshots

## Files Or Areas Likely To Change

- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`
- `apps/ui-prototype/index.html`

## Notes

Bias toward desktop Firefox behavior first. Avoid collapsing to stacked layouts earlier than necessary.

Completed through Firefox screenshot review across overview, stage, network, and profile views. The pass kept more desktop panels side by side, reduced early breakpoint collapse, added denser horizontal card grids, and shortened wrapped network copy that was making the atlas feel vertically stretched.
