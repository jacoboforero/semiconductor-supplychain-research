# UI Prototype

This directory is reserved for the first shareable graph-exploration UI.

Rules:

- optimize for speed, clarity, and feedback velocity
- keep the interface tightly coupled to explicit contracts rather than implicit data shapes
- avoid over-investing in long-term frontend architecture at this stage
- consume a UI bundle export rather than raw pipeline artifact files directly

## Local Preview

1. Open [index.html](/Users/jacoboforero/Desktop/Research/semiconductor-supplychain-research/apps/ui-prototype/index.html) in a browser.
2. The bundled demo should load automatically.
3. Use `Load Another Bundle` only if you want to swap in a different `ui_bundle.json`.

To refresh the bundled demo from the current fixture-backed pipeline run:

1. Run `PYTHONPATH=src python3 scripts/run_v1_seed_fixture.py --artifact-root tmp/ui-prototype-demo-source`
2. Run `PYTHONPATH=src python3 scripts/refresh_ui_prototype_demo.py tmp/ui-prototype-demo-source/exports/p0/<run-id>/ui_bundle.json`

The current prototype is intentionally static and zero-dependency.

It is meant to validate the interaction pattern and bundle contract, not to lock in a long-term frontend stack.
