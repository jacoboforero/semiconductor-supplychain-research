# V1 UI Architecture

This document defines the current product-side UI architecture for v1.

Status note:

- this remains the source of truth for the current V1 workspace
- the next immersive graph-native rebuild is defined in [V2_PRODUCT_SPEC.md](V2_PRODUCT_SPEC.md) and [V2_FRONTEND_ARCHITECTURE.md](V2_FRONTEND_ARCHITECTURE.md)

The main requirement is now explicit:

- the default product graph is a company-only dependency graph
- the main visible relationship is evidence-backed dependency flow
- stage, role, geography, and facility data should support the canvas without becoming the dominant visible node structure

## Why This Matters

The earlier graph-first rebuild improved the shell, interactions, and visual quality, but it still encoded the wrong product object.

It visualized the system more like an ontology map than a supply dependency graph.

That is not the intended user experience.

The user should be able to:

- see how upstream suppliers feed downstream manufacturing
- see where flows converge into fabs, packaging, and test bottlenecks
- understand chokepoints through visible company-to-company structure
- click into metadata only when they want detail

## Primary User

The primary user for this phase is:

- a business or supply-chain student
- an independent or policy researcher
- an analyst or strategist trying to understand concentration and chokepoints quickly

This user wants:

- a strong immediate visual
- a clear sense of where to start
- fast search and focus
- confidence about what is grounded in data
- a way to move from system view to company detail without losing context

This user does not want:

- a tour of tabs
- a wall of orientation copy
- a graph dominated by internal data-model categories

## Product Thesis

The UI should behave like a graph-native dependency workspace.

The product should feel simple at first glance:

- one main canvas
- one obvious search entry
- a small number of filters and scenario starts
- one detail drawer

The product should then reveal depth through interaction:

- select a company
- trace a dependency path
- isolate a stage or geography
- switch into a scenario
- inspect evidence and metadata without leaving the graph

## Core Principles

### 1. Company-Only Default Graph

The main visible graph nodes are companies or organizations.

The main visible edges are dependency relationships.

Non-company entities remain in the model, but they should not dominate the primary canvas.

### 2. Context Without Detours

Detail should appear in drawers, sheets, and overlays instead of sending the user through a sequence of separate pages.

### 3. Minimal Copy, Maximum Signal

Favor:

- labels
- chips
- short summaries
- ranked metrics
- tight legends

Avoid long explanatory paragraphs unless the user explicitly opens deeper context.

### 4. Strong Default Workflows

The first interaction options should be obvious:

- search for a company
- filter by stage, role, country, or facility metadata
- start from a predefined scenario
- click a lens that isolates a flow or bottleneck

### 5. Trust Is Visible

Evidence and source footing should always be accessible from the current context, but should not dominate the main canvas.

### 6. Aesthetics Matter

The product is a research tool and a demo artifact.

It should look deliberate, premium, and visually memorable.

## Workspace Model

The desktop product should be one persistent workspace with five structural zones.

### 1. Top Command Bar

Contains:

- product identity
- omnibox search
- snapshot controls
- layout reset and fit actions

The top bar should be compact and always visible.

### 2. Primary Graph Canvas

This is the center of the product.

Requirements:

- always visible in the desktop flow
- pan and zoom as first-class interactions
- companies as the primary visible node class
- dependency edges as the primary visible edge class
- graceful behavior at the current graph scale
- stage-guided left-to-right structure so convergence is visually legible
- support for scenarios, path highlighting, and focus states

### 3. Left Workflow Rail

Used for:

- guided starts
- stage lenses
- geography lenses
- scenario entry points
- evidence-coverage cues

This rail should feel like a command launcher, not a documentation sidebar.

### 4. Right Detail Drawer

Opens on selection and becomes the main inspection surface.

For a selected company or edge, it should answer:

- what this is
- why it matters
- where it sits in the chain
- what it depends on and what depends on it
- what sources or identifiers anchor it

### 5. Compact Insight Strip Or Overlay State

Used for:

- current selection summary
- active filters
- scenario state
- quick metrics

This should stay compact and secondary.

## Graph Requirements

### Default Visual Contract

The default product graph should render only companies or organizations as visible nodes.

The graph should not render stages, roles, countries, and facilities as peer node classes in the main product view.

Those entities should instead appear through:

- layout guidance
- filtering and lensing
- badges and metadata
- the detail drawer
- optional overlays or secondary analytical views

### Node Semantics

Companies should carry enough visual variation to communicate importance without changing the node ontology.

Recommended differentiation:

- compact company pills or capsules as the base node form
- stronger emphasis for major hubs, chokepoints, or selected nodes
- labels that expand with focus and zoom
- subtle metadata accents rather than extra visible node classes

### Layout Strategy

The default layout should be disciplined and legible, not purely organic.

The graph should behave like a dependency flow map rather than a generic network hairball.

The default view should emphasize:

- upstream-to-downstream flow
- convergence into critical manufacturing nodes
- visible chokepoints and hubs
- stage ordering as spatial guidance rather than visible node clutter

### Semantic Zoom

At broad zoom levels:

- the flow shape should be obvious
- dense company clusters can simplify
- labels should stay selective

At closer zoom levels:

- more company labels should appear
- local dependency neighborhoods should become inspectable
- edge evidence or predicate detail can become available in the drawer

### Focus Behavior

When a user selects a company, the graph should:

- visually isolate the relevant neighborhood
- maintain spatial continuity where possible
- make next actions obvious from the drawer

### Search Behavior

Search should:

- accept company names first and foremost, while also allowing metadata-based filtering
- bring the graph to the result immediately
- open the drawer with a usable summary
- allow quick clearing back to the full graph

### Scenario Behavior

Scenarios should not become separate pages by default.

They should act as graph overlays that:

- set a dependency lens
- highlight relevant companies, paths, stages, and geographies
- identify representative companies
- explain the scenario in a short briefing card

## Information Hierarchy

The product should prioritize information in this order:

1. company dependency structure
2. selected company or scenario
3. immediate upstream and downstream connections
4. trusted anchors and evidence
5. deeper supporting detail

The graph should always hold position one.

## Visual Direction

The UI should feel closer to:

- a command center
- a live atlas
- a premium research interface

It should feel less like:

- a static explainer page
- a dashboard grid
- a generated admin panel

Recommended visual characteristics:

- atmospheric background rather than flat white
- restrained but high-contrast color system
- strong typography
- soft depth and panel glassing around the canvas
- subtle motion on focus, reveal, and panel transitions

## What To Preserve From The Current Prototype

- the `ui_bundle.json` contract
- the underlying stage, role, country, company, and facility modeling
- the scenario seed content
- local snapshot loading
- the replaceable nature of the frontend layer
- the current atmospheric visual direction and premium demo feel

## What To Replace

- the visible ontology-map treatment of stage, role, country, and facility nodes in the main graph
- the assumption that the current graph can lead with every entity type equally
- the amount of instructional copy on the default path

## Technical Implications

The new frontend should:

- remain isolated under `apps/ui-prototype/`
- preserve the durable pipeline boundary
- use a mature graph interaction library
- keep the current visual vibe while changing the graph semantics underneath it

The new graph projection should:

- prefer company-to-company dependency edges in the default canvas
- keep non-company entities available as metadata, filters, and secondary overlays
- avoid inventing fake dependency paths where evidence does not yet exist

## Recommended Implementation Slices

### Slice 1: Dependency Data Slice

- define the first dependency seed contract
- project typed company-to-company dependency edges
- expose those edges cleanly in the UI bundle

### Slice 2: Workspace Shell

- preserve the current top command bar, left rail, right drawer, and premium visual tone
- keep the graph canvas as the default home

### Slice 3: Graph Interaction Model

- company-only nodes
- stage-guided dependency layout
- metadata filters and focus behavior
- path and neighborhood inspection

### Slice 4: Scenario Overlays

- scenario launcher
- short scenario briefing
- highlighted companies, paths, and relevant geographies
- drawer-driven drill-ins

### Slice 5: Visual Polish And Validation

- spacing and scaling refinement
- typography and color polish
- laptop-width validation
- direct browser walkthroughs

## Decision Summary

The v1 UI should open into a graph-first workspace where the user immediately sees company dependency flow, convergence, and chokepoints in a calm but powerful visual environment.
