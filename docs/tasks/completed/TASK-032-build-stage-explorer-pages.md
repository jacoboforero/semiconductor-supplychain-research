Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Build the first stage-explorer pages so each major stage becomes an understandable product view rather than just a graph segment.

## Why It Matters

Stages are one of the most natural product-entry concepts for users trying to learn the supply chain. The product needs reusable stage pages to explain purpose, inputs, outputs, major roles, and concentration.

## Scope

- Create the first reusable stage page template
- Show stage purpose, key inputs, key outputs, roles, companies, and countries
- Add navigation from the overview shell into stage pages

## Out Of Scope

- Full company and facility profiles
- Full scenario mode
- Detailed supply-path tracing

## Dependencies

- `docs/V1_UI_ARCHITECTURE.md`
- `TASK-030`
- `TASK-031`

## Definition Of Done

- At least one stage can be explored as a dedicated page or state
- Stage-specific understanding does not require graph interpretation alone
- The stage explorer strengthens the new product shell rather than recreating the atlas

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

This was completed with reusable stage-shell patterns and an initial Front-end Manufacturing stage page that explains dependencies, roles, companies, and geography.
