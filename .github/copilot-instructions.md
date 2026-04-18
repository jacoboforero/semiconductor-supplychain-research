# Repository Instructions

- Treat `docs/` as the system of record for product, architecture, and repo-shape decisions.
- Keep repository-wide instructions short. Use path-specific instructions when guidance only applies to certain files.
- Do not invent a large app or monorepo layout before the first graph model and source spine are locked.
- Preserve the project split: durable data pipeline foundation, replaceable prototype UI.
- Keep large raw data, caches, exports, and generated artifacts out of git. Version only small fixtures, schemas, manifests, and human-authored documentation.
- When introducing a major new directory, add a local `README.md` and update `docs/REPO_STRUCTURE_PLAN.md` if the structure policy changed.
