# V2 Frontend Architecture

Status: active planning

Note: the current default surface is V3, documented in [V3_FRONTEND_ARCHITECTURE.md](V3_FRONTEND_ARCHITECTURE.md). This V2 document remains the canonical record of the isolated frontend-boundary and renderer-adapter decisions that preceded V3.

This document defines how to build the V2 frontend efficiently while avoiding more UI debt.

## Architectural Goal

Build a graph-native workspace that can reach the intended visual/product bar without coupling the whole app to the current V1 shell.

The most important architectural move is:

- freeze V1 except for obvious bug fixes
- build V2 in an isolated frontend boundary

## Key Decision

V2 should not be implemented as a chain of modifications to the current V1 layout.

That path would accumulate:

- layout hacks
- duplicated UI states
- renderer coupling inside React components
- progressively harder-to-remove V1 assumptions

Instead, V2 should be built as a parallel slice and only replace V1 after the slice proves itself in direct browser validation.

## Core Principles

### 1. Freeze V1

Treat the current UI as:

- semantic proof
- fallback demo
- reference for what already works

Do not continue using V1 as the place where major layout experimentation happens.

### 2. Build V2 In Isolation

Preferred boundary:

- `apps/ui-prototype/src/v2/`

Possible top-level structure:

- `src/v2/app/`
- `src/v2/components/`
- `src/v2/overlays/`
- `src/v2/renderer/`
- `src/v2/state/`
- `src/v2/model/`
- `src/v2/styles/`

This keeps V2 work from tangling with the current V1 component tree.

### 3. Keep Graph Logic Out Of Components

React components should not compute graph semantics directly.

Instead:

- bundle normalization happens once
- graph-specific derived state lives in a model layer
- workspace mode and selection state live in a state layer
- the renderer receives explicit scene/view-model objects

### 4. Introduce A Renderer Adapter

The graph renderer should sit behind an adapter boundary.

That adapter should expose a small surface such as:

- `mount(container, callbacks)`
- `setScene(scene)`
- `fit(ids, options)`
- `focus(selection, options)`
- `destroy()`

The first implementation can still use Cytoscape.

The point is to avoid binding React and product state directly to Cytoscape-specific assumptions, so a later renderer swap is possible if needed.

### 5. Keep The Bundle Boundary Additive

The backend should stay additive.

Do not redesign the durable pipeline for visual reasons unless V2 truly needs new durable fields.

Allowed:

- additive bundle fields
- better path summaries
- better edge metadata
- extra derived metrics

Not allowed by default:

- rewriting the core graph pipeline just to support a new shell

### 6. Validate In Vertical Slices

V2 should be built in thin, testable slices.

Do not rebuild every workflow at once.

Ship one slice that proves:

- full-canvas graph
- floating search
- company drawer
- upstream/downstream trace
- one scenario overlay

Only then expand.

## Proposed Data Flow

The V2 frontend should use this boundary:

1. `ui_bundle.json`
2. normalization layer
3. derived product model
4. workspace state model
5. scene builder
6. renderer adapter
7. floating overlays and drawers

That separation helps avoid component-level graph logic and keeps scene generation deterministic.

## Workspace State Model

V2 should treat the app as explicit workspace modes rather than a pile of booleans.

Recommended high-level modes:

- `overview`
- `trace`
- `company`
- `scenario`
- `compare`

Recommended cross-cutting state:

- active search query
- active lens
- selected company
- selected edge
- active compare target
- overlay visibility
- camera intent

## Overlay Strategy

Replace permanent layout rails with demand-based overlays:

- floating search panel
- floating quick-start cluster
- collapsible detail drawer
- compact mode chip / breadcrumbs
- transient evidence tray when needed

The graph should lose as little screen real estate as possible while these overlays are open.

## Styling Strategy

Do not port the current V1 layout classes forward by default.

Instead:

- define a fresh set of V2 layout tokens
- define overlay primitives
- define graph-stage sizing primitives
- define a tighter visual hierarchy around the canvas

Reuse:

- color direction
- typography direction
- motion tone

Do not reuse:

- permanent rail assumptions
- card-heavy page layout assumptions

## Execution Order

1. establish `src/v2/` boundary and renderer adapter
2. implement the V2 shell with full-canvas graph and floating controls
3. wire company selection and company drawer
4. wire upstream/downstream trace mode
5. wire one scenario overlay
6. validate in Firefox with Computer Use
7. expand to compare, corridor, and semantic zoom workflows
8. only then decide whether to replace V1 as the default entry

## Risks

- Cytoscape may still constrain the final visual ambition even behind an adapter
- floating overlays can become visually messy if they are not tightly prioritized
- sparse dependency coverage can make an immersive shell feel emptier unless corridor selection is curated carefully

## Validation Requirements

Each V2 slice should be considered incomplete until:

- `npm run build` passes
- the slice works in Firefox laptop-sized viewports
- Computer Use validation confirms the graph remains the dominant object
- the product flow is understandable without exploratory clicking through many controls
