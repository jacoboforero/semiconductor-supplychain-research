# V1 Contracts

This directory holds the first V1-scale curated contract artifacts.

Current contents:

- `company_universe.v1.json`: the first repo-managed 200-company universe for V1
- `company_taxonomy.v1.json`: bucket defaults and explicit taxonomy overrides for the curated universe
- `company_dependency_edges.v1.json`: the first curated company-to-company dependency slice for the graph-first product workspace

Working rules:

- treat these files as curated inputs, not generated outputs
- prefer stable slugs and common display names over premature legal-entity precision
- keep the company universe distinct from taxonomy mappings and source-derived identifiers
- extend contracts version-by-version instead of mutating semantics silently
