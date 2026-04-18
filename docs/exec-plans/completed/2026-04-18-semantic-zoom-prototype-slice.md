# Semantic Zoom Prototype Slice

Status: completed

## Goal

Make the current network readable at multiple scales by combining semantic zoom, grouped metanodes, and context-aware defaults.

## Scope

- introduce semantic detail levels for the network view
- replace broad raw company clouds with grouped company or facility metanodes where appropriate
- preserve drill-in paths from grouped views into more detailed slices
- validate the new behavior in Firefox with real prototype renders

## Deliverables

- semantic zoom thresholds or detail rules in `apps/ui-prototype/`
- grouped company and facility metanodes in broad network contexts
- clearer status or preview language that tells the user why some nodes are grouped
- Firefox-validated network views that show patterns more clearly than the current raw-node version

## Out Of Scope

- production-grade graph rendering performance work
- new source ingestion
- full scenario-mode implementation

## Execution Order

1. define graph detail rules by context and zoom level
2. introduce grouped metanodes for dense company and facility layers
3. preserve user drill-in paths from grouped views into more detailed network slices
4. adjust preview copy so grouped behavior feels intentional rather than broken
5. validate overview, stage, and profile network contexts in Firefox and iterate visually

## Risks

- aggregation could hide too much detail if drill-in is not obvious
- zoom-triggered graph rebuilds could feel jumpy if they reset the user's position
- grouped nodes could read like fake data unless their purpose is explained clearly

## Validation

- zoomed-out network views reveal patterns instead of company clutter
- grouped nodes make sense in Firefox without extra explanation from the developer
- zooming or drilling in reveals more detail without losing the current context
