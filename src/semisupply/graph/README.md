# Graph

This area will hold graph-projection logic.

Rules:

- treat the graph as a projection, not the system of record
- preserve references back to claims and evidence
- keep graph-engine-specific code isolated from upstream contracts where possible

The first projector stays intentionally small:

- canonical `Company` nodes
- `Country` nodes
- claim-backed `LOCATED_IN` edges for headquarters relationships
- a UI bundle layer can sit on top of this projection without changing the durable graph contracts
