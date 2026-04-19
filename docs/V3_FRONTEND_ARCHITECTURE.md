# V3 Frontend Architecture

Status: active planning and implementation baseline

This document defines how V3 should be implemented without repeating the mistakes of earlier graph iterations.

## Architectural Goal

Support two different visual products from one dependency bundle:

- a systems map
- a representative-company map

Both should share the same underlying company model and inspector flows.

## Key Decision

V3 should not be built by stretching the Cytoscape workspace again.

The systems map is not a freeform node graph.

It is a deliberately composed product surface.

That means the rendering boundary changes:

- V2 renderer: graph engine first
- V3 renderer: layout composition first, graph evidence second

## Core Principles

### 1. Keep The Bundle Boundary

V3 should continue to consume the existing `ui_bundle.json` contract through the shared normalization layer.

The durable asset remains:

- company registry
- dependency edges
- evidence grounding

### 2. Add A Display Model Layer

V3 needs a dedicated display model that sits above the bundle model.

This layer should:

- map detailed stage taxonomy into the V3 display taxonomy
- choose representative companies per display category
- expose stable map connections and convergence points

### 3. Use A Composed DOM/SVG Renderer

The systems map should be rendered with:

- DOM for stage cards and company pills
- SVG for directional connectors and animated flow lines

This is a better fit than a force-directed or freely draggable graph renderer for the default product view.

### 4. Separate System And Company Layouts

The representative-company view should keep the same structural logic as the systems map, but it does not have to use the exact same card geometry.

Reason:

- company content is denser
- map readability still matters more than strict positional identity

### 5. Keep Inspector And Search Shared

V3 should share:

- search
- company selection
- inspector payloads

The variation belongs in the map surface, not in duplicated app shells.

## Proposed Data Flow

1. `ui_bundle.json`
2. shared bundle normalization
3. V3 display model
4. workspace state
5. system-map scene or representative-company scene
6. DOM/SVG renderer
7. inspector/search overlays

## Workspace Modes

Recommended V3 modes:

- `system`
- `companies`

Recommended cross-cutting state:

- selected display category
- selected company
- search query
- inspector open state

## Rendering Model

### System Map

- fixed display categories
- directional stage connectors
- no free dragging
- map-first abstraction

### Representative Company View

- same stage structure
- small set of representative companies per category
- real dependency edges between visible representatives
- selection can temporarily promote additional neighboring companies into view

## Risks

- representative-company cards can grow too large if the visible set is not tightly limited
- display placement choices for IDMs and multi-role firms can become misleading if not documented
- the product can regress into clutter if inspector and overlay density grow too quickly

## Validation Requirements

Each V3 pass should be considered incomplete until:

- `npm run build` passes
- the default system map has no obvious stage or overlay collisions in a laptop viewport
- the representative-company view also clears the same overlap/clipping checks
- stage selection and company selection still open the inspector correctly
