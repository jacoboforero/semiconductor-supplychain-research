# Research Synthesis

This document consolidates the two deep research reports into the set of planning insights that should shape later architecture work.

It is not a stack decision document. It is the bridge between research and future architecture.

## What Changed After The Research

The two reports materially sharpened the project in five ways:

- The graph should be treated as a rebuildable projection of raw data, normalized registries, and claim/evidence layers.
- Facilities are more important than the original project direction assumed, and regulator-backed facility datasets are unusually valuable.
- Asia coverage can be meaningfully improved without building a scraping-heavy system if the project starts with the right structured disclosure sources.
- Taxonomy and predicate design are not a downstream cleanup task. They are first-class planning inputs.
- Productization risk depends heavily on source choice, especially for licensing, redistribution, and non-commercial restrictions.

## Most Durable Insights

## 1. The Project Is Primarily A Data Normalization And Claim System

The strongest cross-report conclusion is that the hard part is not the graph engine itself. The hard part is building:

- stable entity registries
- stable facility registries
- evidence-backed claim records
- a reproducible graph projection

This reinforces a planning stance where raw sources, normalized tables, and claims are the durable system of record, and the graph is an analytical view over them.

## 2. Facilities Need A Stronger Role In V1

The reports strengthened the case for selective facility modeling.

The most useful insight here is that environmental, emissions, and industrial reporting systems can function as a facility truth layer. They are often better for validating site existence, operator identity, and location than marketing pages or broad market maps.

This matters because many of the research questions depend on facility-level chokepoints rather than company-level abstractions.

## 3. Asia Coverage Is More Operationally Feasible Than It First Appeared

The second report materially improved our understanding of Asia-heavy sources.

The most important insight is that there are structured disclosure islands worth designing around early:

- OpenDART for South Korea
- EDINET for Japan
- SET One Report Data for Thailand
- TWSE MOPS push/bulk services for Taiwan, where budget allows
- HKEX RSS plus targeted document capture for Hong Kong

These are much better architectural anchors than a strategy centered on fragile portal scraping.

## 4. Taxonomy Must Be Governed, Versioned, And Semicon-Specific

The reports pushed the project from “we need taxonomy” to “taxonomy is a core product artifact.”

That means:

- company roles must be controlled and many-to-many
- facility types must be explicit
- item categories must be normalized enough to support supply claims
- predicate codes must distinguish direct facts from proxy or inferred relationships
- mappings to HS, NAICS, ISIC, and other external standards should exist, but they should be bridge layers rather than primary modeling drivers

## 5. Multilingual And Mixed-Mode Ingestion Are Not Optional

If the project is serious about Asia coverage, later architecture will need to assume:

- original-language document retention
- selective translation with traceability
- OCR for the subset of filings or PDFs that demand it
- a mix of API adapters, portal harvesters, and document-centric extraction pipelines

This should influence later system design even before any stack is chosen.

## 6. Human Review Is A Core Workflow, Not A Cleanup Step

The reports both reinforce that manual adjudication will be required for:

- entity resolution collisions
- facility-to-operator matching
- high-value claim validation
- contradiction handling

That means the future system needs to be designed with review queues and correction paths in mind.

## Source Strategy Implications

The reports imply a source strategy based on operability and licensing, not just information richness.

Working categories:

- recurring anchors: stable, structured, reusable sources that justify adapter investment
- hybrid sources: useful but operationally messy, often requiring review
- manual or research-only sources: valuable for targeted research, but poor foundations for the core system

This distinction matters because it prevents the future architecture from being shaped by sources that are rich but fragile.

## What We Understand Well Enough Now

The reports are sufficient to support the next planning layer in these areas:

- the graph should be a projection, not the primary system of record
- claims and evidence should be first-class
- facilities should be modeled selectively but seriously
- the project should bias toward high-operability sources
- taxonomy and predicate vocabularies should be explicit and versioned
- multilingual ingestion must be assumed for Asia-heavy coverage

## What Is Still Open

These are still open planning questions, but they are now much better bounded:

- the exact 200-company inclusion list
- the first critical facility list
- the exact v1 geography cut for recurring ingestion
- which paid sources, if any, are worth early budget
- the exact graph database and storage stack
- the exact UI shape for the prototype

## Is More Research Needed Before Architecture?

Another broad “scan the landscape” report is probably not necessary.

The better follow-up research, if needed later, would be tactical rather than broad:

- a source-operability workbook for the exact v1 sources we choose to ingest first
- a paid-data diligence pass if we decide to evaluate SEMI, ACRA, TWSE, or shipment vendors
- a focused company-selection and critical-facility selection exercise

In other words: the remaining uncertainty is less about discovery and more about selection and execution.

## What To Use Next

- Use [SOURCE_STRATEGY.md](SOURCE_STRATEGY.md) for source prioritization and operability framing.
- Use [V1_TAXONOMY.md](V1_TAXONOMY.md) for the working role, facility, item, and predicate vocabulary.
- Use [ARCHITECTURAL_DRIVERS.md](ARCHITECTURAL_DRIVERS.md) and [ARCHITECTURE_NOTES.md](ARCHITECTURE_NOTES.md) for future architecture decisions.
