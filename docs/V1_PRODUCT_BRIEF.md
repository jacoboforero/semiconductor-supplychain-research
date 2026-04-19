# V1 Product Brief

This document captures the current product decisions for v1 in plain language.

It is intentionally closer to a PM brief than a technical design doc.

Status note:

- V1 remains the semantic and data-contract baseline.
- The next product-shell rebuild is now defined separately in [V2_PRODUCT_SPEC.md](V2_PRODUCT_SPEC.md) and [V2_FRONTEND_ARCHITECTURE.md](V2_FRONTEND_ARCHITECTURE.md).

The goal is to keep the project aligned on what the first version must do, what quality bar it needs to meet, and where speed is acceptable versus where durability matters.

## V1 Product Position

V1 is an evidence-backed semiconductor supply-chain research product with a demoable graphical UI.

It is being built primarily for a technical researcher workflow, but it must support early outside access to the UI so other people can explore it and give feedback.

The product is not trying to be a polished SaaS platform yet.

It is trying to become:

- a credible research asset
- a strong demo artifact
- a foundation for a more serious product if the project proves valuable

## What V1 Must Help Users Do

V1 should help a user:

- understand the semiconductor supply chain through visible company-to-company dependency flow and convergence
- see chokepoints across the chain
- see concentration by company, facility, and geography
- explore likely blast radius from disruption of important nodes

This means the product needs more than a bag of nodes and edges.

It needs:

- a coherent taxonomy
- intelligible relationship modeling
- a graphical experience that makes the structure understandable rather than merely visible

## Primary Visual Graph Requirement

The default product graph is not an ontology map of every entity type.

It should be a company-only dependency graph.

That means:

- visible graph nodes should be companies or organizations
- visible graph edges should primarily be evidence-backed dependency relationships
- stage should guide layout and convergence structure rather than appear as a competing visible node layer
- geography, role, company type, and facility information should appear as filters, badges, or detail-panel context after selection

The product goal is for a user to visually trace how upstream suppliers feed downstream manufacturing and where flows converge.

## Coverage Goal

The coverage goal is near end-to-end representation of the semiconductor supply chain as far as public data reasonably allow.

That means the company universe should favor strategic coverage across the chain over brand recognition or market-cap popularity.

V1 should intentionally include companies across:

- design and software
- front-end manufacturing
- back-end manufacturing
- wafers and substrates
- materials, chemicals, and gases
- manufacturing equipment
- masks and reticles

This does not imply complete global coverage.

It implies deliberate cross-stage coverage with a curated universe that is good enough to support meaningful risk analysis.

## Modeling Expectations

- Companies can occupy multiple roles.
- Facilities matter, but v1 should model them selectively rather than exhaustively.
- Relationships should be richer than generic supply links where evidence allows.
- Important claims should always carry provenance, time, and confidence.

## Source And Refresh Posture

- V1 is public-data-first.
- Paid data should be evaluated only after the public-data prototype shows where the real bottlenecks are.
- The product should refresh on a monthly cadence.

The current recurring source posture is:

- recurring disclosure ingestion: United States, South Korea, Japan, Thailand
- recurring facility grounding: United States, EU, Canada, Taiwan, South Korea
- targeted or manual handling: Hong Kong, Taiwan beyond core feeds, and China selectively

## Quality Bar: Foundation Versus Prototype

This project should use two different quality bars.

### 1. Data Pipeline Foundation

The data pipeline should be designed carefully enough that the project could build on it later if the product proves worth continuing.

That means the pipeline should optimize for:

- reproducibility
- clean data contracts
- separation of raw, normalized, and graph layers
- explicit evidence handling
- versioned taxonomy and mappings
- modular source adapters
- reasonable future scalability

This does not mean over-engineering for web-scale usage now.

It means avoiding shortcuts that would make the later evolution of the data system unnecessarily painful.

### 2. Prototype Product Surface

The first UI and prototype interaction layer should optimize for speed, functionality, and feedback velocity.

It should be:

- usable
- intuitive enough for outside viewers
- visually coherent
- fast to change

It does not need to be architected as a long-term production frontend.

It can be rebuilt later if the product direction hardens.

The current aesthetic direction can be preserved even if the graph semantics and visible hierarchy change.

The next major UI step should be treated as a parallel V2 rebuild rather than a long sequence of incremental V1 shell tweaks.

## Product Success Bar

V1 is successful if it can support a credible demo and useful analysis on a small number of concrete disruption scenarios.

Suggested default scenarios:

- Taiwan foundry disruption
- upstream material or specialty-gas chokepoint
- advanced packaging or OSAT bottleneck

## What This Means For Architecture

The architecture should reflect the product split above:

- the data pipeline should be treated as the more durable asset
- the graph should be a projection, not the system of record
- the prototype UI should be lightweight and replaceable
- the project should support hosted UI access early, even if much of the pipeline work remains local-first

## What Not To Optimize For Yet

- full automation of every difficult source
- complete global facility coverage
- precise supplier-customer coverage across the whole industry
- production-grade multi-tenant infrastructure
- frontend polish beyond what is needed for clear demos and user feedback
