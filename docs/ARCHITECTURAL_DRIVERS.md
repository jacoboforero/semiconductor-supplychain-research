# Architectural Drivers

This document identifies the decisions that should be made now because they materially shape the future architecture.

The goal is not to finalize the stack yet. The goal is to define the assumptions that the eventual stack must serve.

## How To Use This Document

For each driver:

- decide the working assumption for v1
- record if that assumption is firm or provisional
- only then make implementation choices downstream

## Current Status

The sections below now distinguish between a generic recommendation and the current working decision for this project.

## Decisions To Make Now

## 1. Primary User And Workflow

Question:

- Is v1 primarily for a single researcher workflow, a small analyst team, or a future SaaS audience?

Why it matters:

- This affects local-first versus hosted architecture, permissions complexity, collaboration needs, and whether speed of iteration matters more than multi-user infrastructure.

Recommended v1 assumption:

- Build for a solo researcher or very small analyst workflow first.

Current working decision:

- Build for a solo researcher or very small analyst workflow first.
- The UI must also be accessible to outside viewers early so the project can collect iterative feedback.

## 2. Primary Output

Question:

- What should v1 actually produce: a graph database, a set of notebooks, a lightweight dashboard, or a researcher-facing exploration app?

Why it matters:

- This determines whether the architecture should optimize first for ingestion and analysis or for interactive product delivery.

Recommended v1 assumption:

- The primary output should be a queryable graph plus a small set of analysis notebooks or query packs, with visualization as a secondary layer.

Current working decision:

- V1 should produce a queryable graph, analysis notebooks or query packs, and a prototype UI or dashboard that makes the graph visually compelling for demos.
- The UI does not need production-grade product depth, but it should feel like a coherent prototype with graph exploration and filtering.

## 2A. Default Visual Graph Contract

Question:

- Should the default product graph be an ontology map of multiple entity types, or a company-only dependency graph?

Why it matters:

- This changes the bundle shape the UI needs, the graph layout, the role of metadata entities, and which data slices are truly on the critical path.

Recommended v1 assumption:

- The default product graph should be a company-only dependency graph.

Current working decision:

- Accepted.
- The main product graph should render companies or organizations as the visible nodes.
- The main visible edges should be evidence-backed dependency relationships.
- Stage, role, geography, and facility data should remain in the model, but should primarily guide layout, filtering, and detail inspection rather than appear as peer node classes in the default canvas.
- A typed ontology or systems-map view can still exist as a secondary analytical surface, but it is not the main product object.

## 3. System Of Record

Question:

- What is the canonical source of truth: the graph database itself, or normalized datasets that are loaded into the graph?

Why it matters:

- This changes how reproducible the project is, how debugging works, and whether ingestion can be safely rerun.

Recommended v1 assumption:

- The graph should be a served analytical representation, not the only source of truth. Raw and normalized data artifacts should exist outside the graph.

Current working decision:

- The graph is not the canonical source of truth.
- Raw and normalized datasets should remain outside the graph.
- The system should support saving graph snapshots for recordkeeping and comparison, even though the graph can be rebuilt from improved data later.

## 4. Evidence Model

Question:

- How explicit should provenance be in v1?

Why it matters:

- Evidence handling changes the data model, ingestion design, query patterns, and long-term credibility of the graph.

Recommended v1 assumption:

- Provenance is first-class. Important claims should be tied to evidence records with source metadata, retrieval date, and confidence.

Current working decision:

- Accepted. Provenance should be first-class from the beginning.

## 5. Temporal Model

Question:

- Is v1 a static snapshot or a time-aware graph?

Why it matters:

- Time handling influences schema design, loaders, and how future updates or historical comparisons will work.

Recommended v1 assumption:

- Use a lightweight temporal model from day one. At minimum, support `observed_at` and, where possible, `valid_from` and `valid_to`.

Current working decision:

- Accepted. V1 should be time-aware rather than purely static.

## 6. Modeling Granularity

Question:

- What is the minimum useful level of detail: company-only, company plus segment, or company plus facility for selected critical nodes?

Why it matters:

- This directly affects graph complexity, ingestion difficulty, and what kinds of risk analysis are actually possible.

Recommended v1 assumption:

- Company and segment modeling are mandatory. Facility modeling should be selective but real for the most critical nodes.

Current working decision:

- Company and segment modeling are mandatory.
- Facility modeling should be selective but real for critical nodes.
- Companies must be able to play multiple roles across the supply chain rather than being forced into a single segment.
- Relationship modeling should support richer semantics than a generic `SUPPLIES_TO` edge where data exist, including what is supplied and, when public evidence supports it, additional detail such as delivery form, route, or quantity.
- V1 should support this richer structure without assuming that all such detail will be available for all edges.

## 7. Manual Curation Versus Automation

Question:

- Should the architecture assume fully automated ingestion, or a hybrid workflow with manual review and curation?

Why it matters:

- Semiconductor dependency data are too incomplete for a fully automated truth pipeline. Manual curation affects storage design and workflow tooling.

Recommended v1 assumption:

- Human-in-the-loop curation is part of the core workflow, not an exception.

Current working decision:

- Accepted as the current working assumption.

## 8. Refresh Cadence

Question:

- Is this a one-time build, a periodically refreshed graph, or something closer to continuous monitoring?

Why it matters:

- This determines how repeatable the ingestion system needs to be and whether orchestration should be lightweight or more formal.

Recommended v1 assumption:

- V1 should support reproducible rebuilds and periodic refreshes, but not continuous real-time ingestion.

Current working decision:

- Accepted. Reproducible rebuilds are required.
- Monthly refreshes and snapshotting are the current working cadence for v1.

## 9. Analytics Execution Layer

Question:

- Which analyses should run in the graph engine versus in Python or another external analysis environment?

Why it matters:

- This affects graph database selection, modeling choices, and whether the project needs a stronger analytical data layer outside the graph.

Recommended v1 assumption:

- Use a hybrid model. Relationship-heavy traversals and graph algorithms should run against the graph; custom scoring, exploratory analysis, and presentation logic can run outside it.

Current working decision:

- Open question. This should remain undecided until the first serious analysis workflows are drafted.

## 10. Deployment Posture

Question:

- Should the first serious build be local-first or cloud-first?

Why it matters:

- This shapes infrastructure complexity, cost, onboarding friction, and how aggressively to optimize for production concerns.

Recommended v1 assumption:

- Stay local-first for the first serious build. Keep future cloud migration possible, but do not let it dominate current design choices.

Current working decision:

- Start local-first for speed and simplicity.
- Plan early for a hosted demo environment so other people can access and react to the prototype UI.
- Infrastructure should be simple in the style of an early startup: fast to ship, easy to change, and not hostile to future scaling.

## 10A. Foundation Versus Prototype Quality Bar

Question:

- Which parts of the system should be treated as durable foundations versus intentionally disposable prototypes?

Why it matters:

- This affects where to invest architectural care now and where speed should win.

Recommended v1 assumption:

- Treat the data pipeline and core data model as the more durable asset.
- Treat the first UI and presentation layer as a speed-first prototype that may be rebuilt later.

Current working decision:

- Accepted.
- The data pipeline should be designed carefully enough to support later growth if the project continues.
- The first UI should optimize for speed, feedback, and functionality without being reckless.
- V1 should avoid over-engineering for large-scale traffic or product complexity, but it should not take data-layer shortcuts that create preventable future rewrites.

## 11. Taxonomy Governance

Question:

- Should taxonomy be treated as a static enum list or as a versioned, governed asset?

Why it matters:

- Role codes, facility types, item categories, and predicate vocabularies directly shape normalization, extraction, and graph projection. If they drift informally, the future pipeline will become brittle.

Recommended v1 assumption:

- Treat taxonomy as a versioned asset from the beginning.

Current working decision:

- Accepted. The project should maintain a versioned internal taxonomy for roles, facilities, items, and predicates, with external standards used as bridge layers rather than as primary internal categories.

## 12. Source Operability Bias

Question:

- Should v1 optimize for maximum source coverage or for the most operationally reliable sources?

Why it matters:

- This shapes which adapters deserve investment and whether the future system is driven by stable APIs and feeds or by fragile portal harvesting.

Recommended v1 assumption:

- Bias strongly toward the most operable recurring sources first.

Current working decision:

- Accepted. V1 should privilege stable, structured disclosure feeds and regulator-backed facility anchors, while treating fragile portals and research-only sources as secondary or targeted.

## 13. Multilingual And OCR Support

Question:

- Is multilingual ingestion optional enrichment or a core design assumption?

Why it matters:

- Asia-heavy coverage introduces language, translation, and OCR concerns that can materially shape extraction, evidence handling, and review workflows.

Recommended v1 assumption:

- Multilingual ingestion should be treated as a core assumption for any serious Asia coverage.

Current working decision:

- Accepted. Original-language retention, selective translation, and OCR where needed should be assumed in later design work, even though the exact tooling remains open.

## Working Assumptions For Planning

Unless new requirements change them, the working assumptions for architectural planning should be:

- single-researcher or very small team workflow with demoability as a real requirement
- queryable graph plus notebooks or query packs plus a prototype visual UI
- raw and normalized datasets outside the graph, with graph snapshots supported
- first-class evidence and provenance
- lightweight temporal support from the start
- selective facility modeling rather than exhaustive facility coverage
- support for multi-role companies and richer dependency semantics
- taxonomy governance and versioning as a first-class requirement
- strong bias toward high-operability recurring sources
- multilingual ingestion and selective OCR or translation as planning assumptions
- hybrid automated ingestion and manual curation
- reproducible rebuilds and monthly refreshes
- analytics execution layer still open
- local-first development with an early hosted demo path
- a more durable data pipeline foundation than the first UI layer

## Decisions To Defer

These should stay open until the architectural drivers above are fixed enough to justify them:

- specific graph database selection
- exact Python package layout
- orchestration framework
- API and frontend choices
- deployment topology
- authentication and multi-user concerns
- alerting and monitoring design

## What These Drivers Imply

If the working assumptions above hold, the future architecture will probably need:

- a durable entity registry workflow
- a taxonomy management workflow
- a normalized evidence and claims layer
- a repeatable graph loading step
- a place for curated datasets outside the graph
- mixed source adapters across APIs, portals, and document pipelines
- an analysis surface for notebooks, query packs, or both
- a lightweight but shareable UI layer that can evolve faster than the pipeline foundation

That is enough to guide the next design steps without prematurely locking the final implementation.
