# Semisupply Flow

Semisupply Flow is a product for understanding the semiconductor supply chain as a system.

The goal is simple: make it possible to see how design capability, materials, tooling, wafer fabrication, packaging, and downstream demand fit together, where those flows converge, and which companies or geographies matter most when something breaks.

Most supply-chain material is either too vague to teach the structure or too detailed to be legible. This project is trying to sit in the useful middle. The top-level view should make the industry understandable in minutes. Underneath that, the data model should be strong enough to support real research, scenario analysis, and richer graph views over time.

## What The Product Is Meant To Show

- the high-level shape of the semiconductor supply chain
- where parallel upstream branches converge into manufacturing
- which firms sit in critical positions across the chain
- how dependency links connect representative companies across stages
- where future work can support chokepoint, disruption, and policy analysis

## Current Prototype

The current prototype opens with a systems map rather than a raw company graph.

It has two core views:

- `Structure`: a simplified map of the supply chain that emphasizes branching and convergence
- `Companies`: the same structure populated with representative firms and evidence-backed links

The checked-in demo snapshot currently includes:

- a curated `200`-company universe across major semiconductor stages
- `44` evidence-backed relationships
- `35` connected companies in the built-in demo slice
- a graph-first UI designed for teaching, demos, and rapid iteration

This is not a finished production application yet. The important thing at this stage is getting the product model, the visual model, and the underlying relationship data right.

## Who It Is For

Semisupply Flow is being built for:

- supply-chain and business students trying to understand how the industry fits together
- researchers mapping dependency structure and concentration
- analysts exploring chokepoints, strategic exposure, and disruption scenarios
- anyone who wants a more intuitive way to look at the semiconductor ecosystem than a spreadsheet or slide deck

## Repository Layout

- [apps/ui-prototype](apps/ui-prototype): the current demo frontend
- [src/semisupply](src/semisupply): the durable pipeline, modeling, and graph projection code
- [contracts](contracts): versioned contracts and data artifacts
- [docs](docs): product, architecture, source, and execution planning

## Run The Prototype

```bash
cd apps/ui-prototype
npm install
npm run dev
```

Then open the local URL printed by Vite.

For a production-style build:

```bash
cd apps/ui-prototype
npm run build
npm run preview
```

## Refresh The Demo Snapshot

```bash
PYTHONPATH=src python3 scripts/run_v1_seed_fixture.py --artifact-root tmp/ui-prototype-demo-source
PYTHONPATH=src python3 scripts/refresh_ui_prototype_demo.py tmp/ui-prototype-demo-source/exports/p0/<run-id>/ui_bundle.json
```

## Read More

- [docs/README.md](docs/README.md)
- [docs/PROJECT_VISION.md](docs/PROJECT_VISION.md)
- [docs/V1_PRODUCT_BRIEF.md](docs/V1_PRODUCT_BRIEF.md)
- [docs/V3_PRODUCT_SPEC.md](docs/V3_PRODUCT_SPEC.md)
