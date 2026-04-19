# V2 Product Spec

Status: active planning

Note: the default prototype surface has now moved to the V3 systems-map model in [V3_PRODUCT_SPEC.md](V3_PRODUCT_SPEC.md). This document remains useful as the record of the graph-native full-canvas transition that made V3 possible.

This document defines the next product step after the current V1 dependency-graph prototype.

V1 is now useful as a semantic proof:

- the graph is company-only
- the dependency edges are the main visible relationships
- the current UI proves the bundle and interaction model are directionally correct

V2 is not a polish pass on that shell.

V2 is a separate rebuild aimed at the actual product vision: a graph-native, full-canvas workspace that feels closer to a god's-eye system map than to a dashboard with a graph widget.

## Product Goal

Make the graph feel like the product itself.

The user should open the app and immediately feel that they are looking at the semiconductor supply chain from above:

- where flows start
- where they converge
- where they bottleneck
- how one company feeds another

Everything else should support that object rather than compete with it.

## Primary User

The primary user remains:

- a business or supply-chain student
- an independent researcher
- an analyst or strategist

This user wants:

- a visually striking first read
- fast orientation without tutorials
- direct path tracing
- strong company inspection
- believable evidence grounding

This user does not want:

- permanent sidebars that squeeze the graph
- multiple competing panels on first load
- a UI that feels like enterprise dashboard furniture

## Product Thesis

V2 should behave like a graph-native operating surface.

The experience should feel:

- calm
- spatial
- powerful
- intentional
- professional enough to demo without apology

The interface should communicate simplicity first and depth second.

## Core Workflows

V2 must make these workflows excellent before anything else:

1. Open the full supply-chain map and understand the broad flow shape immediately.
2. Search for a company and open its neighborhood without losing spatial context.
3. Trace upstream suppliers and downstream dependents from a selected company.
4. Enter a scenario lens that highlights a meaningful corridor or chokepoint.
5. Compare how different corridors converge into shared critical nodes.

Everything else is secondary.

## Default Screen Hierarchy

The default desktop screen should prioritize:

1. The graph canvas
2. The active flow or focus state
3. Search and graph controls
4. On-demand detail
5. Secondary metadata and explanation

This means:

- the graph visually owns the viewport
- overlays float over the canvas instead of reserving large permanent columns
- detail opens only when summoned
- explanatory prose stays compact and optional

## Default Experience

On first load, the user should see:

- a full-canvas dependency graph
- a compact floating search entry
- a minimal top identity strip or command cluster
- a few high-value starting actions
- a visible sense of upstream-to-downstream flow

The user should not see:

- two persistent side rails
- a large fixed briefing column
- a graph reduced to the center card of a dashboard

## Interaction Modes

V2 should support a small number of explicit workspace modes.

### 1. Overview Mode

The broadest graph view.

Purpose:

- show overall flow shape
- show major convergence points
- let the user choose where to go next

### 2. Trace Mode

The core analytical interaction.

Purpose:

- trace upstream suppliers
- trace downstream dependents
- isolate one corridor through the chain

### 3. Company Mode

Focused company inspection.

Purpose:

- inspect role, geography, facilities, and evidence
- understand upstream and downstream exposure
- keep the company inside the visible map rather than navigating away

### 4. Scenario Mode

Structured product storytelling over the graph.

Purpose:

- highlight a chokepoint or disruption corridor
- explain why it matters in one short briefing
- keep the graph as the primary explanatory object

### 5. Compare Mode

Optional after the first vertical slice.

Purpose:

- compare two corridors, hubs, or geographies
- help users imagine broader analytical value

## Visual Direction

The intended reference class is closer to:

- map products
- mission control interfaces
- geospatial intelligence workspaces
- high-end graph or systems exploration tools

The intended direction is not:

- dashboard cards with a graph in the middle
- page stacks
- tab tours

Visual requirements:

- full-bleed or near-full-bleed graph
- floating controls
- restrained but premium materials
- deliberate camera behavior
- stronger spatial drama than V1

## Information Model On Screen

The graph still remains company-only by default.

Metadata should continue to appear through:

- filters
- overlays
- node accents
- detail drawers
- short badges

Visible graph peers should not expand back into:

- countries as nodes
- roles as nodes
- stages as nodes
- facilities as default peer nodes

## Honest Data Posture

V2 should not pretend the graph is more complete than it is.

The interface should stay visually ambitious while remaining honest about:

- what is evidence-backed
- what is curated
- what is sparse

This honesty should show up through traceability and concise cues, not through defensive walls of copy.

## Success Criteria

V2 is successful when:

- the graph feels like the page
- first-load desktop view feels immersive rather than boxed-in
- users can trace company-to-company flow without hunting through chrome
- the product looks like a serious demo artifact rather than a prototype dashboard
- the architecture stays modular enough to avoid another frontend rewrite caused by layout entanglement

## Non-Goals

V2 is not trying to:

- become a full SaaS platform
- solve every analytical workflow at once
- hide sparse relationship coverage behind decorative complexity
- rewrite the durable data pipeline for visual reasons alone
