# Repo Structure Plan

This document defines how the repository should be managed as the project moves from documentation-first planning into implementation.

It is not a final application architecture.

It is the repo-shape and project-organization plan that should keep the codebase legible for both humans and coding agents.

## Goals

The repo structure should:

- follow the workflow order in the architecture notes rather than a guessed final stack
- keep the durable data pipeline foundation cleaner than the first prototype UI
- make the codebase easy for agents to navigate with minimal prompt overhead
- prevent large local artifacts from degrading search, indexing, and context quality
- make it obvious where decisions, plans, generated material, code, and local data belong

## Management Principles

## 1. Docs Are The System Of Record

The repo should keep durable project knowledge in `docs/`, not inside one giant agent instruction file.

That means:

- `AGENTS.md` stays short and acts as a map
- `docs/` stores product, architecture, source, and planning truth
- major structure or workflow changes should be reflected in docs as part of the same change

## 2. Repo Shape Should Follow Workflows

Per the architecture notes, implementation should be introduced in this order:

- entity registry workflow
- taxonomy governance workflow
- ingestion workflow
- graph loading workflow
- analysis workflow
- presentation workflow

This repo should mirror that sequence instead of jumping immediately to a large framework-specific layout.

## 3. Durable Pipeline, Replaceable UI

The repo should treat the data pipeline and data contracts as the long-lived asset.

The first UI should be organized as a prototype surface that is easy to change or replace later.

That means:

- pipeline code gets stricter boundaries and cleaner contracts
- the prototype UI gets simpler boundaries and less architectural ceremony
- shared contracts between pipeline and UI should be explicit and versioned

## 4. Keep Agent Context Lean

The repository should be easy for agents to search and reason about.

That means:

- concise root instructions
- scoped instructions for specific file types or directories
- local `README.md` files in major directories
- no large generated artifacts checked into source control
- no important decisions hidden only in chat history

## Current Phase

The repo has now entered a small implementation-bootstrap phase.

The planning docs remain the source of truth, but the promotion gates for the first scaffold have been met through:

- the P0 source-spine decision
- the initial runtime decision
- the P0 data-contract draft

For the current phase, the intended top-level shape is:

```text
/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── pyproject.toml
├── deep-research-report-*.md
├── src/
├── contracts/
├── scripts/
├── tests/
├── apps/
├── docs/
├── .github/
└── .cursor/
```

This is still intentionally small.

## Documentation Layout

The `docs/` directory should be the permanent planning surface.

Use this structure:

```text
docs/
├── README.md
├── PROJECT_VISION.md
├── V1_SCOPE.md
├── V1_PRODUCT_BRIEF.md
├── V1_TAXONOMY.md
├── DATA_STRATEGY.md
├── SOURCE_STRATEGY.md
├── RESEARCH_SYNTHESIS.md
├── RESEARCH_QUESTIONS.md
├── ARCHITECTURAL_DRIVERS.md
├── ARCHITECTURE_NOTES.md
├── P0_DATA_CONTRACTS.md
├── REPO_STRUCTURE_PLAN.md
├── ROADMAP.md
├── decisions/
├── exec-plans/
├── tasks/
└── generated/
```

Rules:

- `docs/decisions/` holds durable architecture or workflow decisions.
- `docs/exec-plans/active/` holds current implementation plans.
- `docs/exec-plans/completed/` archives finished plans that still provide context.
- `docs/tasks/` holds task state and should be the PM-facing execution queue.
- `docs/generated/` holds generated reference material only. It is not the source of truth.

## When Implementation Starts

When the first serious code lands, do not jump straight to a multi-package monorepo.

Start with a small, explicit structure:

```text
/
├── docs/
├── src/
│   └── <python_package>/
│       ├── registry/
│       ├── taxonomy/
│       ├── sources/
│       ├── normalize/
│       ├── claims/
│       ├── graph/
│       └── analysis/
├── contracts/
├── scripts/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── apps/
    └── ui-prototype/
```

### Why this shape

- `src/<python_package>/` keeps the durable pipeline in one package at first.
- Subpackages follow the actual data workflow rather than technical layers like `utils/` and `services/`.
- `contracts/` keeps shared schemas and versioned data contracts outside the runtime package.
- `apps/ui-prototype/` makes the prototype UI explicitly separate from the durable pipeline.
- `tests/fixtures/` is the only place small example datasets should be versioned.

## Data And Artifact Policy

The repo should version:

- human-authored docs
- code
- schemas and contracts
- small representative fixtures
- manifests for reproducible runs

The repo should not version:

- raw source dumps at production scale
- rebuilt normalized datasets
- graph database files
- local caches
- notebook checkpoints
- heavy exports

Use a gitignored local artifact tree when implementation begins:

```text
artifacts/
├── raw/
├── normalized/
├── graph/
├── exports/
└── logs/
```

Agents should not rely on those directories being present in git history.

## Directory Creation Rules

Create a new top-level directory only if one of these is true:

- it represents a durable workflow boundary
- it is required by a tool with strong convention value
- the existing structure would otherwise mix generated artifacts, source code, and project knowledge in a confusing way

Do not create new top-level directories just to mirror an imagined future platform architecture.

## README Rules

Every major directory should eventually have a short local `README.md` that answers:

- what belongs here
- what does not belong here
- which files are canonical
- which commands are relevant

This is especially important for:

- `docs/`
- `src/<python_package>/`
- `contracts/`
- `scripts/`
- `tests/`
- `apps/ui-prototype/`

## Planning And Decision Hygiene

Use these locations consistently:

- durable decisions: `docs/decisions/`
- active implementation plans: `docs/exec-plans/active/`
- task queue and execution state: `docs/tasks/`
- completed plans worth keeping: `docs/exec-plans/completed/`
- generated reference material: `docs/generated/`

This keeps architecture, execution, and generated output from collapsing into the same folder.

## Promotion Gates

Do not add additional major implementation directories beyond `src/`, `contracts/`, `scripts/`, `tests/`, and `apps/` until the following are true:

- the first recurring source spine is chosen
- the first graph model is drafted
- the first registry and claim data contracts are concrete enough to encode
- the initial implementation runtime choice is made

That keeps the repo from pretending implementation decisions are settled before they are.

## Review Standard For Repo Changes

Any change that alters repo structure should also answer:

- does this make the codebase easier or harder for an agent to navigate?
- does this add durable clarity or just more folders?
- should this change also update `AGENTS.md`, `docs/README.md`, or a local directory README?

If the answer is unclear, the structure change is probably premature.
