# V1 Scope

## V1 Definition

V1 is not "the whole semiconductor supply chain."

V1 is a semiconductor supply-chain risk graph for 200 curated companies that can be used to identify chokepoints, concentration, and disruption risk using public, evidence-backed data.

## What V1 Includes

- a curated list of 200 companies across the major supply-chain stages
- a clean entity registry with canonical names, aliases, and identifiers
- a controlled taxonomy of company roles and supply-chain segments
- a versioned working vocabulary for roles, facility types, item categories, and relationship predicates
- support for companies that participate in multiple segments or roles
- country and geography coverage for all included entities
- a lightweight facility layer for high-value assets such as major fabs, OSAT sites, wafer plants, and critical upstream sites
- evidence-backed dependency relationships where public support exists
- a relationship model that can represent more than generic supply links when evidence exists
- a small set of analytics workflows focused on risk and concentration
- a prototype visual interface for graph exploration, filtering, and demoability

## Working Segment Allocation

This allocation is a planning target, not a locked list:

- 15 `EDA / IP`
- 30 `Fabless`
- 25 `IDM`
- 15 `Foundry`
- 20 `OSAT / Packaging`
- 35 `Equipment`
- 35 `Materials / Wafers / Chemicals / Gases`
- 25 `Test / Metrology / Photomask / Substrate`

Total: 200 companies

The point of this allocation is to avoid a market-cap-heavy list that overrepresents publicly visible designers and underrepresents upstream chokepoints.

The exact working role and predicate vocabulary for v1 now lives in [V1_TAXONOMY.md](V1_TAXONOMY.md).

## What V1 Should Deliver

- a credible company universe for the first build
- enough structure to surface concentration by role and geography
- a graph that can support disruption and blast-radius exploration
- a demo-worthy artifact that is also useful for personal research
- a graph exploration experience that feels like a neat prototype rather than only a backend dataset

## Modeling Expectations

- A company can occupy multiple roles in the supply chain.
- A company can occupy multiple roles globally, and individual facilities may need their own role context.
- The graph should support richer dependency structure than a single generic supply edge.
- Where public evidence exists, relationships should be able to capture what is supplied and optional operational detail such as form, route, or quantity.
- Supply and dependency claims should be typed with explicit predicates and, where relevant, item codes.
- V1 should make room for this richer structure even if many edges remain partially specified.

## Source And Operability Expectations

- V1 should bias toward recurring, high-operability sources rather than fragile broad scraping.
- Asia coverage should start with structured disclosure anchors and regulator-backed facility anchors rather than uniform treatment of every geography.
- Fragile or research-only sources can still be used, but they should not become the foundation of the core system.

## What V1 Explicitly Does Not Try To Do

- model every supplier-customer relationship in the industry
- capture every global fab, OSAT, and facility
- infer private commercial ties as if they were verified facts
- estimate exact company-level trade volumes across the entire chain
- finalize the long-term architecture before the data model is ready

## Success Criteria

V1 is successful if it can support credible analysis of questions like:

- where are the most centralized parts of the chain
- which upstream suppliers appear structurally hard to replace
- which countries or regions dominate critical steps
- what the likely blast radius is if a major node is disrupted

## Immediate Follow-On Work

- lock the working role, facility, item, and predicate vocabulary
- build the first 200-company entity registry
- choose the first recurring source spine for the United States, Europe, and Asia
- draft the first graph model around the v1 entities and claims
