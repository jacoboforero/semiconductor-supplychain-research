# V1 UI Architecture

This document defines the product-side UI architecture for v1.

It is intentionally not a frontend implementation spec. It is meant to answer:

- what the user should experience first
- how the product should help them understand the supply chain
- what role the graph should play inside the product
- what should be reused from the current prototype versus rebuilt

## Why A New UI Architecture Is Needed

The current prototype is proving useful things:

- the graph bundle can render at meaningful scale
- the product can support graph navigation
- non-technical explanation panels help
- the current taxonomy is already useful for orientation

But the current UI still has the wrong default mental model.

It is still fundamentally a graph-first atlas.

That is a problem because the semiconductor supply chain is not best understood as:

- one linear chain
- one network of equally important nodes
- one screen where everything should be visible at once

The product should instead help users understand:

- multiple upstream streams
- convergence into critical manufacturing junctions
- where concentration and chokepoints appear
- what matters, not just what exists

So the next UI should not be a polish pass on the current atlas. It should be a new product shell that uses the graph as one view inside a broader explanatory experience.

## Core Mental Model

The native product model should be:

- `parallel supply streams`
- `convergence nodes`
- `transformation stages`
- `outputs and exposure`

The key idea is that the semiconductor supply chain is a converging dependency system.

Examples:

- design, masks, tools, wafers, chemicals, and gases all converge into wafer fabrication
- fabricated wafers, substrates, packaging materials, packaging equipment, and test services converge into packaging and final test

This means the UI should not imply that the supply chain is a single left-to-right pipeline.

It should imply that multiple streams feed critical junctions where disruption can propagate widely.

## Product Principles

### 1. Explanation First

The product should explain the structure before asking the user to interpret a graph.

Every major screen should answer:

- what this is
- why it matters
- what is concentrated here
- what depends on it

### 2. Progressive Disclosure

The product should move from broad structure to specific evidence.

Recommended information order:

- stage
- role
- company
- facility
- relationship
- evidence

### 3. Ranked Importance

Not every node should feel equal.

The UI should emphasize:

- critical junctions
- concentrated roles
- dominant geographies
- hard-to-replace suppliers

### 4. Multiple Representations

The graph should not carry the entire burden of understanding.

The product should use:

- structured overview maps
- cards and rankings
- geography views
- scenario flows
- node profile pages
- graph/network views
- evidence drawers

### 5. Graph As A Lens, Not The Home Screen

The graph should be a reusable analysis view inside the product.

It should not be the default product structure.

## The New Default Product Structure

The new UI should have five top-level surfaces.

### 1. Overview

Purpose:

- give the user a mental model of the whole system
- explain how parallel streams converge
- highlight what is strategically important

This should be the default landing experience.

The screen should include:

- a `convergence map` of major supply streams
- a `top chokepoints` panel
- a `most concentrated stages` panel
- a `critical geographies` panel
- a small number of guided scenario entry points

The overview should feel like a structured briefing, not a raw map dump.

### 2. Stage Explorer

Purpose:

- help the user understand one part of the chain in context

Each stage page should explain:

- what the stage does
- what inputs feed it
- what outputs it creates
- what major roles exist inside it
- which companies dominate it
- which countries and facilities matter most
- what chokepoints exist inside it

This is where stage differentiation should become strongest visually.

### 3. Node Profile

Purpose:

- turn companies and facilities into understandable research objects

Each profile should answer:

- what this entity does
- where it sits in the chain
- what it depends on
- what depends on it
- where it operates
- why it might be important or hard to replace
- what evidence supports the current view

The profile should feel like a briefing page, not an inspector panel.

### 4. Scenario Analysis

Purpose:

- make disruption analysis explicit

Default scenarios can include:

- Taiwan foundry disruption
- upstream specialty gas or chemical chokepoint
- advanced packaging or OSAT bottleneck

Each scenario should show:

- what is disrupted
- which stages are exposed
- which companies or facilities matter most
- what the likely blast radius is
- which evidence supports the scenario framing

### 5. Network View

Purpose:

- allow graph-native exploration after the user has context

The graph remains valuable, but it should now be one lens among several:

- `System`
- `Geography`
- `Network`
- `Evidence`

## Recommended Landing Experience

The home screen should not open directly into the current node-and-edge atlas.

It should open into a structured `System Overview`.

Recommended default layout:

### Hero Strip

Small, concise, and product-focused:

- title
- one-sentence explanation of what the system view represents
- quick entry points for `Overview`, `Scenarios`, and `Search`

### Convergence Map

The central object on the page.

This should show:

- upstream streams as distinct bands
- key convergence points such as wafer fabrication and packaging
- outputs as downstream categories

This should look more like a dependency system or transit interchange than a generic graph.

### Priority Panels

Immediately below or beside the convergence map:

- top chokepoints
- highest concentration roles
- critical countries
- notable facilities

### Guided Starts

The product should always provide starting points such as:

- “Start with wafer fabrication”
- “See how packaging bottlenecks work”
- “Trace materials into the fab”

## Primary Screen Hierarchy

Recommended hierarchy:

1. `Overview`
2. `Stages`
3. `Companies`
4. `Facilities`
5. `Scenarios`
6. `Network`
7. `Evidence`

This hierarchy matters because it makes the system legible before exposing full graph complexity.

## How Stages Should Be Modeled In The UI

Stages should remain visually differentiated, but not as one simple chain.

The UI should show:

- `parallel inputs`
- `merge points`
- `transformation steps`
- `branching outputs`

An example conceptual structure:

- Design and software
- Masks and reticles
- Wafers and substrates
- Materials, chemicals, and gases
- Manufacturing equipment
- Front-end manufacturing
- Back-end manufacturing
- Outputs and exposure

Not every stage is “before” or “after” every other stage. Some exist in parallel and only matter once they converge into manufacturing or packaging.

That should be visible in the product itself.

## What The Graph Should Still Do

The graph still matters, but its job becomes narrower and clearer.

The graph should be best at:

- exploring connected context around a node
- showing local dependency neighborhoods
- tracing relationship paths
- switching between company, facility, and geography views

The graph should not be solely responsible for:

- teaching the user the whole supply chain
- ranking what matters most
- explaining chokepoints in plain language

## What Should Be Reused From The Current Prototype

These parts remain useful:

- graph bundle and bundle-loading pattern
- current graph rendering work as a reusable `Network` surface
- taxonomy-driven labels and segment structures
- node explanation patterns
- search, focus, and drill-down interaction patterns
- lightweight prototype posture

These are not wasted work. They are supporting components for the new product shell.

## What Should Be Rebuilt

These parts likely need a meaningful redesign:

- the default landing screen
- the page-level information architecture
- the relationship between the graph and the rest of the product
- the current “all-purpose atlas” screen as the main chassis
- the way stage structure is communicated visually

This is a UI re-architecture, not a restart of the project.

## Screen-Level Recommendations

### Overview Screen

Needs:

- convergence map
- stage cards
- top chokepoints
- concentration summaries
- geography summaries

Avoid:

- leading with dense node labels
- forcing the user into graph interpretation immediately

### Stage Screen

Needs:

- stage purpose
- key inputs
- key outputs
- dominant roles
- top companies
- important facilities
- network tab

Avoid:

- generic “list of nodes in this segment” behavior

### Company Screen

Needs:

- role summary
- where it fits
- what it provides
- what it depends on
- geography and facilities
- related evidence

Avoid:

- schema-heavy inspector copy

### Facility Screen

Needs:

- facility type
- operator
- geography
- process relevance
- strategic importance

Avoid:

- treating facilities as only small children of company pages

### Scenario Screen

Needs:

- disruption entry point
- affected stages
- exposed companies and facilities
- likely blast radius
- evidence panel

Avoid:

- making scenario analysis feel like ad hoc graph clicking

## Recommended Prototype Sequence

The next UI work should not jump directly to a full new frontend.

A better sequence:

### Slice 1: System Overview Prototype

Goal:

- replace the raw graph home screen with a convergence-oriented overview

Deliver:

- stage and stream overview
- top chokepoints panel
- geography and concentration callouts
- entry points into stage pages and network view

### Slice 2: Stage And Node Profiles

Goal:

- make stages, companies, and facilities understandable as pages

Deliver:

- one reusable stage template
- one reusable company template
- one reusable facility template

### Slice 3: Scenario Mode

Goal:

- show that the product can analyze disruption, not just organize entities

Deliver:

- 2-3 scenario walkthroughs using existing graph and evidence data

Only after that should the prototype invest further in graph polish.

## Mapping To The Current Data Foundation

The good news is that this UI direction still fits the current durable foundation.

It aligns with:

- the evidence-first model
- the controlled taxonomy
- the company and facility registry
- the graph-as-projection architecture

So this document changes the product shell, not the underlying system thesis.

## Decision Summary

The current atlas should not be treated as the final UI chassis.

The project should move to:

- a structured overview-first product
- a convergence-oriented system map
- explicit stage, node, and scenario views
- a graph that acts as one analysis surface inside the product

That is the most credible path from prototype to a real V1 product experience.
