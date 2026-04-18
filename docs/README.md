# Documentation Map

This directory is the active planning surface for the project.

## Core Documents

- [PROJECT_VISION.md](PROJECT_VISION.md): what the project is for, who it could serve, and why a graph approach is useful
- [V1_SCOPE.md](V1_SCOPE.md): definition of the first useful version and its boundaries
- [RESEARCH_QUESTIONS.md](RESEARCH_QUESTIONS.md): the concrete questions the graph should eventually answer
- [DATA_STRATEGY.md](DATA_STRATEGY.md): how data should be sourced, evaluated, and represented
- [RESEARCH_SYNTHESIS.md](RESEARCH_SYNTHESIS.md): what the two research reports changed and what now matters most
- [SOURCE_STRATEGY.md](SOURCE_STRATEGY.md): source priorities, operability tiers, and productization framing
- [V1_TAXONOMY.md](V1_TAXONOMY.md): the current working vocabulary for roles, facilities, items, and predicates
- [V1_PRODUCT_BRIEF.md](V1_PRODUCT_BRIEF.md): product-facing summary of what v1 must do and where durability matters versus where speed is acceptable
- [V1_UI_ARCHITECTURE.md](V1_UI_ARCHITECTURE.md): product-side UI architecture for moving from the current graph-first prototype to a convergence-oriented product shell
- [P0_DATA_CONTRACTS.md](P0_DATA_CONTRACTS.md): first contract and graph-model draft for the initial implementation slice
- [REPO_STRUCTURE_PLAN.md](REPO_STRUCTURE_PLAN.md): how the repository should be organized as it moves from docs-first planning into implementation
- [ROADMAP.md](ROADMAP.md): phased view of how the project can mature
- [ARCHITECTURE_NOTES.md](ARCHITECTURE_NOTES.md): constraints, open questions, and decisions intentionally deferred for now
- [ARCHITECTURAL_DRIVERS.md](ARCHITECTURAL_DRIVERS.md): the product and workflow decisions that should drive architecture selection

## Supporting Directories

- [decisions/](decisions/README.md): durable architecture, workflow, and repo-management decisions
- [exec-plans/](exec-plans/README.md): tactical implementation plans, split into active and completed
- [generated/](generated/README.md): generated reference material that is useful but not canonical
- [tasks/](tasks/README.md): lightweight task tracking for PM visibility and agent execution

## How To Use These Docs

- Start with `PROJECT_VISION.md` for the big picture.
- Read `V1_SCOPE.md` to understand what is in and out of the first build.
- Use `RESEARCH_QUESTIONS.md` and `DATA_STRATEGY.md` to guide future modeling and ingestion decisions.
- Read `RESEARCH_SYNTHESIS.md` before making any major source or pipeline assumptions.
- Use `SOURCE_STRATEGY.md` and `V1_TAXONOMY.md` as the current planning inputs for future data-pipeline design.
- Read `V1_PRODUCT_BRIEF.md` for the current PM-level definition of the product and quality bar.
- Read `V1_UI_ARCHITECTURE.md` for the current product-shell and screen-architecture direction.
- Read `P0_DATA_CONTRACTS.md` before encoding schemas or drafting graph loaders.
- Read `REPO_STRUCTURE_PLAN.md` before changing repo layout or introducing new top-level directories.
- Read `tasks/INDEX.md` to understand the current execution queue.
- Read `ARCHITECTURAL_DRIVERS.md` before making stack decisions.
- Treat `ARCHITECTURE_NOTES.md` as the staging area for implementation decisions once the project is ready for them.

## Intentional Gaps

The repository does not yet prescribe a full code architecture. That is deliberate. The next implementation phase should follow from the research questions, v1 scope, and data realities captured in these docs.
