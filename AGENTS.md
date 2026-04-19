# Agent Guide

This repository is optimized for coding agents by keeping the persistent instruction layer short and treating `docs/` as the source of truth.

Read this file first, then use the linked docs for depth.

## Repo State

- The repository is intentionally documentation-first right now.
- There is no canonical production code layout yet.
- There is no default build, test, or lint pipeline yet.
- The next implementation phase should follow the planning docs instead of inventing a codebase shape ad hoc.

## Source Of Truth

Use these files in this order:

1. `docs/README.md`
2. `docs/V1_PRODUCT_BRIEF.md`
3. `docs/V2_PRODUCT_SPEC.md`
4. `docs/V3_PRODUCT_SPEC.md`
5. `docs/ARCHITECTURAL_DRIVERS.md`
6. `docs/V1_UI_ARCHITECTURE.md`
7. `docs/V2_FRONTEND_ARCHITECTURE.md`
8. `docs/V3_FRONTEND_ARCHITECTURE.md`
9. `docs/ARCHITECTURE_NOTES.md`
10. `docs/REPO_STRUCTURE_PLAN.md`
11. `docs/P0_DATA_CONTRACTS.md`
12. `docs/tasks/INDEX.md`

For source and modeling work, also read:

- `docs/SOURCE_STRATEGY.md`
- `docs/DATA_STRATEGY.md`
- `docs/V1_SCOPE.md`
- `docs/V1_TAXONOMY.md`

## Working Rules

- Keep this file short. Put durable project knowledge in `docs/`, not here.
- Treat `docs/` as the planning system of record.
- Do not create new top-level directories unless they are defined in `docs/REPO_STRUCTURE_PLAN.md` or explicitly approved.
- Preserve the project split:
  - the data pipeline and data model are the durable asset
  - the first UI layer is a replaceable prototype
- Prefer small, composable files and directories over large mixed-purpose ones.
- Add or update a local `README.md` when you introduce a major new directory.
- Keep large raw data, caches, local databases, exports, and generated artifacts out of git and out of agent context by default.
- Version small fixtures, schemas, manifests, and human-authored docs. Do not version bulky rebuildable artifacts.

## Planning Workflow

- For large changes, start with a plan and save durable plans under `docs/exec-plans/`.
- Use `docs/tasks/INDEX.md` and the task files under `docs/tasks/` to track meaningful work.
- Put open or durable architecture choices in `docs/decisions/`.
- Put generated reference material in `docs/generated/` and mark it clearly as generated.
- Update nearby docs when structure or workflow expectations change.

## Current Commands

The initial pipeline runtime is Python with `pyproject.toml` and `src/semisupply/`.

Useful commands now are:

- `rg --files`
- `rg -n "<pattern>"`
- `find docs -maxdepth 2 -type f | sort`
- `python3 -m compileall src`
- `PYTHONPATH=src python3 -c "import semisupply; print(semisupply.__version__)"`

As the codebase grows, document additional canonical commands in this file and the relevant local README.

## Agent-Specific Notes

- If you need OpenAI product or API documentation, use the OpenAI developer docs MCP server when available instead of relying on memory.
- Keep repository-wide instructions concise; path-specific guidance should live in scoped instruction files.
- Prefer referencing canonical files over copying long guidance into prompts or rule files.
