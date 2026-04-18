# Architecture Notes

This document captures what should guide the future architecture discussion without forcing decisions too early.

The immediate decision framework now lives in [ARCHITECTURAL_DRIVERS.md](ARCHITECTURAL_DRIVERS.md). This file should be read as the companion document that separates what needs to be decided now from what should remain deferred.

## Current Position

The project is not ready for a finalized implementation architecture yet.

That is deliberate. The architecture should be chosen after the v1 graph model, ingestion needs, and analysis workflows are concrete enough to justify real technical commitments.

## What We Already Know

- the project is graph-oriented
- evidence and provenance are mandatory
- temporal change matters
- the first useful version is limited enough to be tractable
- the eventual product potential is broader than the initial research build
- taxonomy will need to be versioned rather than treated as a fixed enum list
- Asia-heavy coverage requires multilingual and mixed-mode ingestion assumptions
- source operability and licensing should influence design as much as source richness
- the data pipeline should be treated as a more durable asset than the first UI layer

## Constraints The Future Architecture Should Respect

- support for graph-native querying and analysis
- clean ingestion from heterogeneous public sources
- room for manual curation where automation is not credible
- explicit handling of evidence, confidence, and time
- ability to evolve without a painful repo rewrite
- support for versioned taxonomies and bridge mappings to external standards
- support for multilingual evidence retention, translation traceability, and selective OCR
- support for multiple source adapter styles rather than a one-size-fits-all ingest model
- keep the durable data pipeline contracts cleaner and more future-proof than the prototype presentation layer

## Decisions Intentionally Deferred

- graph database selection
- ingestion orchestration stack
- storage format for raw and normalized datasets
- whether notebooks remain primary or move behind a package and pipeline layer
- API and frontend choices
- deployment topology
- long-term frontend architecture beyond what is needed for a hosted prototype

## Questions To Answer Before Locking Architecture

- What are the exact node and relationship types in the v1 graph?
- What data will be ingested repeatedly versus curated manually?
- What kinds of analytics should run directly on the graph versus outside it?
- How important is local-first development versus managed cloud infrastructure?
- How much temporal versioning is needed in v1?
- What level of product interactivity is realistic in the first serious build?
- Which recurring source spine should define the first serious ingestion build?
- What taxonomy versioning approach is sufficient for v1 without overbuilding?
- Which geographies deserve recurring adapters in v1 versus targeted or manual handling?

## Repo Strategy For Now

Keep the repository documentation-first and implementation-light until those questions are answered.

When code structure is introduced, it should be driven by:

- the entity registry workflow
- the taxonomy governance workflow
- the ingestion workflow
- the graph loading workflow
- the analysis and presentation workflow

That sequence is more likely to produce a clean architecture than guessing a large repo layout upfront.
