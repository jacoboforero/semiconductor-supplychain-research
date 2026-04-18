# Taxonomy

This area holds the versioned internal taxonomy and bridge mappings.

Current scope:

- role codes
- facility types
- item and material categories
- predicate and stage vocabulary
- conservative seeded mappings from known companies into internal roles and segments

Seed mappings are now loaded from the curated contracts under `contracts/v1/` so the 200-company universe and its taxonomy defaults remain repo-managed inputs rather than hard-coded lists.

The initial implementation should prefer explicit curated mappings over heuristic role inference.
