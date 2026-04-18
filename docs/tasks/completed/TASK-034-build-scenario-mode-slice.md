Status: `done`
Priority: `P1`
Owner: `Codex`
Created: `2026-04-18`
Updated: `2026-04-18`

## Goal

Build the first scenario-mode prototype slice so disruption analysis becomes an explicit product workflow rather than something implied by the graph.

## Why It Matters

One of the main reasons this product exists is to help users understand chokepoints and disruption exposure. Scenario mode should make that value legible without requiring open-ended graph exploration.

## Scope

- Create the first scenario entry structure
- Support at least one concrete disruption walkthrough
- Show affected stages, exposed companies or facilities, and likely blast radius in plain language

## Out Of Scope

- Full analytics suite
- Exhaustive scenario library
- Final production-grade simulation behavior

## Dependencies

- `docs/V1_UI_ARCHITECTURE.md`
- `TASK-030`
- `TASK-031`
- `TASK-033`

## Definition Of Done

- The prototype supports at least one explicit disruption scenario flow
- The scenario reads as analysis, not generic graph browsing
- The product shows blast radius and chokepoint implications in an intelligible way

## Files Or Areas Likely To Change

- `apps/ui-prototype/index.html`
- `apps/ui-prototype/styles.css`
- `apps/ui-prototype/app.js`

## Notes

Start with one of the default suggested V1 scenarios from the product brief.

Completed with a reusable scenario-analysis surface in the prototype, including a real Taiwan foundry disruption briefing, additional scenario entry points, plain-English blast-radius framing, affected stage/company/geography panels, and Firefox validation.
