# Runs

This area holds local run orchestration and manifest logic.

Use it for:

- reproducible local pipeline runs
- output artifact manifests
- thin execution surfaces that wire the workflow packages together

Do not move core business logic here if it belongs in `sources/`, `normalize/`, `claims/`, or `graph/`.
