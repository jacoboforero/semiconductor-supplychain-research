# Initial Pipeline Runtime

Date: 2026-04-17

Status: accepted

## Decision

The first implementation runtime for the durable data pipeline should be:

- Python
- `src/` layout
- `pyproject.toml` as the package and tool entry point
- one initial package: `semisupply`

This decision applies to the pipeline foundation.

It does not lock the long-term frontend stack or hosted deployment architecture.

## Why Python

Python is the best fit for the first serious build because the project needs:

- data ingestion from heterogeneous public sources
- document parsing and normalization
- data-contract enforcement
- graph preparation and analysis
- local-first iteration with low operational overhead

Python also supports the intended split between:

- durable pipeline logic
- external graph execution
- lightweight prototype UI work

## Why A Single Initial Package

The repo should not jump directly to a monorepo or many-package structure.

One package keeps the first implementation slice:

- easy to navigate
- easy for agents to search
- easy to refactor later if the workflow boundaries prove real

The initial subpackage boundaries should follow the data workflow rather than technical abstractions.

## Why `src/` Layout

The `src/` layout reduces accidental import-path ambiguity and makes packaging boundaries clearer.

That matters for:

- tests
- scripts
- agents running ad hoc checks
- future packaging and deployment hygiene

## Why `pyproject.toml`

`pyproject.toml` is the canonical modern entry point for Python project metadata and tool configuration.

Using it early keeps the project simple and tool-friendly without choosing a heavyweight build or orchestration approach too soon.

## What This Does Not Decide

This decision does not yet lock:

- orchestration framework
- graph database
- workflow scheduler
- API framework
- frontend framework
- cloud deployment topology

Those choices still depend on the next implementation work.

## Initial Package Boundary

The initial package should expose these workflow-aligned areas:

- `registry`
- `taxonomy`
- `sources`
- `normalize`
- `claims`
- `graph`
- `analysis`

These are scaffolding boundaries, not final guarantees.

They are meant to keep the codebase aligned with the architecture notes and easy for agents to understand.
