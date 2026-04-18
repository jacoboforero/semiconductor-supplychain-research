# Semiconductor Supply Chain Research Report II: Asia Sources, Taxonomy, and Operability

## Executive Summary

This second report narrows in on three unresolved architecture-risk areas: Asia-heavy data coverage, a concrete semiconductor taxonomy + claim vocabulary suitable for normalization/graph loading, and ingestion operability realism for a solo/small-team research system that could later become productizable.

Three findings change the practical direction versus many “global, generic” supply-chain graph plans:

First, **Asia has unusually strong “structured disclosure islands”** that can drastically reduce scraping/OCR burden if you build around them early. Notable examples include: **South Korea’s** disclosure ecosystem with **structured Open DART formats (XBRL/Excel/TXT) and original filing XML access** citeturn5search4turn5search0; **Japan’s** **EDINET API (v2) + code lists + taxonomy materials** (in Japanese, but stable and versioned) citeturn22view0; and **Thailand’s** **SET One Report dataset delivered as JSON via API** (available since 2021) citeturn20view1. These are disproportionately valuable because they support recurring ingestion and schema evolution management.

Second, **facility validation in Asia is unusually tractable if you treat environmental/industrial registries as “facility truth anchors.”** Taiwan, for example, runs a national PRTR portal that integrates pollution-source permit/declaration data and explicitly describes automated updates and scope (air/water/waste/toxic chemicals) citeturn21view2. Korea operates a PRTR system with comparable intent citeturn5search7turn5search3. These sources won’t give you commercial supplier-customer edges, but they give you high-confidence facility existence, operator names, and location anchors—critical for graph credibility.

Third, **taxonomy must be treated as a first-class, versioned product artifact—not a one-off spreadsheet.** The OECD’s “Chips, nodes and wafers” taxonomy is directly relevant: it provides an explicit chip-type taxonomy (logic/memory/analog/others) and facility attributes and was designed as a basis for a semiconductor production database citeturn10view0. That document also explicitly recognizes existing taxonomies (SEMI, WSTS, CSA Catapult, IEEE) but you should **adapt rather than adopt** in v1 to avoid licensing and over-granularity pitfalls citeturn10view0turn11view0.

Recommended practical direction: build v1 around **(a)** a small number of high-operability Asia disclosure feeds (OpenDART, EDINET, MOPS via official push/bulk options where available, SET One Report JSON), **(b)** PRTR + science-park/industrial-estate directories for facility grounding, and **(c)** a controlled vocabulary that is semicon-specific but deliberately “v1-sized,” with explicit mappings to HS/industry codes as *bridge layers* rather than as primary modeling drivers (HS 8542 integrated circuits example) citeturn12search3turn10view0.

## What This Report Adds Beyond Report I

This report is intentionally additive in three ways.

Asia disclosure + registry coverage is expanded with **country-specific, operationally biased sources** (filings, corporate registries, trade stats, industrial parks, PRTRs, and export-control lists), prioritizing sources with APIs, bulk downloads, or government-backed stability. Example: Taiwan’s official **MOPS Push Server Service (paid)** provides packaged access to issuer information and even “XBRL package” offerings with clear subscription pricing—this can be materially more stable than brittle scraping citeturn20view0. Similarly, Thailand’s SET One Report JSON feed is structurally “graph-ready” with known availability since 2021 citeturn20view1.

A concrete semiconductor taxonomy is proposed that is **usable for normalization and graph loading**, with suggested **role codes, facility-type codes, process-stage codes, item-category codes**, and a controlled **predicate vocabulary** designed for evidence-backed claims. The taxonomy design is explicitly anchored to OECD’s semiconductor-type framing and facility attribute approach citeturn10view0, while acknowledging WSTS product-category usefulness but also its distribution/licensing constraints citeturn11view0.

Operability realism is addressed explicitly: this report calls out which sources are realistically automatable (API/bulk/structured), which will likely require browser automation + translation, and which are too fragile or license-constrained to anchor a future commercial system (e.g., “personal/non-commercial use” restrictions on certain exchange web materials) citeturn6search27.

## Asia-Critical Source Landscape

The table below focuses on sources that are (a) semiconductor-relevant, (b) high leverage for v1, and (c) likely to reduce architectural uncertainty through operability.

**Legend for Operability Risk:** Low = API/bulk/structured; Medium = stable portal/PDFs with predictable patterns; High = heavy JS, captcha, unclear ToS, or frequent layout changes.

| Geography | Source | Category | Public/Paid | Access Method | Language | Coverage Level | Update Cadence | Strengths | Weaknesses | Operability Risk | Licensing / TOS Risk | V1 Utility | Future Product Utility | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| entity["country","Taiwan","country in east asia"] | entity["organization","Taiwan Stock Exchange Corporation","stock exchange, taipei"] Data E‑Shop (MOPS Push Server Service) | Filings + issuer metadata (bulk/push) | Paid | Subscription / “push server” | EN available | Company + document packages | Ongoing | Much more stable than scraping; explicit packaged “XBRL” offering and pricing | Cost; still requires downstream parsing | Low–Med | Commercial terms apply | High | High | Clear subscription packages incl. XBRL and “English Significant Information.” citeturn20view0 |
| Taiwan | Taiwan PRTR portal (MOENV) | Facility validation (environmental) | Public | Web portal / data exchange described | EN | Facility + regulated pollutant-source data | Automated updates described | Strong facility grounding; explicit multi-domain coverage (air/water/waste/toxic chemicals) and portal integration | Not semicon-specific; mapping operator names → corporate entities can be messy | Med | Typically government open-data terms; confirm reuse scope | High | Medium–High | PRTR launched 2012; describes integration and update approach citeturn21view2 |
| Taiwan | Southern Taiwan Science Park (company roster search) | Industrial park directory (facility proxy) | Public | Web directory | EN | Company + address (park presence) | Ongoing | High-leverage facility/location proxy for the “S Corridor” cluster | Presence ≠ supply relationship; still needs entity resolution | Med | Low | Medium–High | Medium | “All Companies” directory supports search by category/address citeturn8search5 |
| Taiwan | International Trade Administration trade stats portal | Trade proxies | Public | Web query + export to Excel described | EN | Commodity-level trade statistics | Ongoing | Official trade-stat coverage and exportable output | HS granularity limits semicon specificity; no shipment-level | Med | Low | Medium | Medium | “Statistics cover only goods exported/imported… Save as Excel” citeturn15search16 |
| Taiwan | Export Control Lists (Dual-use + military lists) | Export controls | Public | PDFs / postings | EN | Controlled items + technology | Updates | Directly supports restriction edges/overlays | Not a supplier-customer source | Low | Low | Medium | High | International Trade Administration lists export control laws/resources citeturn17search3turn17search23 |
| entity["country","South Korea","country in east asia"] | entity["organization","Financial Supervisory Service","financial regulator, south korea"] OpenDART | Public-company filings | Public | API + XBRL/Excel/TXT; original reports in XML | EN for OpenDART | Company + document + some structured fields | Ongoing | One of the best “structured disclosure” systems globally | Some filings still unstructured; Korean originals common | Low | Low | High | High | “Open API… various formats (XBRL, EXCEL, TXT)” citeturn5search4turn5search0 |
| South Korea | Korea PRTR Information System | Facility validation (chemicals) | Public | Web portal | EN + KO | Facility + chemical releases/transfers | Annual/periodic | Facility grounding; useful for materials/chemical chokepoint overlays | Requires operator matching; not semicon-specific | Med | Low | Medium | Medium | PRTR intent and data availability described citeturn5search7turn5search3 |
| South Korea | Korea Customs Service trade stats | Trade proxies | Public | Web portal | EN | Commodity/country trade stats | Ongoing | Official and stable | HS limits; not shipment-level | Med | Low | Medium | Medium | Trade statistics navigation and commodity/country breakdown described citeturn15search5turn15search1 |
| South Korea | Korea Open Government Data Portal | Cross-registry enrichment | Public (some gated) | API portal | EN/KO | Many datasets; some trade APIs | Ongoing | Can source “adjacent” registries (ports, industrial data) | Highly variable dataset quality; keys/auth | Med | Medium | Medium | Medium–High | Portal foundations and API catalog described citeturn5search19turn15search21 |
| entity["country","Japan","country in east asia"] | entity["organization","Financial Services Agency","financial regulator, japan"] EDINET API and taxonomy materials | Filings + XBRL | Public | API spec + code lists + taxonomy docs | JA (some EN guidance) | Company + doc + XBRL | Versioned updates | Strong stability: versioned API spec updates and code lists | Japanese-first; translation pipeline required | Low–Med | Low | High | High | EDINET API v2 spec updated Jan 2026; code list updated Aug 2025 citeturn22view0 |
| Japan | EDINET English translation pointers | Filing access usability | Public | Portal listing of EN-translated ASRs | EN list | Document-level | Ongoing | Helps reduce translation burden for a subset of firms | Coverage incomplete; mostly Japanese remains | Med | Low | Medium | Medium | EDINET provides links to English translations of some Annual Securities Reports citeturn5search9turn5search1 |
| Japan | Japan trade statistics (MOF Japan Customs) | Trade proxies | Public | Search + downloadable data | EN | Commodity/country/time series | Monthly | Official, downloadable tables | HS constraints | Med | Low | Medium | Medium | “Trade Statistics (Data Download)” described citeturn15search2turn15search6 |
| Japan | entity["organization","Ministry of Economy, Trade and Industry","economic ministry, japan"] End User List updates | Export controls | Public | Web + list updates | EN/JA | Entity-level risk overlay | Periodic | Strong for restriction edges and compliance overlays | Not a supply chain disclosure source | Low | Low | Medium | High | METI revised End User List and publishes update dates and scope citeturn17search8turn17search0 |
| Japan | entity["organization","Japan Patent Office","patent office, japan"] J‑PlatPat | Patents / IP evidence | Public | Web database | EN/JA | Document + assignee + classification | Ongoing | Official patent search access; can support tech capability claims | Patent → supply edge is inferential; needs careful claim typing | Med | Low | Medium | Medium–High | JPO describes J‑PlatPat as official digital library for patents, etc. citeturn18search0 |
| entity["country","China","country in east asia"] | entity["organization","CNINFO","securities disclosure portal, china"] (cninfo.com.cn) | Filings repository | Public | Portal + document PDFs | ZH (some EN PDFs exist) | Company + document | Ongoing | Primary path for many listed-company disclosures | Scraping friction; potential throttling/captcha; Chinese-first | High | Medium–High | Medium–High | Medium | Annual reports explicitly reference cninfo as disclosure site in filings citeturn13search0turn13search11 |
| China | entity["organization","Shanghai Stock Exchange","stock exchange, shanghai"] XBRL company info pages | Filings (structured slice) | Public | Web views (XBRL-derived) | EN | Company + structured financial fields | Ongoing | Explicitly derived from XBRL; provides structured numbers | Still requires careful scraping or feed discovery | Med | Medium | Medium | Medium–High | Notes that displayed data comes from XBRL submissions and points to PDFs citeturn13search2 |
| China | entity["organization","General Administration of Customs of China","customs agency, china"] customs statistics portal | Trade proxies | Public | Interactive tables | EN | Commodity/country/mode/location | Ongoing | Official and flexible slicing | Often not bulk-friendly; potential rate limits | Med | Low | Medium | Medium | “Customs statistics” interactive portal in English citeturn4search3 |
| China | National Enterprise Credit Information Publicity System (SAMR) | Corporate registry / KYC | Public | Web portal | ZH | Legal entity registry info | Ongoing | Official registry foundation for entity validation | High friction (Chinese, captcha); inconsistent scrapability | High | Medium | Medium | Medium | Official portal exists (gsxt.gov.cn variants) and is used for company verification citeturn4search20turn4search8 |
| China | entity["organization","China National Intellectual Property Administration","patent office, china"] Patent Search and Analysis System | Patents / IP evidence | Public | Web search system | EN/ZH | Patents + abstracts | Ongoing | Official IP evidence stream | Patent → supply chain edges are inference; no direct relationships | Med | Low | Medium | Medium–High | CNIPA provides an English patent search system citeturn18search7turn18search3 |
| entity["country","Hong Kong","special administrative region, china"] | entity["organization","Hong Kong Exchanges and Clearing","exchange operator, hong kong"] HKEXnews | Filings/disclosures | Public | Portal search | EN/ZH | Company + document | Ongoing | Centralized disclosure search; supports RSS alerts | Heavy UI; document parsing required | Med | Medium | Medium | High | HKEXnews provides title search and company publications citeturn7search0 |
| Hong Kong | HKEX RSS feeds / alerts | Change detection | Public | RSS | EN | Document-level signals | Ongoing | Reliable “what changed” feed for pipelines | Requires downstream fetch/parse | Low | Low | High | High | HKEX provides RSS feeds page and news alert options citeturn7search8turn7search12 |
| Hong Kong | HKSTP Company Directory API (data.gov.hk) | Science park directory (facility proxy) | Public | JSON API | EN | Company list within Hong Kong Science Park | Real-time | Rare: real-time park company list with explicit API URL | Park presence ≠ facility type; still entity resolution | Low | Medium | Medium–High | Medium–High | Dataset specifies JSON format, API URL, real-time updates citeturn20view2 |
| entity["country","Singapore","country in southeast asia"] | entity["organization","Singapore Exchange","stock exchange, singapore"] company announcements | Filings/disclosures | Public | Portal | EN | Company + document | Ongoing | Central disclosure entry point | Not fully structured; PDF heavy | Med | Medium | Medium | High | SGX company announcements page citeturn6search0turn6search28 |
| Singapore | entity["organization","Accounting and Corporate Regulatory Authority","company registry, singapore"] API Marketplace (Business Profile API) | Corporate registry / identity | Paid | API subscription | EN | Legal entity identity + UEN, activities, officers | Real-time | High value for entity resolution; explicitly designed for automated access | Paid + governance requirements | Low | Medium | High | High | Business Profile API launched 18 Nov 2025; includes UEN and entity profile fields citeturn6search13turn6search5 |
| Singapore | entity["organization","National Environment Agency","environment agency, singapore"] emissions reporting (EDMA) | Facility climate reporting proxy | Public guidance (facility reporting is regulated) | Web guidance; reporting via system | EN | Facility-level emissions reporting framework | Ongoing | Can support facility criticality overlays (energy/emissions) | Data access may not be open; may require regulated access | Medium | Medium | Low–Medium | Medium | Emissions reports submitted via NEA UI in EDMA system citeturn9search26 |
| entity["country","Malaysia","country in southeast asia"] | entity["organization","Bursa Malaysia","stock exchange, malaysia"] company announcements | Filings/disclosures | Public | Portal | EN/MS | Company + documents | Ongoing | Central disclosure point for listed Malaysian OSAT/electronics firms | PDF-centric; extraction | Med | Medium | Medium | High | Bursa “Company Announcement” portal citeturn6search14turn6search6 |
| Malaysia | DOSM METS Online | Trade proxies | Public (registration may be needed) | Web + downloads | EN | Commodity trade (HS up to 6 digits described) | Ongoing | Official trade stats; HS-based filtering | Account/registration friction possible | Med | Medium | Medium | Medium | METS described as interactive and HS-based in DOSM materials citeturn16search24turn16search0 |
| Malaysia | Department of Environment EIA reports | Construction/facility signals | Public (access workflow) | Web + downloadable PDFs | EN/MS | Project/facility-level | Ongoing | Non-obvious way to detect new fabs/material plants via EIAs | Very noisy; not chip-specific; heavy PDFs | Med–High | Medium | Medium | Medium | DOE provides “EIA Report” access pages citeturn9search3turn9search7 |
| Malaysia | data.gov.my manufacturing projects approved by state | Industrial policy / factories proxy | Public | Dataset portal | EN | Project-level (location proxy) | Periodic | Useful proxy for manufacturing footprint/incentives | May be historical/partial; needs schema review | Low–Med | Low | Medium | Medium | Dataset licensed CC BY and describes approved projects by location citeturn8search26 |
| Malaysia | Companies Commission portals (SSM e‑Info) | Corporate registry | Paid | Portal + API integration pitch | EN | Legal entity details | Ongoing | Valuable for entity resolution and corporate structure | Fee per record; access constraints | Medium | Medium | Medium | High | SSM e‑Info positions API integration for real-time data retrieval citeturn14search3turn14search15 |
| entity["country","Philippines","country in southeast asia"] | entity["organization","Philippine Stock Exchange","stock exchange, philippines"] PSE EDGE disclosures | Filings/disclosures | Public | Portal | EN | Company + documents | Ongoing | Central listing disclosure hosting | Explicit non-commercial use constraints likely impede productization | Med | High | Medium | Low–Med | PSE website states materials downloadable for personal, non-commercial use citeturn6search27turn6search3 |
| Philippines | entity["organization","Philippine Economic Zone Authority","investment agency, philippines"] Economic Zone Locator | Industrial zones / facility proxy | Public | Web locator | EN | Zone-level data | Ongoing | High value for OSAT/back-end footprint mapping | Zone ≠ facility; still needs company mapping | Med | Low | Medium | Medium | PEZA provides “Economic Zone Locator” citeturn8search2turn8search25 |
| Philippines | PEZA locator/enterprise lists (spreadsheets) | Zone/company roster proxies | Public (varies) | XLS files / portals | EN | Company lists | Periodic | Very high leverage for “who operates in which zone” | Data hygiene issues; inconsistent coverage | Med | Medium | Medium–High | Medium | Example enterprise XLS published as downloadable citeturn8search6turn8search14 |
| Philippines | entity["organization","Philippine Statistics Authority","statistics agency, philippines"] trade statistics pages | Trade proxies | Public | Reports/datasets | EN | Macro + commodity | Monthly/annual | Official trade narratives + long historical tables | Not shipment-level | Low–Med | Low | Medium | Medium | PSA provides Foreign Trade Statistics and regular releases citeturn16search1turn16search5 |
| entity["country","Vietnam","country in southeast asia"] | entity["organization","Ho Chi Minh Stock Exchange","stock exchange, vietnam"] information disclosure portal | Filings/disclosures | Public | Web portal | EN/VN | Company + notices | Ongoing | Official disclosure channel | English completeness varies; PDFs; site reliability varies | Medium | Medium | Medium | Medium | HSX provides “Information Disclosure” and violations lists citeturn7search6turn7search2 |
| Vietnam | National Business Registration Portal (MPI) | Corporate registry | Public | Web search portal | EN/VN | Entity identity basics | Ongoing | Official registry entry point (high value for entity validation) | Site availability can be inconsistent; data completeness varies | Medium | Medium | Medium | Medium | Official “Enterprise search” portal exists in English citeturn14search0turn14search4 |
| Vietnam | Vietnam Customs statistics pages | Trade proxies | Public | Web reports | EN/VN | Macro trade stats | Periodic | Official customs narrative and figures | Limited bulk access | Medium | Medium | Medium | Medium | Vietnam Customs publishes trade stats articles/updates citeturn16search6turn16search2 |
| Vietnam | National Statistics Office import/export tables | Trade proxies | Public | Web tables | EN | Country-level import/export tables | Periodic | Alternative official source for trade context | May be higher-level than customs | Low–Med | Low | Low–Medium | Medium | NSO provides import/export data tables citeturn16search10turn16search14 |
| entity["country","Thailand","country in southeast asia"] | entity["organization","Stock Exchange of Thailand","stock exchange, thailand"] One Report Data | Structured annual reporting | Public/paid tiers | API / JSON download | EN/TH | Company-level structured annual report | Ongoing | Extremely high leverage: structured JSON designed for reuse | Terms for redistribution; coverage starts 2021 | Low | Medium | High | High | “Receive data via API or download… in JSON… available since 2021” citeturn20view1turn7search9 |
| Thailand | entity["organization","Securities and Exchange Commission Thailand","securities regulator, thailand"] Form 56‑1 One Report | Disclosure regime | Public | Guidance pages / filings by firms | EN/TH | Company annual disclosure | Annual | Provides consistent disclosure target | Actual data access depends on SETLink/MDB; not always open | Medium | Medium | Medium | Medium | SEC describes One Report’s purpose and disclosure efficiency citeturn7search5turn7search1 |
| Thailand | Thai Customs trade statistics | Trade proxies | Public | Web query + CSV export | EN | Commodity-level trade stats | Monthly | Official and supports CSV export | HS mapping required; usability quirks | Medium | Medium | Medium | Medium | Interface supports export CSV and notes HS code detail constraints citeturn21view1 |
| Thailand | entity["organization","Industrial Estate Authority of Thailand","industrial estates authority, thailand"] estate directory | Industrial estates (facility proxy) | Public | Web directory | EN/TH | Estate list + location | Ongoing | Useful for clustering and site validation | Estate presence ≠ semiconductor facility presence | Medium | Low | Medium | Medium | IEAT lists estates and contact/location information citeturn19search3 |
| entity["country","Israel","country in middle east"] | entity["organization","Tel Aviv Stock Exchange","stock exchange, israel"] MAYA disclosures | Filings/disclosures | Public | Portal | EN/HE | Company disclosures | Ongoing | English MAYA improves accessibility | Coverage depends on issuer-provided translations | Medium | Medium | Medium | Medium | TASE notes English translations prepared by issuers; MAYA is disclosure system citeturn7search3turn7search7 |

## High-Leverage Non-Obvious Findings

Asia’s best “facility truth anchors” are not financial filings—they are **PRTR-style environmental portals and industrial-park/zone rosters**.

Taiwan’s PRTR portal is unusually explicit about how it integrates pollution-source permit/declaration data into a single public inquiry system and how it expands disclosure and updates to keep data consistent citeturn21view2. For a semiconductor risk graph, this is a powerful validation layer: it lets you assert “this facility exists, is regulated, and is operated by X” with higher confidence than many commercial “market maps,” even if you still cannot assert “X supplies Y.”

Thailand is unusually strong for structured corporate disclosure because SET’s One Report data product is designed for JSON/API delivery, with stated availability since 2021 citeturn20view1. This is “graph-friendly” and suggests an ingestion architecture closer to “data product subscription” than “document scraping.” It also creates a realistic path to recurring, versioned ingestion of governance/operations sections that often mention capacity expansions, capex plans, and site locations.

Hong Kong’s open data ecosystem includes a **science park company list with a real-time JSON API** (HKSTP Company Directory) citeturn20view2. That is an unusually direct way to anchor a cluster of electronics/semiconductor-adjacent tenants, and it has clearly stated API availability and update frequency. The key caution is semantic: presence in a park is not the same as a fab/OSAT, so you must treat it as a facility-proxy claim, not a facility-type fact.

Singapore quietly improved entity-resolution operability via **ACRA’s Business Profile API** (launched Nov 2025), explicitly providing UEN, entity name, incorporation dates, and business activities with automated access for high-volume users citeturn6search13turn6search9. For a future product, this is the kind of source that can turn “manual company lookups” into a reliable identity backbone (provided you can afford and license it).

China’s structured disclosure is “patchy but real” if you look beyond obvious portals. Some Shanghai Stock Exchange pages explicitly state that displayed financial data comes from reports submitted in XBRL format citeturn13search2. That implies you can sometimes ingest structured data without OCR—though in practice you should expect a hybrid of structured fields + PDFs.

A critical cautionary point: **licensing can silently destroy productization**. The Philippine Stock Exchange site explicitly states materials may be accessed/downloaded only for **personal, non-commercial use** citeturn6search27. Similarly, WSTS product classification documents explicitly indicate limited distribution to members/licensees/subscribers citeturn11view0. In v1, you can use such sources for research, but you should treat them as *replaceable* and build your internal model so it does not depend on them as a proprietary “core taxonomy.”

## Recommended Semiconductor Taxonomy For V1

This taxonomy is designed for **normalization + graph loading**. It is intentionally constrained: “enough to support chokepoints and risk reasoning” without becoming an encyclopedia.

### Top-level segments

For v1, use eight top-level segments as the smallest set that still reflects real chokepoints:

**Design and software**
- Fabless design
- EDA tools
- Semiconductor IP (CPU/GPU/AI accelerators interfaces, SerDes, memory controllers, etc.)
- Design services (layout, verification, tapeout support)

**Front-end manufacturing**
- Foundry services
- IDM front-end manufacturing (internal + merchant where applicable)
- Memory manufacturing (merchant)
- Specialty/analog/power manufacturing

**Back-end manufacturing**
- OSAT (assembly + test services)
- Advanced packaging specialists (2.5D/3D, fan-out, interposers)
- Test services (if separable)

**Wafers and substrates**
- Silicon ingots/boules (upstream)
- Silicon wafer manufacturing (150/200/300mm)
- Epitaxy wafers / SOI wafers
- Compound semiconductor substrates (SiC, GaN, GaAs)

**Materials (chemicals and consumables)**
- Photoresists and lithography chemicals
- Specialty gases
- Wet chemicals (etch/clean)
- CMP slurries/pads
- Sputter targets and deposition precursors

**Manufacturing equipment**
- Lithography
- Etch
- Deposition (CVD/PVD/ALD)
- CMP
- Ion implantation
- Thermal processing
- Cleaning
- Metrology/inspection
- Test equipment
- Packaging equipment

**Masks and reticles**
- Photomask blanks
- Photomasks/reticles
- Mask services (mask data prep)

**Policy and controls overlay**
- Export controls and restricted party lists
- End-user lists
- Controlled item lists (dual-use)

This segmentation is compatible with OECD’s emphasis on distinguishing chip types (logic/memory/analog/others) and facility attributes for a semiconductor production database citeturn10view0.

### Second-level categories and what to defer

**Chip type taxonomy (for outputs of front-end manufacturing)**
Adopt OECD’s four top categories for v1 outputs:
- CHIP.LOGIC
- CHIP.MEMORY
- CHIP.ANALOG
- CHIP.OTHER citeturn10view0

Add only a minimal second level that supports chokepoint analysis:
- Under LOGIC: general compute vs specialized (AI/accelerators) vs microcontrollers
- Under MEMORY: DRAM vs NAND vs other memory
- Under ANALOG: power vs signal-chain/mixed-signal
- Under OTHER: sensors, optoelectronics, discretes (keep coarse)

OECD explicitly frames the four broad categories plus sub-categories as a common taxonomy for harmonized data collection citeturn10view0; v1 should stay close to that spirit to avoid rework.

**Where WSTS helps (but should not be your primary internal taxonomy)**
WSTS provides very detailed product categories (discretes/optoelectronics/sensors and many IC subcategories) and formal definitions of “semiconductor products” in packaged and unencapsulated tested form citeturn11view0. The issue is not usefulness; it is productization risk because the document itself states limited distribution to WSTS members/licensees/subscribers citeturn11view0. Treat WSTS as:
- a **reference crosswalk** for market-language alignment, and
- a **bridge layer** when you ingest third-party market datasets already in WSTS categories,
not as your canonical taxonomy.

**Facility-type taxonomy (v1)**
Facility types should be explicit and limited to what you can validate operationally.

Recommended facility type codes (examples):
- FAC.FAB (front-end wafer fab)
- FAC.MEM_FAB (memory-dominant fab) *(optional; otherwise use output CHIP categories)*
- FAC.OSAT (assembly/test site)
- FAC.PACKAGING (packaging-only)
- FAC.TEST (test-only)
- FAC.WAFER_PLANT (silicon wafers)
- FAC.SUBSTRATE_PLANT (substrates/interposers)
- FAC.MASK_SHOP (photomasks/reticles)
- FAC.CHEMICALS_PLANT
- FAC.GASES_PLANT
- FAC.EQUIPMENT_FACTORY (manufacturing equipment production—optional for v1)
- FAC.RND_CENTER

Facility attributes (v1 “must-have”):
- operator_company_id
- site_name (as disclosed)
- address + geocode
- country/region
- facility_type_code
- operational_status (operating / under construction / announced)
- evidence pointers (filing, PRTR listing, industrial park roster, etc.)

OECD emphasizes that facility classification should include technology/capability and capacity characteristics for semiconductor production databases citeturn10view0. For v1, keep “capability” minimal (see next section) and treat capacity as optional when unverifiable.

**Process-stage taxonomy (v1)**
Use these stages to normalize relationships and claims:
- STAGE.DESIGN
- STAGE.TAPEOUT
- STAGE.WAFER_FAB
- STAGE.MASKS
- STAGE.WAFER_SORT
- STAGE.PACKAGE_ASSEMBLY
- STAGE.PACKAGE_TEST
- STAGE.FINAL_TEST
- STAGE.DISTRIBUTION

OECD includes a “primer on the semiconductor value chain” and “semiconductor production stages” framing as part of its taxonomy context citeturn10view0. The above stage list is compatible with that but extends to back-end explicitly.

### Multi-role company treatment

Multi-role companies are the norm (IDMs, vertically integrated materials conglomerates, equipment makers with services, OSATs with substrate units, etc.). In normalization, represent roles as **many-to-many** with explicit evidence.

Recommended approach:
- Company table is identity (canonical entity).
- CompanyRole table: (company_id, role_code, start_date?, end_date?, evidence_id).
- Roles can be facility-scoped: CompanyFacilityRole (facility_id, role_code) when a conglomerate has mixed site functions.

### Product/material/equipment taxonomy (what is supplied)

This is the minimal, analytically useful “what is supplied” taxonomy for v1.

Top-level item classes:
- ITEM.SERVICE
- ITEM.PHYSICAL_GOOD
- ITEM.SOFTWARE
- ITEM.IP
- ITEM.DATA (optional, for things like mask data prep deliverables)

Within ITEM.SERVICE:
- SERVICE.FOUNDRY_WAFER_FAB
- SERVICE.MASK_MAKING
- SERVICE.PACKAGING_ASSEMBLY
- SERVICE.ADVANCED_PACKAGING
- SERVICE.TEST
- SERVICE.DESIGN_SERVICES
- SERVICE.EQUIPMENT_MAINTENANCE *(often disclosed as “services revenue”)*

Within ITEM.PHYSICAL_GOOD:
- GOOD.SILICON_WAFER
- GOOD.EPI_WAFER
- GOOD.SOI_WAFER
- GOOD.SIC_SUBSTRATE / GOOD.GAN_SUBSTRATE
- GOOD.PHOTOMASK / GOOD.MASK_BLANK
- GOOD.PHOTORESIST
- GOOD.SPECIALTY_GAS
- GOOD.WET_CHEMICAL
- GOOD.CMP_SLURRY_PAD
- GOOD.SPUTTER_TARGET
- GOOD.ABF_SUBSTRATE / GOOD.BT_SUBSTRATE / GOOD.LEADFRAME / GOOD.INTERPOSER
- GOOD.WAFER_FAB_EQUIPMENT (then subclass by tool family)
- GOOD.BACKEND_EQUIPMENT (then subclass)

Within equipment tool families (v1):
- TOOL.LITHOGRAPHY
- TOOL.ETCH
- TOOL.DEPOSITION
- TOOL.CMP
- TOOL.IMPLANT
- TOOL.CLEAN
- TOOL.METROLOGY_INSPECTION
- TOOL.THERMAL
- TOOL.TEST_EQUIPMENT
- TOOL.PACKAGING_EQUIPMENT

Within ITEM.SOFTWARE:
- SW.EDA (with optional modules: synthesis, P&R, verification, signoff)
- SW.MASK_DATA_PREP *(if you model it as software vs service)*

Within ITEM.IP:
- IP.CPU_CORE
- IP.GPU_CORE
- IP.NPU_ACCELERATOR
- IP.SERDES
- IP.MEMORY_INTERFACE
- IP.ANALOG_IP
- IP.PHY_IP

Attributes that should attach to item categories (v1 “most useful”):
- node_nm (optional; use ranges if uncertain) — aligns with OECD’s focus on nodes in taxonomy context citeturn10view0
- wafer_diameter_mm (150/200/300) for wafer fab and wafers
- package_type (optional; limited enum)
- material_system (Si, SiC, GaN, GaAs) — WSTS explicitly recognizes multiple semiconductor materials/technologies in its definitions citeturn11view0
- export_control_flag (optional; derived from control lists)

What is not worth modeling yet (explicitly defer):
- Full bill-of-materials decomposition for electronics end-products
- Exact volumes and prices (rarely disclosed, high noise)
- Node-level detail everywhere (store where disclosed; don’t require)
- Full tool model numbers (store optionally as free text if surfaced)

## Recommended Claim Predicate Vocabulary

A supply-chain graph that is evidence-backed and time-aware needs a predicate set that separates: (a) corporate structure, (b) operational relationships, (c) facility anchoring, (d) restriction overlays, and (e) inference/proxy edges.

Below is a concrete v1 predicate set designed for **claim records** (reifiable, evidence-backed), which can later be projected into graph edges.

### Predicate set (v1)

**Corporate and control**
- `OWNS` — subject: Company; object: Company/Facility. Use for equity ownership when evidenced (registry, filings). Avoid for “has a stake” without %.
- `SUBSIDIARY_OF` — subject: Company; object: Company. Use when parent-child relationship is directly stated.
- `JOINT_VENTURE_WITH` — subject: Company; object: Company. Use when JV is explicit; store JV entity as separate Company when possible.

**Facility anchoring**
- `OPERATES_FACILITY` — subject: Company; object: Facility. Use when facility operated by company (PRTR operator listings; park directories; filings).
- `FACILITY_LOCATED_IN` — subject: Facility; object: Country/Region. Use for geographic normalization.
- `FACILITY_HAS_STATUS` — subject: Facility; object: Status enum (OPERATING/CONSTRUCTION/ANNOUNCED/IDLED). Use with dated evidence.

Taiwan’s PRTR portal explicitly frames regulated “listed pollution source” inquiry and integrated data across domains citeturn21view2, making it a strong evidence source for `OPERATES_FACILITY` and location anchoring.

**Operational supply relationships (direct)**
- `SUPPLIES_MATERIAL_TO` — subject: Company/Facility; object: Company/Facility. Use only when disclosures explicitly name customer or include credible documentary evidence.
- `SUPPLIES_COMPONENT_TO` — same, but for substrates, photomasks, etc.
- `PROVIDES_EQUIPMENT_TO` — equipment vendor → fab/OSAT. Often disclosed in press releases and customer case studies; treat carefully.
- `PROVIDES_SERVICE_TO` — for services like packaging/test/design services.

**Semiconductor-specific operational relationships**
- `FABRICATES_FOR` — foundry/fab facility → customer company. Use when named in disclosures, or when there is a strong evidence chain (e.g., customer explicitly states manufacturing partner).
- `PACKAGES_FOR` — OSAT/facility → customer.
- `TESTS_FOR` — test provider → customer.
- `PROVIDES_PDK_TO` — foundry → design company (PDK availability is often public; relationship can be “capability/availability” vs “commercial dependency”).
- `LICENSES_IP_TO` — IP provider → integrator/fabless/IDM (usually contractual; often partially disclosed).
- `USES_EQUIPMENT_FROM` — facility → equipment company. This is often inferential unless explicitly disclosed; treat as proxy unless directly evidenced.

**Dependency / inference / proxy predicates**
- `DEPENDS_ON` — subject: Company/Facility; object: ItemCategory/Company/Facility. Use **only as a typed claim** with confidence score and inference method recorded.
- `HAS_SINGLE_SOURCE_RISK_FROM` — subject: Company/Facility; object: Company/Facility. Use when credible evidence indicates single-source or extreme concentration; otherwise avoid.
- `EXPOSED_TO_EXPORT_CONTROL` — subject: Company/Facility/ItemCategory; object: ExportControlRegime/List. Use for overlay edges.

Japan’s METI End User List is explicitly for enhancing catch-all controls by providing referential information about foreign entities of concern citeturn17search8; Taiwan publishes export control lists for dual-use items and military lists citeturn17search3; Singapore maintains a Strategic Goods Control List framework citeturn17search2turn17search38. These support `EXPOSED_TO_EXPORT_CONTROL` and related overlay predicates.

### When to use vs not use, and fact vs proxy

Operational reality: direct supplier-customer edges are often private. Therefore:

- Use **direct predicates** (`FABRICATES_FOR`, `PACKAGES_FOR`, `SUPPLIES_MATERIAL_TO`) only when the relationship is explicit in filings, official disclosures, or reliably attributable sources.
- Use **proxy predicates** (`DEPENDS_ON`, `USES_EQUIPMENT_FROM`) only when you can state the inference method (e.g., “facility tool install base inferred from public tool qualification announcements”).
- For any proxy/inference predicate, store:
  - `inference_method` (enum)
  - `confidence` (0–1)
  - `time_scope`
  - `evidence_bundle_id`

This aligns with the report-I foundation (graph as projection, claims/provenance first-class) while making the predicate vocabulary actionable.

## Mapping To External Standards

External standards are most useful as **bridge layers** (for joining datasets and enabling trade/procurement overlays), not as the internal semantic core.

### HS / HTS

Use HS/HTS codes for:
- trade-based proxies (import/export flows) and
- coarse item mapping for “what is supplied.”

Examples:
- HS heading **8542** is “Electronic integrated circuits” in HS 2017 citeturn12search3.
- OECD’s taxonomy document includes an annex with HS codes relevant to semiconductor products citeturn10view0.

Do **not** use HS/HTS as your primary internal taxonomy because:
- it does not encode node, wafer diameter, packaging form factor, or whether a relationship is foundry service vs physical shipment.
- it can blur critical chokepoints (e.g., advanced lithography tools vs generic machinery).

Practice: maintain a table `bridge_hs_item_map` mapping HS code sets → your `ITEM_*` categories with a “lossiness” rating.

### NAICS / NACE / ISIC

Use these for:
- “company role hints” and
- scanning national registries or statistical datasets.

But do not let them drive roles: they are too coarse for multi-role semiconductor firms.

Example: NAICS 334413 describes “Semiconductor and Related Device Manufacturing” and includes products like integrated circuits, memory chips, microprocessors, diodes, transistors, etc. citeturn12search8. NACE 26.11 includes manufacture of semiconductors and other electronic components citeturn12search1turn12search33. These are helpful as *weak priors* but not as definitive role assignments.

Practice: store them as:
- `company_external_classification` records with `source`, `code`, and `confidence`, not as the canonical truth.

### CPC (patent classification) and patent evidence

Patent classifications are valuable for:
- technology capability signals, and
- aligning R&D footprints with process/tool categories.

Example: USPTO CPC definitions for semiconductor device classes (H01L/H10 family) describe coverage of discrete and integrated semiconductor devices and related manufacturing/treatment citeturn12search2turn12search14.

You can ingest patents via official Asia portals:
- J‑PlatPat (Japan) citeturn18search0
- KIPRIS (Korea) and KIPRIS Plus API/bulk citeturn18search1turn18search29
- CNIPA patent systems citeturn18search7turn18search3
- TIPO search endpoints citeturn18search2

But patents should generally support **capability claims** (e.g., “works on SiC power devices”), not direct supplier/customer edges.

### CPC / UNSPSC-like procurement categories

If you later ingest procurement or equipment catalogs, consider using the UN Central Product Classification (CPC) as a bridge. Example CPC 44918 explicitly describes “machines and apparatus … for manufacture of semiconductor boules or wafers, semiconductor devices, electronic integrated circuits…” citeturn12search6. This is useful for bridging industrial statistics and trade datasets to your `TOOL_*` families.

## Operability And Ingestion Guidance

This section is intentionally pragmatic: what is realistically ingestible in 2026 without building a brittle web-scraping empire.

### High-operability “recurring ingestion” sources (recommended anchors)

**Structured disclosure APIs / data products**
- OpenDART (Korea): built for reuse and provides multiple formats citeturn5search4turn5search0.
- EDINET (Japan): API specs and code lists are versioned publishables citeturn22view0.
- SET One Report Data (Thailand): declared JSON/API delivery citeturn20view1.
- TWSE Data E‑Shop (Taiwan): paid but explicit “MOPS Push Server Service” and packaged XBRL citeturn20view0.

**Trade statistics portals (country-level)**
Japan’s MoF trade stats support data download citeturn15search2turn15search6. Taiwan provides official trade statistics portals with Excel export described citeturn15search16. Thailand’s customs portal supports CSV export citeturn21view1. These are viable for recurring “trade overlay refresh” even though they remain HS-limited.

**Facility anchoring via PRTR and similar**
Taiwan PRTR is a particularly explicit facility anchoring system citeturn21view2; Korea PRTR is a comparable structured anchor citeturn5search7. These are among the best Asia facility-validation sources because they are “regulator-backed,” not marketing-driven.

Operationally: build adapters that extract facility/operator/address fields, then push into your normalized `facility_registry` as **evidence-backed facts**.

### Medium-operability sources (hybrid automation + review)

**Exchange or regulator portals with PDFs**
HKEXnews citeturn7search0 and CNINFO citeturn13search0turn13search11 typically require PDF harvesting and robust document parsing. Use change-detection feeds (HKEX RSS) to minimize crawling and focus on deltas citeturn7search8.

**Industrial park and zone directories**
These are often searchable web directories that are easy to scrape but have semantic ambiguity (presence vs facility type). Example: Southern Taiwan Science Park company roster citeturn8search5, PEZA ecozone locator citeturn8search2, and IEAT estate listings citeturn19search3.

Operationally: ingest as **facility-proxy claims** (e.g., “company has site in industrial zone/park”) with lower confidence than PRTR, unless corroborated.

### High-risk / fragile sources to avoid depending on for v1

**Portals with strict non-commercial language or unclear redistribution rights**
PSE materials are explicitly restricted to personal/non-commercial use citeturn6search27. That may still be acceptable for a private research prototype, but it is a red flag as a long-term foundational dependency.

**Heavily captcha’d corporate registries**
China’s NECIPS is foundational but often difficult to automate at scale citeturn4search20turn4search8. Vietnam’s registry portal exists in English citeturn14search0turn14search4, but in practice, reliability and scrape-friendliness can vary.

Operationally: treat these as **manual verification tools** in v1. Automate later only if you can do it legally and reliably.

### OCR and translation realism (Asia-specific)

Expect that:
- Korean, Japanese, and Chinese filings will frequently contain scanned tables or images.
- Even where APIs exist, narrative sections remain unstructured.

Therefore:
- Prefer structured feeds where available (OpenDART, EDINET XBRL/instances, SET JSON) citeturn5search4turn22view0turn20view1.
- Store documents in original language and do **selective translation** only for extracted fields and evidence snippets.

## Implications For The Data Pipeline

These findings imply several non-negotiable pipeline capabilities if you want to support Asia-heavy coverage without architectural debt.

### Multilingual ingestion as a core capability

You will need:
- language detection,
- per-language extraction prompting/heuristics,
- translation with traceability (store original + translated excerpt + translator version),
- entity resolution that supports multilingual aliases (Chinese characters, kana/kanji, romanizations).

EDINET explicitly notes documents are Japanese and suggests browser translation as a user aid citeturn5search1; for a pipeline, that implies you must implement a consistent translation layer if you want normalized claims.

### OCR and document extraction remain unavoidable (but can be minimized)

Even with “structured disclosure islands,” your pipeline must handle PDFs robustly:
- extract tables,
- detect scanned pages,
- OCR selectively (only where necessary),
- preserve page/section provenance.

The pipeline should treat extracted statements as **claims** with evidence pointers, not as unqualified facts.

### Taxonomy management must be separate and versioned

Because you will iteratively refine:
- role codes,
- facility type codes,
- item codes,
- predicate codes,

you need a taxonomy-management layer (even if it is initially a versioned YAML/JSON repo and a migration tool). OECD’s taxonomy was designed to be revised to keep up with semiconductor advances citeturn10view0; your internal taxonomy will require similar planned evolution.

### Source adapters will be “mixed mode”

Plan for three adapter types:
- **API adapters** (OpenDART, EDINET, SET One Report, HKSTP API, ACRA API) citeturn5search4turn22view0turn20view1turn20view2turn6search13
- **Portal harvesters** (HKEXnews, CNINFO, industrial park directories) citeturn7search0turn13search0turn8search5
- **Document-centric pipelines** (EIAs, annual reports, press releases) citeturn9search3turn6search4

### Manual adjudication workflows are not optional

You will need human-in-the-loop for:
- entity resolution collisions (especially subsidiaries with similar names),
- facility/operator matching (PRTR operator vs corporate legal entity),
- supplier-customer relationship claims (distinguishing direct evidence vs proxy inference),
- contradiction handling (multiple filings disagree).

Manual review queues should be first-class objects in your data model.

## Recommended Changes To Our Current Plan

These changes are specifically motivated by Asia coverage + operability constraints surfaced here.

### Add to the Asia v1 source stack

Adopt as “core recurring ingestion”:
- OpenDART (Korea) citeturn5search4turn5search0
- EDINET API (Japan) citeturn22view0
- SET One Report Data JSON/API (Thailand) citeturn20view1
- TWSE MOPS via official paid push/bulk service where budget allows (Taiwan) citeturn20view0

Add as “facility truth anchors”:
- Taiwan PRTR citeturn21view2
- Korea PRTR citeturn5search7
- (Optional) industrial park rosters as lower-confidence facility proxies (STSP, PEZA, IEAT) citeturn8search5turn8search2turn19search3

### Make taxonomy versioning explicit in the pipeline plan

Treat taxonomy as a governed asset:
- store code sets in a versioned repository,
- run migrations for normalized tables,
- stamp every claim with the taxonomy version used at extraction time.

This is especially important because you’ll bridge to HS/industry/patent codes and those standards change (HS revisions, local tariff codes, etc.). OECD’s taxonomy explicitly anticipates revisions citeturn10view0.

### Reframe some sources as “research-only” to protect productization

Explicitly label sources as:
- Research-only (potentially non-commercial use constraints), e.g., some exchange website content citeturn6search27
- Commercializable with licensing (ACRA API, TWSE Data E-Shop, SET redistribution tiers) citeturn6search13turn20view0turn20view1
- Public/government open data (PRTR, customs trade stats, data portals) citeturn21view2turn15search2turn20view2

This reduces the risk that you build the “core identity spine” on something you cannot legally ship later.

## Concrete Next Steps

1. Decide the v1 **Asia ingestion spine**: implement adapters for OpenDART, EDINET API, and SET One Report JSON first, because they are the highest operability and provide recurring structured updates citeturn5search4turn22view0turn20view1.

2. Stand up a **taxonomy repository** (versioned) containing:
   - `role_codes_v1`
   - `facility_type_codes_v1`
   - `process_stage_codes_v1`
   - `item_codes_v1`
   - `predicate_codes_v1`
   and define a migration/compatibility plan.

3. Build a minimal **facility registry pipeline** using Taiwan PRTR + one industrial-park roster (e.g., STSP) to test entity matching and facility canonicalization in Asia citeturn21view2turn8search5.

4. Implement an **evidence record schema** and store:
   - raw doc (pdf/html snapshot),
   - extracted excerpt (original language),
   - translation (if performed),
   - extraction method metadata.

5. Create a **manual adjudication UI backlog** (even a lightweight internal tool) to resolve:
   - company identity merges/splits,
   - facility/operator mapping,
   - claim acceptance/rejection.

6. Run a pilot: pick ~25 Asia-heavy companies (foundries, OSATs, substrate/material suppliers) and build end-to-end ingestion → normalized tables → graph projection, measuring:
   - % structured vs PDF/OCR extraction,
   - time spent per source adapter,
   - error rates and manual review volume.

7. Only after the pilot, decide whether to pay for:
   - TWSE MOPS push service (Taiwan) citeturn20view0
   - ACRA API subscription (Singapore identity) citeturn6search13
   based on how often identity resolution and filings ingestion block progress.

## Appendix

### Key source links referenced in this report (by category)

**Structured disclosures / filings**
- Korea OpenDART citeturn5search4turn5search0  
- Japan EDINET API materials citeturn22view0  
- Thailand SET One Report Data citeturn20view1  
- Taiwan TWSE Data E‑Shop (MOPS push service) citeturn20view0  
- Hong Kong HKEXnews citeturn7search0turn7search8  
- China CNINFO citeturn13search0turn13search11  
- China Shanghai Stock Exchange XBRL-derived pages citeturn13search2  

**Facility validation / industrial clusters**
- Taiwan PRTR portal citeturn21view2  
- Korea PRTR portal citeturn5search7  
- Southern Taiwan Science Park company roster citeturn8search5  
- Philippines PEZA Economic Zone Locator citeturn8search2  
- Thailand IEAT estate directory citeturn19search3  
- Hong Kong HKSTP Company Directory API citeturn20view2  

**Trade statistics**
- Japan MoF trade statistics download citeturn15search2turn15search6  
- Taiwan ITA trade statistics portal citeturn15search16  
- China GACC customs stats portal citeturn4search3  
- Thailand customs stats portal citeturn21view1  
- Philippines PSA trade statistics citeturn16search1turn16search5  

**Export controls / restricted parties**
- Japan METI End User List updates citeturn17search8  
- Taiwan export control lists for dual-use/military citeturn17search3turn17search23  
- Singapore Strategic Goods Control List framing and order updates citeturn17search2turn17search38  

**Taxonomy anchors**
- OECD “Chips, nodes and wafers” taxonomy citeturn10view0  
- HS 8542 integrated circuits (UN Stats) citeturn12search3  
- WSTS product classification definitions (licensing caveat) citeturn11view0  

### Suggested identifier fields (Asia-relevant)

Company identifiers (store as many as are available; treat as attributes, not keys):
- `lei` (where available; often weaker in parts of Asia)
- `ticker` + `exchange_code`
- `japan_edinet_code` (Japan EDINET code list exists) citeturn22view0
- `korea_corp_code` (OpenDART corp code concept; used across DART APIs) citeturn5search4turn5search16
- `singapore_uen` (ACRA Business Profile API provides UEN) citeturn6search13
- `vietnam_business_registration_id` (from National Business Registration Portal) citeturn14search0
- `malaysia_ssm_registration_number` (SSM portals) citeturn14search3turn14search15

Facility identifiers:
- `facility_local_registry_id` (PRTR record id if present)
- `facility_name_as_disclosed`
- `address_normalized`
- `lat`/`lon`

### Candidate role codes (v1)

- ROLE.FABLESS  
- ROLE.IDM  
- ROLE.FOUNDRY  
- ROLE.MEMORY_MANUFACTURER  
- ROLE.ANALOG_POWER_MANUFACTURER  
- ROLE.OSAT  
- ROLE.PACKAGING_SPECIALIST  
- ROLE.TEST_SERVICE  
- ROLE.WAFER_MANUFACTURER  
- ROLE.SUBSTRATE_MANUFACTURER  
- ROLE.PHOTOMASK_SUPPLIER  
- ROLE.CHEMICALS_SUPPLIER  
- ROLE.SPECIALTY_GASES_SUPPLIER  
- ROLE.EQUIPMENT_SUPPLIER  
- ROLE.EDA_VENDOR  
- ROLE.IP_VENDOR  

### Candidate facility type codes (v1)

- FAC.FAB  
- FAC.OSAT  
- FAC.PACKAGING  
- FAC.TEST  
- FAC.WAFER_PLANT  
- FAC.SUBSTRATE_PLANT  
- FAC.MASK_SHOP  
- FAC.CHEMICALS_PLANT  
- FAC.GASES_PLANT  
- FAC.RND_CENTER  

### Candidate product/material/equipment codes (v1)

Chip outputs (OECD-aligned):
- CHIP.LOGIC  
- CHIP.MEMORY  
- CHIP.ANALOG  
- CHIP.OTHER citeturn10view0  

Items:
- GOOD.SILICON_WAFER / GOOD.EPI_WAFER / GOOD.SOI_WAFER  
- GOOD.SIC_SUBSTRATE / GOOD.GAN_SUBSTRATE  
- GOOD.PHOTOMASK / GOOD.MASK_BLANK  
- GOOD.PHOTORESIST / GOOD.WET_CHEMICAL / GOOD.SPECIALTY_GAS  
- GOOD.ABF_SUBSTRATE / GOOD.BT_SUBSTRATE / GOOD.LEADFRAME / GOOD.INTERPOSER  
- TOOL.LITHOGRAPHY / TOOL.ETCH / TOOL.DEPOSITION / TOOL.CMP / TOOL.IMPLANT / TOOL.CLEAN / TOOL.METROLOGY_INSPECTION / TOOL.THERMAL / TOOL.TEST_EQUIPMENT / TOOL.PACKAGING_EQUIPMENT  
- SW.EDA  
- IP.CPU_CORE / IP.GPU_CORE / IP.NPU_ACCELERATOR / IP.SERDES / IP.MEMORY_INTERFACE  

### Candidate predicate codes (v1)

Corporate/control:
- OWNS, SUBSIDIARY_OF, JOINT_VENTURE_WITH

Facility:
- OPERATES_FACILITY, FACILITY_LOCATED_IN, FACILITY_HAS_STATUS

Operational:
- SUPPLIES_MATERIAL_TO, SUPPLIES_COMPONENT_TO, PROVIDES_EQUIPMENT_TO, PROVIDES_SERVICE_TO  
- FABRICATES_FOR, PACKAGES_FOR, TESTS_FOR, LICENSES_IP_TO, PROVIDES_PDK_TO

Overlay/inference:
- DEPENDS_ON, HAS_SINGLE_SOURCE_RISK_FROM, EXPOSED_TO_EXPORT_CONTROL

### Example evidence record fields (practical minimum)

- `evidence_id` (uuid)  
- `source_system` (e.g., OPEN_DART / EDINET / SET_ONE_REPORT / PRTR_TW / HKEXNEWS)  
- `source_url` (stored internally)  
- `retrieved_at` (timestamp)  
- `document_hash`  
- `content_type` (pdf/html/json)  
- `language`  
- `excerpt_original` (text)  
- `excerpt_translation_en` (text, optional)  
- `page_number` / `section_path` (when relevant)  
- `parser_version`  
- `extraction_method` (enum: structured_json, xbrl_parse, pdf_text, ocr, manual)  

### Example relationship/claim fields (graph-ready, rebuildable)

- `claim_id` (uuid)  
- `predicate_code`  
- `subject_entity_id` (company or facility)  
- `object_entity_id` (company/facility/item_category/export_control_list)  
- `item_code` (optional but strongly recommended for supply relationships)  
- `process_stage_code` (optional)  
- `facility_context_id` (optional)  
- `time_start` / `time_end` (nullable)  
- `claim_type` (FACT / PROXY / INFERENCE)  
- `confidence` (0–1)  
- `inference_method` (nullable)  
- `evidence_ids` (array)  
- `notes`  

## Best Practical Recommendation After Report II

If you want to move fastest in 2026 without painting yourself into a corner, start with a small set of Asia sources that are both high-signal and operationally ingestible:

**Asia-heavy sources to start with**
- OpenDART (Korea) as your first non-US/EU filings backbone citeturn5search4turn5search0  
- EDINET API (Japan) as the second backbone; build a Japanese-first extraction pipeline with selective translation citeturn22view0  
- SET One Report JSON/API (Thailand) because it is unusually structured and can accelerate your “claims from disclosures” workflow citeturn20view1  
- Taiwan PRTR as your first Asia facility-truth anchor (then add Korea PRTR) citeturn21view2turn5search7  
- HKEXnews + RSS as a change-detection + document capture feed for Hong Kong-listed semiconductor-adjacent firms citeturn7search0turn7search8  

**Asia-heavy sources that are too fragile or too manual for v1**
- CNINFO as an automated-at-scale dependency: keep it as a targeted capture source for your top companies, not a general crawler citeturn13search0turn13search11  
- High-friction corporate registries (e.g., China’s NECIPS) for automated ingestion—use for manual verification only in v1 citeturn4search20turn4search8  
- Sources with explicit non-commercial constraints (e.g., some exchange website materials) as any “core” backend dependency if commercialization is a goal citeturn6search27  

**Exact v1 taxonomy to adopt first**
- Use the eight top-level segments defined above, and adopt OECD’s four chip output categories (logic/memory/analog/others) as your canonical chip-type layer citeturn10view0  
- Implement the facility type codes and item codes in this report unchanged for v1, with taxonomy versioning on day one.

**Exact predicate vocabulary to adopt first**
- Start with the v1 predicate set listed above, with a strict rule: any supply/dependency claim must carry an `item_code` (unless purely corporate) and have explicit `FACT/PROXY/INFERENCE` typing.

**What the first serious data pipeline should look like (high level)**
- **Ingest layer:** API adapters (OpenDART, EDINET, SET JSON) + portal harvesters (HKEX RSS → fetch docs) + PRTR facility adapter. citeturn5search4turn22view0turn20view1turn7search8turn21view2  
- **Raw store:** immutable snapshots of JSON/PDF/HTML, hashed and timestamped.  
- **Normalization layer:** canonical company registry + facility registry + role assignments + item taxonomy + claim tables.  
- **Human review:** queues for entity resolution, facility matching, and claim adjudication.  
- **Graph projection:** rebuild graph from normalized claims; do not treat the graph as primary storage.

This approach leverages Asia’s most operable structured sources first, uses PRTR/industrial directories to ground facilities credibly, and forces taxonomy/predicate discipline early—reducing the probability of a costly “rewrite the model” moment once you scale beyond a demo.