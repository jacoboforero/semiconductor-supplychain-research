# P0 Source Spine

Date: 2026-04-17

Status: accepted

## Decision

The first serious implementation slice should use this P0 source spine:

- identity and issuer registry:
  - GLEIF LEI Level 1 and Level 2
  - SEC EDGAR issuer metadata
- disclosure and evidence:
  - SEC EDGAR filings
  - OpenDART
- facility grounding:
  - EPA ECHO and FRS
  - Korea PRTR
- policy and restrictions overlays:
  - BIS restricted-party and export-control sources
  - OFAC sanctions feeds
- upstream concentration overlay:
  - USGS Mineral Commodity Summaries

## Why This Slice

This source mix is the smallest public-data slice that still exercises the full intended system shape:

- cross-border company identity
- structured disclosure ingestion
- facility grounding
- evidence-backed claim creation
- policy overlays
- upstream chokepoint overlays

It is broad enough to validate the end-to-end model, but narrow enough to build cleanly.

## Why These Sources Were Chosen

### GLEIF + SEC EDGAR

This pair gives the first credible identity and issuer backbone.

- GLEIF gives cross-border identifiers and ownership scaffolding.
- EDGAR gives strong issuer metadata and filing provenance for U.S.-listed or SEC-filing companies.

### EDGAR + OpenDART

This pair gives a high-operability disclosure base across two important regions with strong structured access.

- EDGAR is the default U.S. disclosure anchor.
- OpenDART is one of the best structured disclosure systems in Asia and keeps the first recurring Asia slice public and operable.

### EPA ECHO/FRS + Korea PRTR

This pair gives a realistic first facility layer without depending on paid sources.

- EPA ECHO/FRS gives a strong U.S. facility validation path.
- Korea PRTR pairs naturally with OpenDART and extends the facility model into Asia using a regulator-backed source.

## Why Korea PRTR Instead Of Taiwan PRTR In P0

Taiwan is strategically critical and remains high priority.

It is not excluded from v1.

It is being deferred from P0 because:

- OpenDART plus Korea PRTR creates a cleaner public recurring disclosure-plus-facility pairing in one geography
- Taiwan disclosure ingestion becomes much more attractive if TWSE MOPS push or bulk access is acquired
- Korea gives a better first public slice for validating the recurring adapter pattern end to end

Taiwan PRTR should be treated as the leading P1 expansion candidate.

## Why BIS + OFAC

These overlays provide immediate time-aware policy and compliance value without major modeling complexity.

They also force the pipeline to handle:

- snapshots
- diffs over time
- alias-heavy entity matching

## Why USGS Mineral Commodity Summaries

USGS provides a credible upstream concentration overlay without requiring a full mining-company registry in the first build.

That fits the v1 goal of near end-to-end coverage without pretending public data can fully map every upstream firm-to-firm tie.

## Explicitly Deferred From P0

These remain important, but are not part of the first serious build slice:

- EDINET
- SET One Report Data
- Taiwan PRTR
- TWSE MOPS
- HKEX RSS capture
- EU and Canada facility registries
- shipment-level trade intelligence vendors
- CNINFO and other high-friction crawler dependencies

## Expected P0 Outputs

The P0 source spine should be sufficient to produce:

- the first canonical company registry records
- the first facility registry records
- evidence records tied to filings and source artifacts
- typed observations and claims
- the first graph projection for companies, facilities, and selected policy entities

## Follow-Up

After the P0 slice is working, the next most likely expansions are:

1. Taiwan PRTR
2. EDINET
3. SET One Report Data
4. EU and Canada facility registries
