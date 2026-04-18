# Contracts

This directory holds encoded schemas and shared data contracts.

Rules:

- keep contracts versioned and explicit
- prefer small composable contract files over one giant schema
- use `docs/P0_DATA_CONTRACTS.md` as the human-readable source for the first draft

Current encoded contracts:

- `contracts/p0/`: initial pipeline and manifest contracts
- `contracts/v1/`: curated V1-scale seed inputs such as the company universe
