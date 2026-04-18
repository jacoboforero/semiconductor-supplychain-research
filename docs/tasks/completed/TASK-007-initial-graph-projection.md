# TASK-007 Implement initial graph projection models and builders

Status: `done`
Priority: `P0`
Owner: `Codex`
Created: `2026-04-17`
Updated: `2026-04-17`

## Goal

Implement the first graph projection layer so canonical companies and basic claims can be emitted as typed nodes and edges for the UI and later graph storage.

## Why It Matters

The pipeline can now ingest source data, form observations and claims, and resolve canonical companies. The next missing step is turning those normalized layers into a graph-shaped analytical view that the prototype UI can actually consume.

## Scope

- define initial graph node and edge models
- preserve references back to claims and confidence
- implement a first projector for company and country nodes plus basic relationship edges
- add unit tests for projection outputs

## Out Of Scope

- graph database vendor integration
- visualization code
- advanced facility, restriction, or dependency projections

## Dependencies

- [TASK-005](TASK-005-claim-models-and-claim-builder.md)
- [TASK-006](TASK-006-company-resolution-and-crosswalks.md)
- [P0 data contracts](../../P0_DATA_CONTRACTS.md)

## Definition Of Done

- graph projection models exist in `src/semisupply/graph/`
- canonical companies and basic claims can be projected into nodes and edges
- unit tests cover the first happy paths

## Files Or Areas Likely To Change

- `src/semisupply/graph/`
- `tests/unit/`

## Notes

Completed with:

- graph models in `src/semisupply/graph/models.py`
- `InitialGraphProjector` in `src/semisupply/graph/projector.py`
- package exports in `src/semisupply/graph/__init__.py`
- unit coverage in `tests/unit/test_graph_projection.py`

The first projection stays intentionally small.

It emits canonical `Company` nodes, `Country` nodes, and claim-backed `LOCATED_IN` edges by translating source-bound company claims through the company crosswalk layer.

Validation run:

- `PYTHONPATH=src python3 -m unittest tests.unit.test_graph_projection`
- `PYTHONPATH=src python3 -m unittest discover -s tests/unit -p 'test_*.py'`
- `python3 -m compileall src`
