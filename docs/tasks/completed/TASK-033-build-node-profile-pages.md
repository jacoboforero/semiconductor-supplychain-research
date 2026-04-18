Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Rebuild company and facility detail views as briefing-style profile pages instead of inspector-style side panels.

## Why It Matters

The current detail experience exposes structure, but it does not yet feel like a product built for researchers and decision-makers. Profiles should explain why a node matters, what it depends on, and what depends on it.

## Scope

- Create reusable company and facility profile patterns
- Emphasize plain-English summaries, strategic importance, geography, and dependencies
- Preserve evidence access without making the view schema-heavy

## Out Of Scope

- Full scenario analysis
- Advanced relationship analytics
- Complete redesign of the underlying node data model

## Dependencies

- `docs/V1_UI_ARCHITECTURE.md`
- `TASK-030`

## Definition Of Done

- Company and facility views feel like product pages, not debugging panels
- Important context is understandable without graph expertise
- Evidence remains available but secondary to explanation

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

This was completed by adding company and facility profile views, profile routing from stage and network surfaces, and Firefox-validated preview-to-profile handoff behavior.
