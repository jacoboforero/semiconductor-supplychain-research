# Source Strategy

This document captures the combined source strategy implied by the two research reports.

It is not an exhaustive catalog. It is a planning guide for how source selection should shape later system design.

## Guiding Principles

- Prefer stable, structured, repeatable sources over rich but fragile ones.
- Prefer regulator-backed or exchange-backed sources over marketing pages where possible.
- Separate source usefulness from source operability.
- Separate research usefulness from productization suitability.
- Treat licensing and reuse constraints as architecture inputs, not legal cleanup later.

## Source Classes

## 1. Identity And Corporate Structure

These sources help build and maintain the entity registry.

Core anchors:

- GLEIF LEI Level 1 and Level 2
- GLEIF deltas and reporting exceptions
- SEC EDGAR issuer metadata
- OpenCorporates crosswalks where useful
- selected national or regional registry APIs where operationally strong

Useful later:

- Singapore ACRA Business Profile API
- selected jurisdiction-specific corporate registries for targeted verification

## 2. Structured Disclosure Anchors

These are the highest-value recurring sources for evidence-backed claims.

Core anchors:

- SEC EDGAR
- OpenDART
- EDINET
- SET One Report Data

Conditional or targeted:

- TWSE MOPS push or bulk services if budget allows
- HKEXnews with RSS-driven capture

High-friction and targeted only:

- CNINFO
- exchange portals with weak structured access or unclear downstream rights

## 3. Facility Truth Anchors

These sources support facility existence, location, and operator grounding.

Core public anchors:

- EPA ECHO and FRS
- European Industrial Emissions Portal
- Canada NPRI
- Taiwan PRTR
- Korea PRTR

Secondary facility proxies:

- CHIPS award pages and related industrial policy disclosures
- industrial park and science park directories
- economic zone and industrial estate directories

Facility proxy sources are useful, but they should be treated as lower-confidence than regulator-backed facility records unless corroborated.

## 4. Restrictions And Policy Overlays

These sources support risk overlays and time-aware compliance reasoning.

Core anchors:

- BIS restricted-party and export-control lists
- OFAC sanctions feeds
- UK sanctions lists
- EU sanctions lists
- selected Asia export-control and end-user lists where relevant

These are strong recurring sources and should be treated as time-versioned overlays rather than optional enrichments.

## 5. Trade And Material Overlays

These support concentration and chokepoint analysis even when direct firm-to-firm edges are incomplete.

Core overlays:

- UN Comtrade
- USITC and Eurostat
- country trade statistics for selected Asia geographies
- USGS Mineral Commodity Summaries

Optional or paid:

- shipment-level trade intelligence vendors
- route-level shipping or AIS overlays

These are analytically useful, but large trade and transport datasets should stay outside the graph as raw or derived layers.

## 6. Technology And Capability Signals

These sources help with capability mapping and indirect evidence.

Useful sources:

- OpenAlex
- PatentsView
- J-PlatPat
- other jurisdictional patent systems where operationally reasonable

These should be used carefully as technology or capability evidence, not as primary supplier-customer truth.

## Operability Tiers

## Tier 1: Recurring Ingestion Anchors

These sources justify real adapters in v1 planning.

- SEC EDGAR
- GLEIF
- BIS / OFAC / UK / EU restriction feeds
- OpenDART
- EDINET
- SET One Report Data
- Taiwan PRTR
- Korea PRTR
- EPA / EU / Canada facility registries
- USGS materials overlays

## Tier 2: Hybrid Sources

These are useful, but they require partial automation and human review.

- HKEXnews and RSS-driven document capture
- TWSE MOPS if acquired
- science park, economic zone, and industrial estate directories
- OpenCorporates enrichment
- patents and publication systems

## Tier 3: Manual Or Research-Only Sources

These should not shape the core architecture unless later conditions change.

- CNINFO as a general crawler dependency
- captcha-heavy corporate registries
- sources with explicit personal or non-commercial constraints
- unstable “free” trade or shipping tools

## Productization Labels

Every important source should eventually be tagged in planning as one of:

- public and commercially safe
- licensable and commercially usable
- research-only or legally fragile

This distinction should affect how much the future system depends on a source.

## Geography Implications

The combined research suggests a practical geography posture for v1:

- strong recurring disclosure support: United States, South Korea, Japan, Thailand
- recurring facility grounding support: United States, EU, Canada, Taiwan, South Korea
- targeted disclosure capture: Hong Kong, Taiwan
- manual or selective verification: China, parts of Southeast Asia where registry quality or access is inconsistent

That does not mean those geographies are unimportant. It means the system should not assume equal source operability across them.

## Working Recommendation

If v1 needs to move fast without painting the project into a corner, the source strategy should start with:

- identity and ownership anchors
- structured disclosure anchors
- facility truth anchors
- restriction overlays
- a small number of trade and materials overlays

Only after those are working should the project lean harder into heavier portal harvesting, paid trade intelligence, or deeper OSINT.
