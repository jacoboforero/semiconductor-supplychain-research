# Semiconductor Supply Chain Graph

Documentation-first reboot of an old project idea: build an evidence-backed graph database for semiconductor supply-chain research.

The long-term goal is to model the semiconductor ecosystem well enough to surface meaningful insights about concentration, chokepoints, policy exposure, and disruption risk. The near-term goal is narrower and more practical: produce a credible v1 that is useful for research and strong enough to demo.

## Current Direction

This project is now scoped around a first useful version:

- a curated set of 200 companies selected across all major supply-chain stages
- a clean entity registry and role taxonomy
- a versioned working taxonomy for roles, facilities, items, and predicates
- support for companies that play multiple roles in the supply chain
- a lightweight facility and geography layer
- evidence-backed dependency relationships
- source selection biased toward stable, high-operability recurring feeds
- a demoable prototype UI for graph exploration and filtering
- enough graph structure to analyze centralized points of failure and other systemic risks

The implementation architecture is intentionally not locked yet. This repository is being set up first as the project source of truth for product framing, research goals, and technical planning.

The repository is also now being shaped explicitly for coding-agent legibility: short root instructions, `docs/` as the durable knowledge base, and scoped guidance for different tools instead of a single giant instruction file.

## Repository Status

The repository is now centered on planning and project definition.

- [docs/README.md](docs/README.md)
- [docs/PROJECT_VISION.md](docs/PROJECT_VISION.md)
- [docs/V1_SCOPE.md](docs/V1_SCOPE.md)
- [docs/RESEARCH_QUESTIONS.md](docs/RESEARCH_QUESTIONS.md)
- [docs/DATA_STRATEGY.md](docs/DATA_STRATEGY.md)
- [docs/RESEARCH_SYNTHESIS.md](docs/RESEARCH_SYNTHESIS.md)
- [docs/SOURCE_STRATEGY.md](docs/SOURCE_STRATEGY.md)
- [docs/V1_TAXONOMY.md](docs/V1_TAXONOMY.md)
- [docs/V1_PRODUCT_BRIEF.md](docs/V1_PRODUCT_BRIEF.md)
- [docs/P0_DATA_CONTRACTS.md](docs/P0_DATA_CONTRACTS.md)
- [docs/REPO_STRUCTURE_PLAN.md](docs/REPO_STRUCTURE_PLAN.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
- [docs/ARCHITECTURAL_DRIVERS.md](docs/ARCHITECTURAL_DRIVERS.md)
- [docs/ARCHITECTURE_NOTES.md](docs/ARCHITECTURE_NOTES.md)
- [AGENTS.md](AGENTS.md)

## What This Project Is Trying To Become

At its core, this project aims to answer questions like:

- where are the most centralized and fragile parts of the semiconductor supply chain
- which companies, countries, and facilities behave like chokepoints
- how concentrated key upstream dependencies are
- how policy, sanctions, and geography alter supply-chain risk

Longer term, this could become more than an internal research repo:

- a research tool for mapping dependency networks and evidence trails
- a service for analysts tracking supply-chain risk and policy shifts
- a platform for scenario analysis, alerts, and historical comparison

## Working Principles

- Evidence over speculation: important nodes and edges should be backed by sources.
- Temporal thinking from the start: relationships change over time.
- Facility awareness matters: company-level graphs alone are too coarse.
- Public-data realism: v1 should be honest about what can and cannot be known from open sources.
- No premature architecture: repo and code structure should follow the data model and workflows, not guess at them.

## Next Planning Milestones

1. Finalize the v1 taxonomy and 200-company segment allocation.
2. Lock the first recurring source spine and critical facility approach.
3. Draft the first real graph data model around the v1 scope.
4. Choose the architecture only after the ingestion and analysis requirements are concrete enough to justify it.

## Current Stage

This repo has now moved into an implementation bootstrap stage.

The planning docs still define the system, but the initial implementation scaffold now exists for:

- the durable pipeline foundation under `src/semisupply/`
- encoded contracts under `contracts/`
- scripts and tests
- a future replaceable UI prototype under `apps/ui-prototype/`
