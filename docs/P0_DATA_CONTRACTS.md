# P0 Data Contracts

This document defines the first data-contract draft for the initial implementation slice.

It is the bridge between the planning docs and the first encoded schemas.

The contracts here are intentionally small.

They should support the first recurring source spine without overcommitting to a final storage or graph engine design.

## Purpose

The P0 contracts need to support five layers:

- raw source snapshots
- normalized registries
- observations
- claims
- graph projections

The graph is a projection of the layers above.

It is not the system of record.

## P0 Sources In Scope

- GLEIF LEI Level 1 and Level 2
- SEC EDGAR issuer metadata and filings
- OpenDART
- EPA ECHO and FRS
- Korea PRTR
- BIS restricted-party and export-control sources
- OFAC sanctions feeds
- USGS Mineral Commodity Summaries

## Core Principles

- Every important object must have a stable internal identifier.
- Every source-bound record must preserve provenance.
- Claims must be reconstructible from observations and evidence.
- Time must be explicit from the beginning.
- Manual review must be representable, not handled only outside the model.

## Contract Layers

## 1. Source Snapshot

Represents a retrieved source artifact or dataset version.

Required fields:

- `snapshot_id`
- `source_key`
- `source_type`
- `retrieved_at`
- `capture_method`
- `content_ref`
- `content_hash`

Optional fields:

- `source_url`
- `source_version`
- `notes`

Examples:

- a GLEIF golden-copy archive
- an EDGAR filing document
- an OpenDART response payload
- a BIS list snapshot
- a USGS report file

## 2. Evidence Record

Represents the exact source artifact or fragment used to support an observation or claim.

Required fields:

- `evidence_id`
- `snapshot_id`
- `evidence_type`
- `source_key`
- `retrieved_at`

Optional fields:

- `document_ref`
- `page_ref`
- `section_ref`
- `row_ref`
- `quote_text`
- `language`

Examples:

- a single 10-K section
- one OpenDART filing XML document
- one facility row from EPA FRS
- one entity row from OFAC

## 3. Company

Represents the canonical company registry record.

Required fields:

- `company_id`
- `canonical_name`
- `entity_type`
- `hq_country_code`
- `record_status`

Optional fields:

- `description`
- `website`
- `wikidata_id`
- `lei`
- `cik`
- `dart_corp_code`
- `jurisdiction_code`

Time fields:

- `observed_at`
- `valid_from`
- `valid_to`

Related child records:

- company names and aliases
- company identifiers
- company roles
- company ownership links

## 4. Facility

Represents a selectively modeled physical site.

Required fields:

- `facility_id`
- `facility_name`
- `facility_type`
- `country_code`
- `operator_company_id`
- `record_status`

Optional fields:

- `owner_company_id`
- `address_text`
- `latitude`
- `longitude`
- `facility_status`
- `regulatory_ids`

Time fields:

- `observed_at`
- `valid_from`
- `valid_to`

## 5. Observation

Represents a source-bound statement captured from one source artifact.

Required fields:

- `observation_id`
- `subject_type`
- `subject_id`
- `observation_type`
- `observed_value`
- `evidence_id`
- `observed_at`

Optional fields:

- `object_type`
- `object_id`
- `normalized_value`
- `unit`
- `notes`

Examples:

- company X uses alias Y
- filing Z mentions company X depends on silicon wafers
- facility row states operator name N at location L
- sanctions list row names entity E

## 6. Claim

Represents a normalized assertion derived from one or more observations.

Required fields:

- `claim_id`
- `claim_type`
- `subject_type`
- `subject_id`
- `predicate`
- `confidence`
- `claim_status`

Optional fields:

- `object_type`
- `object_id`
- `claim_value`
- `unit`
- `item_code`
- `stage_code`
- `valid_from`
- `valid_to`
- `review_status`
- `review_notes`

Required relationships:

- one or more supporting observations

Examples:

- company A has role `ROLE.FOUNDRY`
- company A has legal name `Taiwan Semiconductor Manufacturing Company Limited`
- company A operates facility F
- company A is subject to sanctions regime S
- company A depends on `GOOD.SILICON_WAFER`
- facility F is strategically important for stage `STAGE.WAFER_FAB`

## 7. Graph Projection Records

These are the nodes and edges loaded into the graph from the layers above.

### Initial Node Types

- `Company`
- `Facility`
- `Country`
- `MaterialOrItemCategory`
- `PolicyEntity`

### Initial Edge Types

- `HAS_ROLE`
- `OPERATES_FACILITY`
- `LOCATED_IN`
- `HAS_CLAIM`
- `SUBJECT_TO_RESTRICTION`
- `DEPENDS_ON_ITEM`
- `RELATED_TO_POLICY_ENTITY`

The graph should preserve references back to:

- `claim_id`
- `confidence`
- `valid_from`
- `valid_to`
- `evidence_count`

## Manual Review Support

The contracts must support review and adjudication directly.

The minimum fields to support this are:

- `record_status`
- `claim_status`
- `review_status`
- `review_notes`
- `matched_by`
- `match_confidence`

This prevents manual review from becoming an invisible side process.

## P0 Source Mapping

### GLEIF

Primary uses:

- company identifiers
- canonical names
- ownership scaffolding

Primary contract targets:

- `Company`
- company identifiers
- ownership observations and claims

### SEC EDGAR

Primary uses:

- issuer metadata
- filings as evidence
- disclosure-derived observations and claims

Primary contract targets:

- `Source Snapshot`
- `Evidence Record`
- `Company`
- `Observation`
- `Claim`

### OpenDART

Primary uses:

- issuer metadata
- filings
- Asia disclosure-backed observations and claims

Primary contract targets:

- `Source Snapshot`
- `Evidence Record`
- `Company`
- `Observation`
- `Claim`

### EPA ECHO and FRS

Primary uses:

- facility grounding
- operator matching
- site metadata

Primary contract targets:

- `Facility`
- `Observation`
- `Claim`

### Korea PRTR

Primary uses:

- Asia facility grounding
- chemical and facility context

Primary contract targets:

- `Facility`
- `Observation`
- `Claim`

### BIS and OFAC

Primary uses:

- policy overlays
- restricted-party and sanctions observations

Primary contract targets:

- `Source Snapshot`
- `Evidence Record`
- `Observation`
- `Claim`
- `PolicyEntity`

### USGS Mineral Commodity Summaries

Primary uses:

- upstream concentration overlay
- material importance context

Primary contract targets:

- `Source Snapshot`
- `Evidence Record`
- `Observation`
- material dependency or concentration claims

## Example Flow

One example path through the system:

1. Store an EDGAR filing as a `Source Snapshot`.
2. Capture a relevant section as an `Evidence Record`.
3. Extract a source-bound statement as an `Observation`.
4. Normalize that into a typed `Claim`.
5. Load the claim into the graph as an edge with provenance references.

## What Gets Encoded Next

The first encoded schemas should live under `contracts/p0/` and start with:

- `company`
- `facility`
- `evidence`
- `observation`
- `claim`
- `graph_projection_manifest`

The first implementation work should encode only the minimum required fields from this document.
