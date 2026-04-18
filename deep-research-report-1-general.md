# Semiconductor Supply Chain Data Research Report

## Executive Summary and Key Takeaways

### Executive Summary

Building a high-quality, evidence-backed semiconductor supply‑chain risk graph in 2026 is primarily a **data acquisition + normalization + claim/provenance** challenge—not a “find one perfect dataset” challenge. The best strategy is to treat the graph as a **rebuildable projection** of (a) raw source archives and (b) normalized registries and claim tables, with **provenance and time-awareness as first-class fields**.

The highest-leverage approach for a small team is to combine:

- **Deterministic identity and corporate structure** sources (LEIs, filings, corporate registries) to prevent downstream ambiguity and duplication.
- **Facility discovery and facility attributes** from a blend of industry datasets (paid) and high-signal public “industrial footprint” proxies (environmental compliance databases, industrial emissions registries, subsidy award pages, and geospatial OSINT).
- **Relationship evidence** from two parallel tracks:
  - **Disclosed relationships** (filings, investor materials, press releases, official award documentation).
  - **Proxy relationships** (trade/shipment data, import/export aggregates, patents/research links, and industrial-input signals), clearly marked as inferred/proxy with confidence scores.
- **Restrictions and policy constraints** (sanctions/export control lists) as structured, time-versioned datasets that can be joined to entities and transactions.

The practical constraint is that **direct supplier–customer relationships at component-level (e.g., “Company A supplies X nm wafers to Company B”) are often not public**. You will win by building a system that supports **graded evidence**: from “directly disclosed” to “strong proxy” to “weak heuristic,” and by recording *exactly why* you believe an edge exists.

### Key Takeaways For This Project

Your v1 (~200 companies) should optimize for: **(1) identity correctness**, **(2) facility correctness for the small set of critical sites**, and **(3) evidence-backed, typed dependencies** (not generic `SUPPLIES_TO`).

Two implementation pivots are especially important:

- Treat *relationships* as **claims** with evidence and time bounds, not as singular facts. This aligns with the reality that many relationships are partial, outdated, or probabilistic.
- Build a **canonical entity registry** early (companies + facilities + identifiers + aliases + ownership links). This reduces wasted effort later when you ingest more sources.

A non-obvious but highly valuable tactic is to use **industrial regulatory datasets** as “facility truthiness amplifiers.” In multiple jurisdictions, environmental and industrial emissions registries can confirm that a site exists, where it is, who operates it, and sometimes what processes/chemicals are involved—useful for validating and enriching fab/materials facilities. Examples include EPA facility datasets and downloads that integrate multiple program databases (including latitude/longitude and industry codes)citeturn2search37turn19search11, the European Industrial Emissions Portal industrial reporting dataset with location/administrative data for large industrial complexesciteturn15search0turn15search7, and Canada’s NPRI which tracks pollutants from thousands of facilities and offers downloadable reviewed dataciteturn15search5turn15search20.

## Source Landscape

The table below focuses on sources that materially improve **identity resolution, facility modeling, dependency/evidence claims, trade proxies, and restrictions**, with explicit notes on access and productization risk.

> Legend for “Cost level”: **Free**, **Low** (hundreds/yr), **Medium** (low thousands/yr), **High** (mid/high thousands per user/yr), **Enterprise** (priced on request; often five+ figures/yr).

| Source | Category | Public/Paid | Access Method | Coverage Level | Update Cadence | Strengths | Weaknesses | Licensing / TOS Risk | V1 Utility | Future Product Utility | Notes |
|---|---|---:|---|---|---|---|---|---|---:|---:|---|
| SEC EDGAR data.sec.gov APIs | Filings + issuer metadata | Public | API + nightly bulk ZIP | Company + document | Updated throughout day; nightly bulk ZIPciteturn18view0 | Real-time filing ingest; issuer metadata includes names/former names and tickers; XBRL APIs reduce parsing burdenciteturn18view0 | US-centric; many supplier details are narrative; requires text extraction & interpretation | Low (public; but must be polite with rate limits) | High | High | Strong backbone for disclosed relationships, risk factors, significant customers, subsidiaries lists |
| GLEIF LEI Golden Copy + Delta Files | Entity resolution + identifiers | Public | Bulk download (golden copy + deltas) | Company/legal entity | Daily golden copy + deltasciteturn18view1 | High-quality identifiers; reduces ambiguity; deltas support incremental refreshciteturn18view1 | Not all companies have LEIs; coverage varies by region/sector | Low (open data) | High | High | Consider anchoring canonical registry on LEI where available |
| GLEIF Level 2 “Who Owns Whom” | Ownership / parent relationships | Public | Bulk download + CDF formats | Company/legal entity | Included in daily files; structured formatsciteturn17search1turn18view1 | Direct & ultimate accounting consolidating parent relationships for LEI holdersciteturn17search1 | “Accounting consolidating” ≠ ultimate beneficial owner; many exceptions | Low | Medium | High | Treat as corporate-structure evidence, not ground-truth beneficial ownership |
| GLEIF Reporting Exceptions (Level 2) | Ownership coverage gaps | Public | Bulk download | Company/legal entity | Daily file availableciteturn17search8turn17search7 | Explicitly records why parent info is missing (no parent, opt-out, no LEI for parent, etc.)citeturn17search8 | Not a relationship; needs careful modeling | Low | Medium | High | Useful for confidence scoring / completeness flags |
| GLEIF OpenCorporates ID-to-LEI mapping | Crosswalk (registry ↔ LEI) | Public | CSV download | Company/legal entity | Bi-weekly updatesciteturn17search2 | Bridges legal-entity registry IDs to LEIs; reduces matching cost | Limited to mapped population; depends on OpenCorporates IDs | Low | High | High | High leverage for entity resolution if you use OpenCorporates as a registry layer |
| entity["company","OpenCorporates","company registry platform"] | Corporate registry + subsidiaries/filings pointers | Public + Paid tiers | API + paid plans | Company/legal entity | Varies; depends on jurisdiction feeds | Broad registry reach; pricing and share-alike vs non-share-alike options disclosedciteturn5search4turn5search8 | Bulk access/paywalls; some jurisdictions charge high fees for bulk company data (fragmentation)citeturn5search28 | Medium–High for product (share-alike keys; commercial licensing)citeturn5search4 | Medium | High | Use as “registry enrichment,” not sole source of truth |
| entity["organization","Companies House","uk corporate registry"] | Corporate registry | Public | API + free bulk downloads | Company/legal entity | Live API; bulk snapshots monthly (compiled end of prior month)citeturn5search5turn5search21 | Strong UK coverage; free bulk snapshot cadence is predictableciteturn5search21 | UK-only; bulk formats and document APIs can be operationally finicky at scale | Low | Medium | Medium | Useful for UK-incorporated subsidiaries of global semiconductor firms |
| entity["organization","OpenFIGI","financial identifier mapping"] | Market identifier mapping | Public | API (no bulk flat files) | Company/security identifiers | Continuous | Maps third-party security identifiers to FIGIs via free public API; bulk mapping via API describedciteturn5search3turn5search7 | Focused on financial instruments, not legal entities; entity resolution still required | Medium (TOS; designed for mapping, not full “mastering”)citeturn5search15 | Low–Medium | Medium | Helpful when joining to market/issuer datasets via tickers/ISIN-like IDs |
| entity["organization","UN Comtrade","un trade database"] | Trade (macro import/export) | Public (with constraints) | API + bulk options | Country/product | Regularly updated (varies by reporter) | Global trade flows by product category; good for chokepoint import dependence proxies | HS aggregation loses firm-level detail; reporting lags vary by country | Medium (terms + rate limits; not always “productizable”) | Medium | Medium | Use for country-level chokepoints and substitution constraints |
| entity["organization","U.S. International Trade Commission DataWeb","us trade data portal"] | Trade (US detailed trade data) | Public (registration may apply) | Web/API | Country/product | Regular | High-quality US trade stats; complements UN Comtrade | Not firm-level; HS/HTS mapping complexity | Low | Medium | Medium | Pair with bill-of-lading sources when budget allows |
| entity["organization","Eurostat","eu statistics office"] | Trade (EU) + classifications | Public | API/download | Country/product | Regular | EU trade statistics and EU classification context | Not firm-level; EU-specific structures | Low | Medium | Medium | Use for EU chokepoints and EU supply-chain concentration indicators |
| entity["organization","World Customs Organization","customs standards body"] | Product classification backbone | Mixed | Standard reference | Product taxonomy | HS updates by edition; HS 2022 is global standardciteturn12search7turn12search11 | HS is a global lingua franca for goods classificationciteturn12search7 | Full explanatory notes often paywalled; HS granularity insufficient for semicon specifics | Medium | Medium | High | Use HS/HTS as a *linking layer* to trade proxies and customs datasets |
| entity["organization","U.S. Census Bureau","us statistics agency"] | Industry classification backbone | Public | Reference files | Company role proxy | Updates periodically | Official NAICS references and tools are availableciteturn12search0 | NAICS is too coarse for semicon roles; firms span multiple NAICS codes | Low | Medium | Medium | Use NAICS/ISIC/NACE as “outer shell,” then custom semicon taxonomy inside |
| entity["organization","United Nations Statistics Division","un statistics division"] | Industry classification backbone | Public | PDF | Company role proxy | Stable | ISIC Rev.4 is a global activity classification referenceciteturn12search2turn12search6 | Coarse; mapping required | Low | Medium | Medium | Helpful for international harmonization when NAICS/NACE differ |
| entity["organization","European Commission","eu executive body"] | Sanctions + law gateway | Public | Web + datasets | Entity/country/policy | Frequent | EU sanctions overview notes consolidated financial sanctions list and reliance on official journal gateway (EUR-Lex)citeturn4search26 | Bulk access may require account/token workflows for some files | Medium | Medium | High | Treat sanctions/legal acts as time-versioned “regulatory facts” |
| entity["organization","UK Foreign, Commonwealth & Development Office","uk foreign office"] | Sanctions list | Public | Downloads (XML/CSV/XLSX) | Entity/person | Updates as designations change | UK sanctions list is now the sole current official UK sanctions designations source (post Jan 28, 2026 change)citeturn3search12 | Frequent changes; needs snapshotting | Low–Medium | Medium | High | Critical for risk graph compliance overlays |
| entity["organization","United Nations Security Council","un security council"] | Sanctions list | Public | Download (XML/HTML etc.) | Entity/person | Updated frequently (explicit “last updated” shown)citeturn4search20 | Authoritative multilateral sanctions list | Narrow scope (sanctions only) | Low | Medium | Medium | Useful for compliance flags and geopolitical risk overlays |
| entity["organization","U.S. Department of the Treasury","us treasury"] | Sanctions (OFAC) | Public | Sanctions List Service (download) | Entity/person | Frequentciteturn3search27 | Official source for SDN + consolidated lists; usable for automated syncciteturn3search27 | Must engineer your own matching; list-only coverage | Medium | Medium | High | Treat list entries as entities to be resolved against company registry |
| entity["organization","U.S. Department of Commerce Bureau of Industry and Security","us export controls bureau"] | Export controls restricted parties | Public | Downloads (CSV/TXT) + consolidated feeds | Entity/person | Frequent | BIS describes CSL and key restricted party lists (Entity List, Denied Persons, Unverified, MEU) and provides download linksciteturn18view3 | Due diligence is non-trivial; list changes require careful time-tracking | Medium | High | High | Core for export-control overlays in semiconductor supply chains |
| entity["organization","NIST CHIPS for America","us chips program info"] | Subsidy awards + facility projects | Public | Web pages | Facility/project/company | Updates with awards | Public pages name recipients, locations, and project summariesciteturn3search3turn8search25 | Not a global dataset; US program-specific | Low | High | Medium | Strong for facility-level modeling of US investments and materials (e.g., polysilicon) |
| entity["organization","U.S. Geological Survey","us earth science agency"] | Critical materials & chokepoint indicators | Public | PDFs + data releases | Country/material | Annual (MCS) + data releases | Mineral Commodity Summaries cover >90 minerals and include world production, import reliance contextciteturn8search1turn8search11 | Minerals focus; not company-level | Low | Medium | Medium | Use for upstream chokepoints (gallium, germanium, rare gases, etc.) |
| entity["organization","SEMI","semiconductor industry association"] | Fab & equipment market data (industry) | Paid | Subscription + single editions | Facility + market | Frequent product updates; product-specific | World Fab Forecast claims coverage of >1,600 facilities and future linesciteturn13search0 | Paid; licensing constraints for redistribution | High | High | High | Best single “unlock” for facility-level fab coverage if budget permits |
| entity["organization","Semiconductor Industry Association","us semiconductor trade group"] | Market data pointers | Mixed | Web pointers | Market | Periodic | Provides context on market data sources (e.g., WSTS monthly shipments)citeturn13search23 | Not a facility/relationship dataset itself | Low | Low | Medium | Useful as metadata and navigation, not as core ingest |
| entity["organization","World Semiconductor Trade Statistics","semiconductor market org"] | Market shipments (macro) | Paid (often) | Subscription | Market | Monthly | Monthly shipments/ASP/product/regional breakouts referencedciteturn13search23 | Not supply chain relationships; mostly market stats | Medium | Low | Medium | Use for market context and stress-testing concentration narratives |
| entity["company","FactSet","financial data vendor"] | Supply chain relationships (disclosed) | Paid | API / marketplace feeds | Company↔company | Vendor-managed | Supply chain relationships dataset exposes interconnections among global companiesciteturn16search0turn16search27 | Disclosed relationship bias; licensing limits | High | Medium–High | High | Strong later-stage accelerator; still needs provenance modeling |
| entity["company","Bloomberg","financial data vendor"] | Supply chain relationships (disclosed + curated) | Paid | Terminal datasets | Company↔company | Vendor-managed | Positions supply chain data and tools for multi-tier risk analysisciteturn16search1turn16search9 | Expensive; productization constraints; terminal access model | High | Medium | High | Great for research speed; harder for product resale |
| entity["company","S&P Global","financial data vendor"] | Trade + relationships | Paid | Platform + datasets | Company↔company + shipments | Vendor-managed | Panjiva claims billions of shipment records and company-to-company relationshipsciteturn7search2turn7search8 | Export controls on redistribution; data licensing is central risk | High | High | High | Likely best paid “trade + ER” backbone if budget allows |
| entity["company","Panjiva","trade data platform"] | Shipment-level trade proxy | Paid | Platform + dataset feeds | Shipment/company | Frequent | Vendor cites >2B shipment records and multi-country sourcesciteturn7search2turn6search21 | Coverage differs by country; commodity descriptions messy | High | High | High | Use to infer supplier relationships (proxy) with explicit confidence rules |
| entity["company","ImportGenius","trade data vendor"] | Shipment-level trade proxy | Paid (some tiers) | Platform | Shipment/company | Daily updates claimedciteturn6search10turn6search2 | Bill-of-lading level access; concrete proxy edges | Licensing; coverage varies; not “open” | High | Medium | Medium | Useful for v1 research, but licensing can block product use |
| entity["company","Descartes Datamyne","trade data vendor"] | Shipment-level trade proxy | Paid | Platform | Shipment/company | Daily refresh claimsciteturn6search3turn6search7 | Strong US maritime import/export BOL framing; operational detail (ports, parties)citeturn6search3 | Expensive; licensing; only certain modes/countries | High | Medium | High | Great for routing/logistics proxies (where allowed) |
| entity["company","ImportYeti","trade search tool"] | Low-cost shipment proxy | Public (tool) + API beta | Web + beta API | Shipment/company | Not guaranteed | Provides “free” search and beta API docsciteturn7search0turn7search3 | Terms can change; productization risk; confidentiality/coverage gaps appear in UIciteturn7search26 | High for exploration | Low | Low | Good “discovery” tool; treat as non-product research input unless licensed |
| entity["organization","Marine Cadastre","us vessel traffic data hub"] | Shipping routes proxy | Public | Downloads | Route/vessel | Ongoing | NOAA tool lets users download AIS vessel traffic data by geography/timeciteturn6search0turn6search8 | Not linked to cargo or companies; only route-level | Low | Low–Medium | Medium | Useful for chokepoint route stress tests (ports/straits), not supplier inference alone |
| entity["organization","U.S. Environmental Protection Agency","us environmental regulator"] | Facility registry + compliance data | Public | Bulk downloads + datasets | Facility/site | Regular updates; some weekly | Facility Registry System and ECHO downloads include facility types, industry codes, and lat/long; integrate multiple programsciteturn2search37turn19search11turn19search31 | US-only; mapping facility↔company still work; not semicon-specific | Low | High for US facility validation | Medium | Non-obvious “facility ground truth” source for fabs/material plants in US |
| entity["organization","European Environment Agency","eu environment agency"] | Industrial facility dataset | Public | Download datasets | Facility/site | Regular | Industrial reporting dataset includes location/administrative data for large industrial complexesciteturn15search0turn15search7 | Europe-only; reporting thresholds; needs mapping to semicon sites | Low | Medium | Medium | Strong facility validation + emissions/energy attributes for some sites |
| entity["organization","Environment and Climate Change Canada","canada environment agency"] | Industrial facility dataset | Public | Download reviewed data | Facility/site | Annual reviewed datasets | NPRI tracks pollutants for thousands of facilities; downloadable reviewed dataciteturn15search5turn15search20 | Canada-only; mapping to semicon roles non-trivial | Low | Medium | Medium | Facility confirmation + signals for chemicals/material operations |
| entity["organization","European Chemicals Agency","eu chemicals regulator"] | Chemicals / materials knowledge | Public | Public chemical database | Substance | Ongoing | Public “ECHA CHEM” database aggregates REACH registrations and regulatory listsciteturn19search2 | Not a supply chain map; extracting structured “who uses what” is hard | Medium | Low–Medium | Medium | Useful for materials/chemicals vocabulary and regulatory context |
| entity["organization","PatentsView","uspto patent data interface"] | Patents for technology relationships | Public | API | Patent/assignee | Regular | Disambiguated patent data access via API is widely usedciteturn2search38turn2search38 | Patent→supply chain inference is indirect; assignee resolution required | Low | Medium | Medium | Use for “technology capability edges,” not direct supply edges |
| entity["organization","European Patent Office","european patent authority"] | Patents (global-ish) | Public | OPS API | Patent | Ongoing | EPO OPS provides programmatic access to EPO patent data (free access described in documentation)citeturn2search35 | Requires integration effort; coverage and terms must be followed | Medium | Medium | Medium | Good for cross-checking patent families and assignee footprint |
| entity["organization","World Intellectual Property Organization","un ip agency"] | Patents (PCT) | Public | PATENTSCOPE | Patent | Ongoing | PCT/patent family discovery supports technology capability mapping | Indirect for supply chain | Medium | Low–Medium | Medium | Complements PatentsView/EPO for global coverage |
| entity["organization","OpenAlex","open scholarly metadata"] | Research publications + affiliations | Public | API + data dump | Document/org/topic | Open, CC0 dataset | OpenAlex provides free CC0 dataset and API for scholarly metadataciteturn10search0turn10search4 | Papers are not shipments; affiliation resolution still hard | Low | Medium | Medium | Strong for linking companies to technology domains and partnerships |
| entity["organization","Crossref","doi registration agency"] | Publication metadata (DOIs) | Public + paid service tiers | API (“polite pool” via mailto) | Document | Ongoing | Polite pool guidance and pools/rate limits explicitly describedciteturn10search13turn10search9 | Not semicon-specific; mainly scholarly metadata | Low | Low–Medium | Medium | Useful for grounding research claims and citations at scale |
| entity["organization","Research Organization Registry","research org identifiers"] | Organization disambiguation | Public | API + data dump | Organization | Monthly releasesciteturn10search2 | CC0 org identifiers for research institutions; useful for R&D ecosystem mappingciteturn10search2 | Not a legal-entity register; not company-focused | Low | Low | Medium | Helpful for modeling labs/universities in advanced versions |
| entity["organization","Copernicus Data Space Ecosystem","eu earth observation platform"] | Remote sensing OSINT | Public | APIs + cloud tooling | Geospatial | Ongoing; platform established 2023 | Provides free access to Sentinel and other Earth observation data and APIsciteturn11search0turn11search17 | Requires geospatial expertise; inference not “ground truth” | Low | Medium | Medium | Useful for facility validation (construction progress, land use change) |
| entity["company","Google","technology company"] | Remote sensing (Earth Engine) | Mixed | Platform | Geospatial | Ongoing | Earth Engine terms restrict free edition to non-commercial/research activitiesciteturn11search2turn11search33 | Productization blocker if you rely on free edition; licensing and approvals needed | High | Low | Medium | Treat as prototyping tool unless you formalize commercial terms |
| entity["organization","OpenStreetMap","open mapping project"] | Geocoding + base map | Public | Overpass/self-host | Geography | Continuous | OSM data is under ODbL (share-alike)citeturn9search1turn9search5 and Overpass provides read-only query accessciteturn9search4 | Share-alike can complicate proprietary products; public Overpass reliability/fair-use limits | Medium–High | Medium | Medium | Best used as geospatial reference layer; consider commercial geocoders for product |
| entity["organization","Natural Earth","public domain map dataset"] | Geography reference | Public | Bulk downloads | Geography | As needed | Public domain map datasetciteturn9search2turn9search26 | Not facility-level | Low | Low | Medium | Great for country/province boundaries and standardized geography keys |
| entity["organization","GeoNames","geographic names database"] | Place normalization | Public (CC-BY) + paid services | API + downloads | Geography | Ongoing | CC-BY licensed; commercial usage allowed with attributionciteturn9search19turn9search3 | Attribution obligations; free tier not ideal for mission-critical useciteturn9search3 | Medium | Low | Medium | Useful for place name disambiguation and alternate names |

### Short interpretive notes on the table

- In 2026, **SEMI’s World Fab Forecast** stands out as the most direct path to a broad facility footprint (coverage claims include >1,600 facilities and future lines)citeturn13search0, but it is paid and redistribution terms can constrain product plans.
- For a small team, **industrial regulatory datasets** (EPA facility datasets; European industrial reporting dataset; Canada NPRI) are unusually high-leverage because they provide facility coordinates and operator context with relatively stable public accessciteturn19search11turn15search0turn15search5.
- **Shipment-level trade** is the best widely-available proxy for firm-level supply relationships, but it is where **licensing/productization risk is highest** (Panjiva, ImportGenius, Datamyne are commercial; “free” tools like ImportYeti can shift terms or coverage)citeturn7search2turn6search2turn6search7turn7search1.

## Non-Obvious Findings

### Industrial environmental and emissions registries are a hidden “facility truth layer”

If you only rely on company websites and industry reports, facility-level modeling becomes brittle: sites get renamed, rebranded, reorganized, or described differently across documents. Environmental compliance and industrial emissions registries often provide a more stable “site identity layer” because regulators need consistent facility identifiers and coordinates.

Three especially valuable examples:

- In the U.S., EPA **ECHO data downloads** describe integrated compliance and enforcement information for regulated facilities and include latitude/longitude when availableciteturn19search11turn2search32. The EPA **Facility Registry Service (FRS)** provides state CSV downloads of facilities and sites within the FRS systemciteturn2search37, and EPA also offers geospatial download services for FRS facilities with lat/long (often updated weekly)citeturn19search31.
- In Europe, the **European Industrial Emissions Portal** provides downloadable datasets; the “industrial reporting dataset” includes location and administrative data for large industrial complexes and additional environmental attributesciteturn15search0turn15search7.
- In Canada, the **National Pollutant Release Inventory (NPRI)** is a public inventory tracking pollutant releases/disposals/transfers and explicitly notes tracking of over 300 pollutants across thousands of facilities; reviewed data can be downloadedciteturn15search5turn15search20.

Why this matters for semiconductors: fabs and materials plants can have distinctive chemical/environmental signatures (even if you do not model chemicals directly), and these datasets can validate that “a real industrial site exists here, operated by this entity,” which is foundational for risk analysis.

### Subsidy award pages can bootstrap high-value facility nodes faster than fab lists

Government subsidy programs often publish **project-level details**: recipient, location, sometimes a facility description, and funding amounts. For the U.S., “CHIPS for America Awards” pages provide project summaries and locations for awardeesciteturn3search3turn8search25. This can seed your facility registry with **high-impact, policy-relevant nodes** (leading-edge fabs, advanced packaging, critical materials) without first buying comprehensive private datasets.

### Mineral and industrial input datasets help identify upstream chokepoints without private contracts

Upstream chokepoints (gases, gallium, germanium, polysilicon, etc.) are often missed if you only model companies in “classic semiconductor lists.” The **USGS Mineral Commodity Summaries** provide annual, structured coverage of more than 90 minerals and include world production, import reliance context, and industry structure notesciteturn8search1turn8search11. Specific commodity sheets explicitly link materials to semiconductor uses (e.g., gallium for compound semiconductors, rare gases for semiconductor manufacturing equipment)citeturn8search0turn8search3.

This supports a v1 “upstream chokepoint overlay” even if you do not model every mining/refining firm, by representing **country/material concentration** as attributes and risks.

### Remote sensing is best used for “facility existence + change detection,” not for guessing customers

Earth observation data is an underused validation channel: a solo researcher can detect whether a facility is under construction, expanding, or dormant, especially when paired with known coordinates. The **Copernicus Data Space Ecosystem** provides free access to Sentinel mission data and APIsciteturn11search0turn11search17, and Copernicus data policy emphasizes free, full, open access for the vast majority of delivered data/informationciteturn11search4.

However, there is a caution: if you rely heavily on tools constrained to non-commercial use during prototyping, you can paint yourself into a corner for productization. For example, **Google Earth Engine** terms restrict the free service to non-commercial or government research activities and prohibit sustained commercial use in the free editionciteturn11search2turn11search33turn11search18.

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["Copernicus Sentinel-2 satellite imagery industrial site example","semiconductor fab construction aerial view","advanced semiconductor packaging facility aerial view","container port aerial view shipping logistics"],"num_per_query":1}

### “Trade data” is not one thing—separate macro statistics from shipment-level manifests

A common failure mode is mixing:
- **Macro trade statistics** (e.g., UN Comtrade / USITC / Eurostat): great for country-level dependencies, weak for firm-level edges.
- **Shipment-level records** (bills of lading): strong for firm-level proxy edges, but messy and license-sensitive.

Shipment-level sources (Panjiva, ImportGenius, Datamyne) provide the most direct scalable proxy for “who ships what to whom,” but they require careful normalization of parties, commodities, and time, plus explicit confidence logic and legal/licensing reviewciteturn7search2turn6search2turn6search3.

## Recommended Preparation and Normalization Strategy

### Recommended Data Model Preparation Strategy

This section is intentionally concrete: it proposes **data layers, key registries, identifier strategy, and example schemas** designed for a rebuildable graph.

#### Core principle: separate “entities,” “observations,” and “claims”

- **Entities/registries**: canonical representations you want to be stable (companies, facilities, products/materials categories, places).
- **Observations**: structured captures from sources (“this filing said X,” “this dataset lists facility Y at coordinates Z”).
- **Claims**: normalized assertions derived from one or more observations (“A supplies B with thing T”), with explicit evidence links, time bounds, and confidence.

This triad lets you rebuild the graph, handle contradictions, and remain honest about uncertainty.

#### Canonical entity registry design

**Company registry** should be your first normalized layer.

Recommended design:

- **company_id**: internal stable UUID (never changes).
- **canonical_name**: best human name (time-versioned).
- **entity_type**: company / government agency / academic org / etc. (you may later include labs/universities via ROR/OpenAlex).
- **jurisdiction + legal form**: where legally registered, when available.
- **status**: active/dissolved/unknown.
- **primary country**: operational HQ vs incorporation (store both if possible).
- **roles**: *multi-valued* (see below).

Identifiers table (many-to-one):

- `company_identifiers(company_id, id_type, id_value, issuer, valid_from, valid_to, source_evidence_id)`
- id_type examples: LEI, CIK, ISIN, OpenCorporates ID, national registry number, DUNS (if licensed), etc.

Why anchor on LEI when possible: GLEIF provides daily “golden copy” and delta updates and explicitly aims to avoid technical duplicates in golden copy filesciteturn18view1 while also providing Level 2 corporate relationship data for LEI holdersciteturn17search1.

#### Name normalization and aliases

Store names *as data*, not as logic:

- Preserve raw names exactly as seen in each source (case, punctuation, language).
- Standardize an additional normalization form for matching only (e.g., folded ASCII, stripped suffixes), but do not discard originals.

Suggested tables:

- `company_names(company_id, name, name_type, language, script, source_evidence_id, observed_at)`
- `company_aliases(company_id, alias, alias_type, source_evidence_id)`

#### Multi-role company classification

Do not force a single “industry” label. Semiconductor firms routinely span roles (IDM + foundry services + packaging; materials + chemicals; equipment + services).

Recommended approach:

1. Maintain a **semiconductor supply chain role ontology** (controlled vocabulary) separate from NAICS/ISIC/NACE.
2. Let companies have **multiple roles** via a join table with evidence.

Example:

- `company_roles(company_id, role_code, role_label, confidence, source_evidence_id, valid_from, valid_to)`

Role code examples (illustrative):
- `FAB_FOUNDRY`, `FAB_IDM`, `OSAT`, `SUBSTRATE_ABF`, `WAFER_SILICON`, `PHOTORESIST`, `WET_CHEMICALS`, `EUV_LITHOGRAPHY_EQUIPMENT`, `TEST_EQUIPMENT`, `EDA_SOFTWARE`, etc.

Use NAICS/ISIC/NACE only as **outer references**:
- NAICS is an official U.S. classification framework with downloadable referencesciteturn12search0.
- ISIC Rev.4 is a UN global economic activity classification referenceciteturn12search2turn12search6.
- NACE Rev.2.1 becomes the newest European statistics classification use from 2025 onwardciteturn12search9.

These are helpful for general categorization but not sufficient for your modeling intent.

#### Facility normalization

Facilities are where supply chain risk becomes tangible. Model them explicitly for critical assets.

Minimum facility schema:

- `facility_id` (UUID)
- `facility_name` (time-versioned + aliases)
- `operator_company_id`
- `owner_company_id` (if different; optional)
- `facility_type` (fab, OSAT, wafer plant, materials plant, R&D, etc.)
- `status` (operational, under construction, announced, shuttered, unknown)
- `location_id` (geo normalization)
- `capability_attributes` (nullable fields): wafer size, node range, packaging type, etc.
- `source_evidence_id` for each major attribute

Facility identifier table:
- environmental registry facility IDs (e.g., EPA FRS IDs, permits)
- SEMI facility IDs (if licensed)
- internal curated IDs

Why include environmental registries: EPA’s ECHO downloads include lat/long when available and integrate multiple regulatory programs, enabling facility location integration into mapsciteturn19search11, while the European industrial reporting dataset provides location/administrative data for major industrial complexesciteturn15search0.

#### Country / geography normalization

Use standardized codes to prevent subtle joining errors.

- `geo_country` keyed by ISO-like alpha codes (store your own stable key + code versions).
- `geo_admin1` (state/province) and `geo_admin2` (county/district) as needed.
- `geo_point` with lat/long; store coordinate precision and source.

Public geospatial reference layers:
- Natural Earth provides public domain map datasets useful for standardized boundariesciteturn9search2turn9search26.
- GeoNames provides place data under CC‑BY and allows commercial use with attributionciteturn9search19turn9search3.
- OpenStreetMap data is under ODbL share-alike termsciteturn9search1turn9search5 (important productization implication).

#### Claim normalization (relationship modeling)

Your modeling intent (“not just `SUPPLIES_TO`”) implies you need a **claim-centric edge model**.

Recommended structure:

- `claim_id`
- `subject_type` (company/facility/product)
- `subject_id`
- `predicate` (typed relation)
- `object_type`
- `object_id`
- `what` (normalized item/service; may reference product taxonomy node)
- `form_factor` (e.g., wafers 300mm, gas, tool type, etc.)
- `directionality` (supplier→buyer vs buyer→supplier; ensure consistent semantics)
- `evidence_bundle_id` (one-to-many evidence)
- `confidence_score` (0–1 or tiered)
- `claim_class` = `FACT_DISCLOSED` | `PROXY_TRADE` | `INFERRED_TECH` | `HEURISTIC`
- `observed_at` (when you saw it)
- `valid_from`, `valid_to` (if known)
- `source_policy_flags` (e.g., export control relevance)

**Evidence bundle** design:
- Many claims require multiple bits of evidence (e.g., a 10‑K risk factor + a shipment record + a press release).
- Evidence bundle can contain both structured references and extracted snippets (within copyright limits).

#### Provenance representation

Implement provenance like a first-class “document + extraction” system:

- `document(doc_id, source_name, doc_type, publication_date, retrieval_date, checksum, license_tag, storage_path)`
- `evidence(evidence_id, doc_id, locator, excerpt, extraction_method, extractor_version, created_at)`
  - locator examples: EDGAR accession, page number, section heading, URL fragment, dataset row key.
- `claim_evidence(claim_id, evidence_id, role_in_claim)`.

This lets you rebuild and re-score claims when extraction improves.

#### Time / snapshot handling

Time-awareness is mandatory for compliance lists, trade flows, and facility status.

Practical rule set:

- Store **raw snapshots** for any source that changes frequently (sanctions lists, restricted party lists, many vendor feeds).
- Store **delta updates** where available (GLEIF deltas) to reduce operational costciteturn18view1.
- For filings, store by accession / document date (EDGAR is naturally time-addressable).

For sanctions/export-control lists, time-awareness is essential because:
- Lists change frequently
- Compliance requires “as-of” reasoning

UK sanctions list changes around Jan 28, 2026 illustrate why you need explicit dates and versioningciteturn3search12.

#### Confidence scoring and contradictions

Do not hide contradictions; encode them.

Simple, defensible scoring approach for v1:

- **Tier A (0.85–1.0)**: directly disclosed relationship in primary filings / official award documentation, with clear naming.
- **Tier B (0.6–0.85)**: strong proxy (shipment-level trade records) connecting parties + plausible commodity mapping.
- **Tier C (0.35–0.6)**: indirect inference (patent co-activity + site location + known process alignment).
- **Tier D (<0.35)**: weak heuristic (co-mentions, broad industry assumptions).

When contradictory evidence appears:
- Keep both claims, mark them inconsistent, and show provenance side-by-side.
- Prefer the most recent, highest-evidence-tier claim when you need a single “best edge,” but never delete alternatives.

### What Should and Should Not Go Into the Graph

A useful operating principle: **the graph is the index and reasoning surface; the normalized tables are the ground truth.**

#### What belongs in raw storage (outside the graph)

- Original source files (JSON, CSV, XML, PDFs, HTML).
- Full-text documents where licensing allows internal storage (and with appropriate access controls).
- Large time-series (e.g., shipment records, trade statistics) that will overwhelm graph traversal.

Reason: raw storage preserves provenance integrity and enables reprocessing without “graph drift.”

#### What belongs in normalized layers (outside the graph, but graph-rebuildable)

- Canonical registries: companies, facilities, products/materials vocabularies.
- Claim tables and evidence tables (as described above).
- Crosswalk tables (LEI↔CIK, registry IDs, aliases).

Reason: normalization is where you enforce deterministic constraints, deduplicate, and retain full provenance.

#### What belongs in the graph

Only “graph-shaped” data that benefits from traversal and compositional reasoning:

- Nodes: `Company`, `Facility`, `Country/Region`, `Product/Material category` (not every SKU), `RegulatoryListEntry` (optional).
- Edges: **claims** linking nodes with typed predicates and references to evidence bundles.

Graph edges should keep:
- `claim_id` (pointer)
- `predicate`
- `confidence`
- `valid_from/to` (or snapshot pointer)
- minimal “what” fields (or a pointer to product taxonomy nodes)

#### What belongs outside the graph for analytics

- Large event/time series: trade flows, AIS vessel tracks, emissions time series, hazard events.
- Heavy tabular aggregation used for dashboards.

Instead, compute features and attach them as **derived attributes** to graph nodes/edges:
- concentration indices
- dependency counts
- exposure scores
- “single-sourcing risk” flags

This preserves graph performance and keeps analytics reproducible.

## Recommended Ingestion Strategy

This section is pragmatic: it focuses on how a small team can actually ingest and operate these sources with minimal fragility.

### Filings and investor materials

**Best ingestion mode**: hybrid.
- Use API/bulk for structured metadata.
- Use document extraction (HTML/PDF) for narrative relationships.

EDGAR: APIs are JSON-formatted, do not require authentication keys, update in real time, and offer nightly bulk ZIP updatesciteturn18view0. That supports a robust ingest pattern:

- Nightly: download bulk ZIP snapshot.
- Incremental during day (optional): poll for new filings relevant to your curated company list.

**Pain points**
- Relationship info often appears in narrative risk factors or “principal customers/suppliers” sections.
- XBRL is structured, but supply chain relationships are rarely in XBRL tags; you still need text extraction.

**Dedup/entity resolution**
- Map filers using CIK and join to LEI when possible.
- Store all document-level references as evidence records.

**Deterministic vs claim**
- Filing existence and filing metadata are deterministic facts.
- “Supplier dependency” statements are claims (even when disclosed) because they can be time-bound and incomplete.

### LEI and corporate structure

**Best ingestion mode**: bulk + deltas.

GLEIF provides daily golden copy and delta files and states golden copy files are “ready-to-use” and avoid technical duplicatesciteturn18view1. This is ideal for small team operations:

- Daily: apply delta.
- Weekly/monthly: rebase using full golden copy snapshot (for integrity checks).

**Pain points**
- LEI coverage gaps, reporting exceptions, and the nuance that “accounting consolidating parent” is not beneficial ownershipciteturn17search1turn17search8.

**Deterministic vs claim**
- LEI reference details are deterministic within the LEI system.
- Parent relationships should still be treated as claims with source = LEI Level 2 relationship record, because not all parents have LEIs and exceptions exist.

### Facility discovery and enrichment

**Best ingestion mode**: multi-source fusion + selective manual curation for critical sites.

- EPA facility datasets:
  - Use bulk downloads and geospatial services; ECHO downloads include integrated program data and lat/long when availableciteturn19search11.
- Europe:
  - Download industrial reporting dataset from the European Industrial Emissions Portalciteturn15search0.
- Canada:
  - Download NPRI datasets (reviewed data)citeturn15search20.
- Industry datasets:
  - If budget permits, SEMI’s World Fab Forecast (paid) provides broad fab facility coverageciteturn13search0.

**Pain points**
- Facility naming mismatch across sources.
- Operator vs owner differences.
- Geocoding errors and coordinate precision.

**Operational fragility**
- Public portals can change formats; mitigate by snapshotting raw files and writing parsers with schema version checks.
- For OpenStreetMap-based enrichment, public Overpass usage can be unreliable or rate-limited; plan for caching or self-hosting if you scaleciteturn9search32turn9search20.

### Trade proxies (macro and shipment-level)

**Macro trade stats** (UN Comtrade / USITC / Eurostat):
- Ingest periodically; store as time series outside the graph; derive concentration features.

**Shipment-level** (Panjiva, ImportGenius, Datamyne, etc.):
- Use if budget allows; treat as “proxy evidence edges.”

Example: Datamyne claims U.S. maritime import records are added daily and allows drill down to individual shipments including parties and logistics detailsciteturn6search3turn6search7. Panjiva markets billions of shipment records and company-to-company relationshipsciteturn7search2turn6search21.

**Pain points**
- Party name normalization (shipper/consignee variants).
- Commodity description normalization (HS codes, free text).
- Confidentiality strategies can obscure parties (some shipments may not reveal ultimate buyer/supplier).

**Deterministic vs claim**
- “This shipment record states X shipped Y to Z” is a deterministic observation (within dataset).
- “Supplier relationship exists” is a claim inferred from repeated shipments, product relevance, and time consistency.

### Restrictions: sanctions and export controls

**Best ingestion mode**: frequent snapshotting + diffing.

- BIS describes export-control restricted party lists and highlights the consolidated screening list and component lists (Denied Persons, Entity List, Unverified, MEU)citeturn18view3.
- OFAC provides a sanctions list service for up-to-date structured downloadsciteturn3search27.
- EU consolidated sanctions list is managed/updated and linked via EU resources and official law gatewaysciteturn4search26turn3search0.
- UK sanctions list changed in Jan 2026; you must ingest the correct current source and time-stamp itciteturn3search12.

**Pain points**
- Matching list entities to companies (fuzzy matching, transliterations, alias explosion).
- Need for time-aware compliance reasoning.

**Modeling**
- Store list entries as “regulatory entities” and connect them to companies via a resolution layer with confidence and matched identifiers.

### Patents and research publications

**Best ingestion mode**: API-based + periodic snapshots.

- PatentsView provides API access to disambiguated patent data (commonly used via libraries)citeturn2search38turn2search38.
- OpenAlex provides CC0 scholarly metadata via API and data snapshotsciteturn10search0turn10search4.
- Crossref provides API pools and recommends polite pool usage for moderate/high request volumesciteturn10search13turn10search9.

**Pain points**
- Assignee and affiliation resolution to companies.
- Technology inference is indirect; do not overstate.

**Use in v1**
- Use to support “capability” claims (e.g., “company is active in EUV lithography patents”) and to link to standards/research ecosystems.
- Avoid making patents the primary source for supplier-customer edges.

## Recommended V1 Source Stack and Paid Options

### Recommended V1 Source Stack

This stack is designed to be **high-leverage, cost-effective, and rebuildable**, while supporting your modeling intent (typed, evidence-backed claims; selective facilities; time awareness).

#### Must-have for v1

1. **Curated seed list (manual)**: start with your ~200 companies and initial taxonomy. This is unavoidable and foundational.
2. **SEC EDGAR APIs + bulk** for disclosure-driven evidence and document provenanceciteturn18view0.
3. **GLEIF LEI Level 1 + Level 2** for identifiers and corporate structure scaffolding (plus deltas for operations)citeturn18view1turn17search1.
4. **Sanctions/export control overlays**:
   - BIS/CSL + listsciteturn18view3
   - OFAC sanctions list serviceciteturn3search27
   - UK sanctions list (post-Jan 2026 single source shift)citeturn3search12
   - EU financial sanctions consolidated list referencesciteturn4search26turn3search0
5. **Facility validation sources**:
   - EPA ECHO/FRS for U.S. facilitiesciteturn19search11turn2search37
   - European Industrial Emissions Portal industrial reporting datasetciteturn15search0turn15search7
   - Canada NPRI datasetsciteturn15search5turn15search20
6. **Macro chokepoint indicators** via USGS mineral summaries (for upstream materials risk overlays)citeturn8search1turn8search11.

This “must-have” set gets you:
- a credible entity registry
- initial facility registry for critical sites (especially U.S./EU/Canada validation)
- compliance overlays
- evidence-backed disclosed dependency claims

#### Should-have (smart stretch) additions

1. **OpenCorporates + GLEIF mapping** to reduce company matching costs across jurisdictionsciteturn17search2turn5search4.
2. **OpenAlex** for technology/topic mapping and R&D ecosystem linkingciteturn10search0turn10search4.
3. **PatentsView** to strengthen capability inference and cross-check contested technology claimsciteturn2search38.
4. **Copernicus Data Space Ecosystem** for spot-check facility construction/expansion (human-in-the-loop OSINT)citeturn11search0turn11search17.

#### Nice-to-have (if bandwidth exists)

- **OpenStreetMap / GeoNames / Natural Earth** as explicit geography normalization tools, with licensing awareness (ODbL for OSM; CC‑BY for GeoNames; public domain for Natural Earth)citeturn9search1turn9search19turn9search2.
- Route-level chokepoint overlays using AIS vessel traffic datasets where helpful for disruption scenario narrativesciteturn6search0turn6search8.

#### Explicitly defer from v1

- Continuous scraping of corporate websites at scale (fragile; high maintenance).
- Building a global “complete” facility inventory without either a paid facility dataset or a narrow scope.
- Any heavy reliance on tools constrained to non-commercial use if you aim to productize soon (e.g., the free Earth Engine mode)citeturn11search2turn11search18.
- Attempting to model precise quantities and logistics routes for most relationships; keep quantities as optional fields and only fill when evidence exists.

### Paid Data Options

This is the “what each would unlock” list, aligned to your roadmap from solo researcher → demo/product.

#### Most valuable paid dataset categories (in priority order)

**Facility-level semiconductor datasets**
- SEMI World Fab Forecast: claims it tracks global fab spending, construction, capacity, and technology trends and covers over 1,600 facilities plus future linesciteturn13search0.
- SEMI store pricing shows single-edition and subscription options at several-thousand-dollar price points (per user)citeturn13search5turn13search15.
- SEMI also lists a “Worldwide Assembly & Test Facility Database (IDM + OSAT)” in its market reports catalogciteturn13search24.

**What this unlocks**
- Rapid facility registry build-out (fabs and possibly OSAT/assembly/test).
- Faster identification of chokepoints and geographic concentration.

**Supply chain relationship datasets**
- FactSet Supply Chain Relationships: positioned to expose supplier/customer/partner networks and is marketed as sourced from annual filings, investor presentations, and press releasesciteturn16search27turn16search0.
- Bloomberg supply chain data/tools: positioned for identifying exposure and risk across supply chain layersciteturn16search1turn16search9.
- S&P Global datasets: business relationships and supply chain intelligence offerings exist, and Panjiva provides shipment records plus company-to-company relationships (vendor-marketed)citeturn7search8turn16search14.

**What this unlocks**
- Faster relationship graph bootstrapping (still disclosure-biased).
- Higher coverage than manual extraction, but still must be treated as claims with provenance.

**Shipment-level trade intelligence**
- Panjiva: claims billions of shipment records and relationshipsciteturn7search2turn6search21.
- ImportGenius: bill-of-lading level access describedciteturn6search2turn6search10.
- Datamyne: emphasizes detailed bills of lading and daily updates after receipt from CBP for U.S. maritime dataciteturn6search3turn6search7.

**What this unlocks**
- Strong proxy edges (“shipped X to Y repeatedly”), especially for materials/equipment flows.
- Potential to model “what is supplied” at commodity level with HS/HTS coding (still messy).

#### Rough cost/value logic

- If you can only afford one paid pillar for a supply chain risk graph: **facility coverage** (SEMI) is often a better early unlock than relationships, because facility nodes are essential for risk and easier to validate than customer–supplier edges.
- Relationship datasets (FactSet/Bloomberg/S&P) accelerate graph density but can create a false sense of certainty unless you strictly maintain claim provenance.

## Implications and Appendix

### Productization Implications

Data source choices can either enable or block future commercialization.

#### Sources typically fine for personal research but problematic for productization

- Sources with **share-alike** obligations (e.g., OpenStreetMap under ODbL) can complicate proprietary graph products, depending on how you integrate and publish derived dataciteturn9search1turn9search5.
- Tools with explicit **non-commercial restrictions** in free tiers (e.g., Google Earth Engine free edition) can become a commercial bottleneck if your pipeline depends on themciteturn11search2turn11search33turn11search18.
- “Free but not guaranteed” trade tools can change terms, coverage, or access patterns; ImportYeti’s terms are unilateral-changeable and include arbitration clauses, illustrating typical volatility in such servicesciteturn7search1.

#### Sources that support productization well

- CC0 / public-domain datasets (OpenAlex CC0citeturn10search0turn10search4; Natural Earth public domainciteturn9search2turn9search26).
- Official government datasets and lists (export controls and sanctions lists, industrial registries) that are stable and auditableciteturn18view3turn15search0turn19search11.
- Structured identifiers with established governance (LEI ecosystem) enabling clean entity resolutionciteturn18view1turn17search1.

#### Where licensing/fragility will likely hurt later

- Any commercialization relying on redistributing vendor datasets (facility lists, relationship lists, trade shipments) will require negotiated rights; plan early to ensure your product can function even if you must remove raw licensed content.
- The moat opportunity is to build **proprietary normalized layers and provenance-rich claims**, not to depend entirely on resold data.

### Architecture Implications

This is not a full architecture, but the data landscape implies specific pipeline capabilities.

#### Capabilities your pipeline must support

- **Source snapshotting and rebuildability** (recompute normalized + graph layers from raw).
- **Incremental updates** (daily deltas for LEI; near-real-time for filings; frequent for sanctions lists).
- **Schema versioning** (public portals change formats; vendor feeds change versions).
- **Entity resolution workflows** (automated matching + human adjudication).
- **Evidence storage and retrieval** (doc store + excerpt locators).
- **Time-aware queries** (as-of graph rebuilds; compliance reasoning).

#### Where human-in-the-loop is unavoidable early

- Building the initial company list and role taxonomy.
- Facility matching across sources (operator name variants, subsidiaries).
- High-value relationship extraction from narratives (filings, press releases, awards) until extraction quality is proven.
- Curating a set of “critical facilities” for selective modeling.

#### Where temporal modeling matters most

- Sanctions/export controls (must track list membership over time)citeturn3search12turn18view3.
- Facility status (announced → under construction → operational).
- Supplier dependency claims (which may change across filings/reporting periods).

#### Where storage outside the graph is mandatory

- Large trade/shipment datasets.
- Full text corpora and PDF archives.
- Geospatial rasters and heavy time-series.

### Concrete Next Steps

1. **Lock the v1 scope list (companies + critical facilities).** Create an explicit “v1 inclusion rule” (e.g., must be in top X by revenue, chokepoint relevance, or facility criticality) and an “out-of-scope list” to reduce drift.
2. **Implement the canonical company registry first.** Anchor on LEI where possible, ingest GLEIF daily files + Level 2, and create identifier/crosswalk tablesciteturn18view1turn17search1.
3. **Stand up an evidence store.** Decide how you will store documents and excerpts (hashing, page/section locators). Start with EDGAR documents as the first corpus because they are time-addressable and API-accessibleciteturn18view0.
4. **Define your claim schema and predicate vocabulary.** Implement “claim” tables before graph ingestion, so the graph is just a projection.
5. **Ingest compliance lists as time-versioned datasets.** Add BIS restricted-party lists + OFAC + UK + EU, and design your entity matching pipeline for these lists earlyciteturn18view3turn3search27turn3search12turn4search26.
6. **Bootstrap facility registry using public validation sources.** Pull EPA ECHO/FRS (US), European industrial reporting dataset (EU), Canada NPRI; map facilities to operators; mark uncertain matches explicitlyciteturn19search11turn15search0turn15search20.
7. **Create a “relationship evidence playbook.”** Define allowed evidence types (filing statement, award page, shipment proxy, etc.), how confidence is scored, and how contradictions are handled.
8. **Load the first graph build (small).** Start with ~50 companies and a handful of facilities, prove the end-to-end rebuild (raw → normalized → graph), then scale.

### Appendix

#### Source links (clickable via citations)

- SEC EDGAR Application Programming Interfaces (APIs)citeturn18view0  
- GLEIF Golden Copy and Delta Files download + descriptionciteturn18view1  
- GLEIF Level 2 “Who Owns Whom” overviewciteturn17search1  
- GLEIF OpenCorporates ID-to-LEI relationship filesciteturn17search2  
- UK Sanctions List change notice (post Jan 28, 2026)citeturn3search12  
- UN Security Council Consolidated List last-updated bannerciteturn4search20  
- OFAC Sanctions List Serviceciteturn3search27  
- BIS guidance page describing CSL and restricted party lists + download linksciteturn18view3  
- SEMI World Fab Forecast product pageciteturn13search0  
- SEMI store listing for World Fab Forecast (single edition/subscription)citeturn13search5turn13search15  
- EPA ECHO “About the Data” + downloads and facility contextciteturn2search32turn19search11  
- EPA FRS facility CSV downloadsciteturn2search37  
- European Industrial Emissions Portal dataset download pageciteturn15search0  
- Canada NPRI program page + “Database – all data for all years” downloadciteturn15search5turn15search20  
- OpenAlex developers overview (CC0)citeturn10search0  
- Crossref REST API pool guidance (public/polite/plus)citeturn10search13turn10search9  
- Copernicus Data Space Ecosystem + API overviewciteturn11search0turn11search17  
- Google Earth Engine Terms (non-commercial restriction)citeturn11search2turn11search33  
- OpenStreetMap ODbL referencesciteturn9search1turn9search5  

#### Suggested identifier fields (company)

Recommended “minimum viable” identifier columns:

- `lei` (if available)
- `cik` (if SEC filer)
- `isin` / `figi` (if public security and relevant)
- `opencorporates_id` (if used)
- `registry_number` + `registry_jurisdiction`
- `ticker` + `exchange` (time-versioned)
- `website_domain` (useful for document discovery, but do not treat as unique)

#### Suggested normalized dataset/table names

A pragmatic naming set:

- `raw_documents_*` (partitioned by source)
- `raw_datasets_*` (partitioned by source)
- `norm_company`
- `norm_company_identifier`
- `norm_company_name`
- `norm_company_role`
- `norm_facility`
- `norm_facility_identifier`
- `norm_geo_country`, `norm_geo_admin1`, `norm_geo_place`
- `norm_product_taxonomy`
- `claim_relationship`
- `claim_relationship_evidence`
- `evidence_record`
- `document_registry`
- `list_sanctions_entry`, `list_export_controls_entry`
- `entity_resolution_match` (stores match candidates and adjudication)

#### Example evidence record fields

```json
{
  "evidence_id": "uuid",
  "doc_id": "uuid",
  "source_system": "edgar|bis|ofac|semi|epa_echo|panjiva|manual",
  "doc_type": "10-k|20-f|press_release|dataset_row|sanctions_list|permit_record",
  "publication_date": "YYYY-MM-DD",
  "retrieval_date": "YYYY-MM-DDThh:mm:ssZ",
  "locator": {
    "url_or_accession": "string",
    "page": 12,
    "section": "Risk Factors",
    "row_key": "optional"
  },
  "excerpt": "short quoted or paraphrased snippet (copyright-safe)",
  "extraction_method": "manual|regex|llm_extract|parser_vX",
  "checksum": "sha256",
  "license_tag": "public|cc0|odbl|vendor_restricted|unknown",
  "notes": "string"
}
```

#### Example relationship / claim fields

```json
{
  "claim_id": "uuid",
  "subject": {"type": "company|facility", "id": "uuid"},
  "predicate": "SUPPLIES_MATERIAL|PROVIDES_EQUIPMENT|PACKAGES_FOR|SOLE_SOURCE_RISK_FOR|OPERATES|LOCATED_IN",
  "object": {"type": "company|facility|product|country", "id": "uuid"},
  "what": {"product_taxonomy_id": "uuid", "label": "photoresist|300mm silicon wafers|EUV scanner"},
  "form_factor": {"wafer_mm": 300, "node_nm_range": "optional", "packaging": "optional"},
  "claim_class": "FACT_DISCLOSED|PROXY_TRADE|INFERRED_TECH|HEURISTIC",
  "confidence": 0.72,
  "observed_at": "YYYY-MM-DD",
  "valid_from": "YYYY-MM-DD",
  "valid_to": null,
  "evidence_bundle_id": "uuid",
  "contradiction_group_id": "optional uuid",
  "notes": "string"
}
```

### Best Practical Recommendation

If you want to move fastest without painting yourself into a corner, start with a **two-track pipeline**: (1) deterministic identity + facility registry, and (2) evidence-backed claims. Build the graph only after those are working.

**Exactly which sources to start with**
- **SEC EDGAR APIs + nightly bulk ZIP** for your US-listed and SEC-filing companies (disclosure evidence, time-addressable documents)citeturn18view0.
- **GLEIF LEI golden copy + deltas + Level 2** (corporate identity, ownership scaffolding, cross-border dedup)citeturn18view1turn17search1.
- **BIS CSL + restricted party lists + OFAC + UK + EU sanctions list sources** for compliance overlays, all stored as time-versioned snapshotsciteturn18view3turn3search27turn3search12turn4search26.
- **Facility validation for critical sites** using EPA ECHO/FRS (US) + European Industrial Emissions Portal (EU) + Canada NPRI (Canada)citeturn19search11turn15search0turn15search20.
- **USGS Mineral Commodity Summaries** as your upstream chokepoint overlay foundation (materials concentration risk)citeturn8search1turn8search11.

**Which sources to ignore for now**
- Any large-scale web scraping of corporate sites.
- Any “free but unstable” trade/shipment sources for anything beyond exploratory research (unless you accept that they will not be part of a product).
- Deep remote sensing automation (use it as spot-check OSINT first, not as a core dependency). Copernicus is a good open base for this if/when you expand, but keep it human-in-the-loop earlyciteturn11search0turn11search17.

**Which parts should be manual first vs automated first**
- Manual first:
  - Build the initial company list, role taxonomy, and “critical facilities” list.
  - Validate facility↔operator links for your top 20–50 facilities.
  - Extract the first batch of high-value dependency statements from filings and awards into evidence records.
- Automated first:
  - Daily ingestion + delta refresh for LEI datasets.
  - EDGAR bulk ingestion for filings metadata and document storage.
  - Snapshot ingestion for sanctions/export control lists.
  - Facility registry ingestion from EPA/EU/Canada datasets (parsing + normalization), with a manual adjudication queue for mapping to your company IDs.

**What the first serious data pipeline probably looks like**
1. **Raw snapshot layer**: store EDGAR JSON and filings, LEI files, sanctions lists, EPA/EU/Canada facility datasets, and USGS mineral datasets with retrieval timestamps and checksums.
2. **Normalization layer**:
   - Build `norm_company` + identifiers + aliases from LEI + EDGAR issuer metadata.
   - Build `norm_facility` from regulatory datasets and curated facility list, linked to `norm_company`.
3. **Claim + evidence layer**:
   - Create `evidence_record` entries for each extracted relationship statement and for key dataset rows.
   - Create `claim_relationship` entries with typed predicates, confidence, and time bounds.
4. **Graph build step**:
   - Materialize a graph projection from normalized entities + claim edges, storing only pointers back to claim/evidence tables.
5. **Human review loop**:
   - A small UI or spreadsheet-driven adjudication flow for entity matching, facility matching, and claim validation, feeding back into the normalized layer.

This sequence yields a credible v1 quickly while ensuring every edge in the graph can be traced back to a stored source artifact and re-derived when your extraction improves.