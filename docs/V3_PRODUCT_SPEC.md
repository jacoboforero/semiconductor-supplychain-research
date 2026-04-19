# V3 Product Spec

Status: active planning and implementation baseline

This document defines the next product step after the graph-native V2 workspace slice.

V2 proved an important point:

- the product should be graph-first
- the graph should be company-only at the entity layer
- dependency flow is the right semantic backbone

But V2 still asked one graph to do two jobs at once:

- explain the industry at a glance
- show a detailed company network

V3 separates those jobs.

## Product Goal

Make the default experience an instantly legible systems map of the semiconductor supply chain.

The first screen should teach:

- what the major upstream branches are
- where they converge
- where output is released downstream

Then the user should be able to open a second view that keeps the same structure while swapping in representative companies and real dependency links.

## Product Thesis

V3 is not a bigger graph.

V3 is a cleaner abstraction layer over the graph.

The product should feel like:

- a systems map first
- a representative company graph second
- a full company dependency registry underneath both

## Default Experience

The user should open the app and immediately understand:

- there are multiple upstream branches
- those branches are parallel, not a single linear pipeline
- wafer fabrication is the primary convergence point
- packaging and test is the release bridge into downstream demand

The user should not need to click through controls to discover the basic structure.

## Core Views

### 1. System Map

The default view.

Purpose:

- teach the structure of the supply chain at a glance
- show visible directionality
- emphasize convergence instead of taxonomy dumping

### 2. Representative Companies

The second view.

Purpose:

- keep the same structural map
- replace abstract categories with a small set of top representative companies
- make real company-to-company links visible without overwhelming the screen

### 3. Inspector

On-demand supporting surface.

Purpose:

- explain the selected category or company
- show nearby companies and evidence
- keep detail subordinate to the map

## Display Taxonomy

V3 uses this simplified map taxonomy:

- `Design Stack`
- `Materials & Chemicals`
- `Wafers & Substrates`
- `Masks & Reticles`
- `Production Tooling`
- `Wafer Fabrication`
- `Packaging & Test`
- `Downstream Delivery`

This is not the full industry taxonomy.

It is the default display abstraction.

## Product Rules

### 1. Direction Must Be Visible

Every map-like view should visibly communicate the direction of capability flow.

That means:

- directional connectors
- clear upstream and downstream reading
- explicit convergence into fabrication and release out of packaging

### 2. Do Not Imply A Fake Linear Order

The map must not look like a simple eight-step pipeline.

It should show:

- parallel upstream branches
- convergence points
- selective downstream release paths

### 3. The System Map And Company Graph Are Distinct

The map is for comprehension.

The representative company view is for a concrete, believable sample of the underlying network.

The full dependency graph still exists underneath, but it should not dictate the first-load visual abstraction.

### 4. Companies Can Participate In More Than One Truth Layer

The underlying data model may support multiple roles or stage participation for a company.

The display model is allowed to choose a primary placement for the representative view when that makes the map clearer.

## Success Criteria

V3 is successful when:

- the first screen explains the supply chain instantly
- the system map feels spatial and intentional rather than dashboard-like
- the representative company view reads like the same structure, not a separate product
- direction and convergence are visible without explanatory walls of text
- the underlying dependency graph remains usable for later lenses and drilldowns

## Non-Goals

V3 is not trying to:

- fully mirror every industry sub-stage in the default view
- replace the durable full taxonomy with the display taxonomy
- solve exhaustive company coverage in the first systems-map release
