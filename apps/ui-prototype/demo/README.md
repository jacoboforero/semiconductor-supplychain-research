# Demo Bundle

This directory holds a small checked-in demo bundle for the static prototype.

It exists so the prototype can open directly into a meaningful graph without making the viewer understand the pipeline first.

The source of truth is still the fixture-backed pipeline run.

Refresh flow:

1. Run `PYTHONPATH=src python3 scripts/run_v1_seed_fixture.py --artifact-root tmp/ui-prototype-demo-source`
2. Run `PYTHONPATH=src python3 scripts/refresh_ui_prototype_demo.py tmp/ui-prototype-demo-source/exports/p0/<run-id>/ui_bundle.json`
