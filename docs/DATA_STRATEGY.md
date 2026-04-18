# Data Strategy

## Core Principle

The graph should be built from evidence-backed facts and claims, not from unsupported guesses.

V1 should assume that public data are incomplete and design around that reality instead of pretending otherwise.

The current research also supports a stronger rule: the graph should be treated as a rebuildable projection of raw sources, normalized registries, and claim or evidence layers rather than as the only durable system of record.

## Data Layers

The most useful planning separation is:

- raw source archives
- normalized registries and crosswalks
- observations captured from sources
- claims derived from those observations
- graph projections built from normalized entities and claims

This distinction matters because it keeps provenance intact and makes future graph rebuilds possible.

## Data Classes

### Deterministic Facts

These are facts that can usually be represented with high confidence:

- company identity and aliases
- headquarters country
- public identifiers such as LEI, CIK, ticker, or Wikidata ID
- broad company role classifications
- owned subsidiaries where publicly documented
- facility locations where clearly disclosed

### Structured Proxies

These do not directly prove company-to-company supply relationships, but they help reveal structure:

- trade data
- country-level specialization
- public market maps
- known segment dependencies
- sanctions and export-control lists

### Evidence-Backed Claims

These are the most valuable and the most delicate:

- company A depends on company B
- company A supplies technology, equipment, or materials used by company B
- a facility is strategically important for a process, material, or node

Claims like these should carry provenance and confidence.

## Planning Distinction: Entities, Observations, And Claims

- Entities are the stable canonical things the system wants to reason about.
- Observations are source-bound statements or rows captured from documents, APIs, or datasets.
- Claims are normalized assertions built from one or more observations, with explicit evidence, time bounds, and confidence.

This is the most important conceptual input from the research and should guide later pipeline and schema design.

## Expected Public Source Types

- company annual reports, 10-Ks, 20-Fs, earnings materials, and investor presentations
- public identifier systems such as GLEIF and SEC EDGAR
- structured disclosure feeds such as OpenDART, EDINET, and other recurring exchange or regulator sources
- company facility pages and official announcements
- regulator-backed facility and industrial reporting sources such as PRTR and emissions registries
- sanctions, export-control, and policy sources
- public research reports and credible institutional analyses
- knowledge graph and metadata sources such as Wikidata

## Source Selection Principles

The research suggests a clear hierarchy:

- prefer recurring, structured, regulator-backed or exchange-backed sources
- use portal harvesting where necessary, but avoid building the core system around fragile crawlers
- treat industrial park and economic zone directories as facility proxies rather than definitive facility facts unless corroborated
- label sources by operability and by productization suitability, not just by informativeness

## Multilingual And Document Extraction Reality

For Asia-heavy coverage, the system should assume:

- original-language document retention
- selective translation with traceability
- OCR only where needed
- mixed ingestion modes across APIs, portals, and document-centric pipelines

This does not force an architecture decision yet, but it should shape future expectations about ingestion complexity.

## Taxonomy And Standards

The internal taxonomy should be semiconductor-specific and versioned.

External standards such as HS, HTS, NAICS, NACE, and ISIC are still useful, but primarily as bridge layers for joins to trade, statistical, or third-party datasets rather than as the canonical internal model.

## Evidence Requirements

Important nodes and relationships should be traceable to:

- source name
- source type
- URL or document reference
- retrieval date
- claim type
- confidence level

This should be treated as a first-class requirement, not an optional annotation.

## What To Avoid

- creating precise supplier-customer edges without support
- merging entities on fuzzy text alone
- encoding weak assumptions as hard facts
- optimizing for graph size over graph credibility

## Practical V1 Stance

V1 should be public-data-first, with room to add licensed or curated datasets later.

That means the graph should be useful with:

- strong entity resolution
- balanced segment coverage
- a modest number of facilities
- high-confidence dependency edges
- explicit uncertainty where needed
- source choices that remain operationally realistic for a small team
- a taxonomy and predicate vocabulary that can evolve without forcing a model rewrite

## Companion Documents

- [SOURCE_STRATEGY.md](SOURCE_STRATEGY.md)
- [V1_TAXONOMY.md](V1_TAXONOMY.md)
- [RESEARCH_SYNTHESIS.md](RESEARCH_SYNTHESIS.md)
