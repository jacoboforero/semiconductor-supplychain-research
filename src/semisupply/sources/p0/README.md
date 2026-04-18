# P0 Sources

The initial recurring source slice is:

- GLEIF
- SEC EDGAR
- OpenDART
- EPA ECHO and FRS
- Korea PRTR
- BIS
- OFAC
- USGS Mineral Commodity Summaries

Adapters added here should target the contracts described in `docs/P0_DATA_CONTRACTS.md`.

The first concrete adapters are:

- `GleifCompanyAdapter`
- `EdgarIssuerAdapter`

They currently target:

- normalized `CompanyRecord` outputs
- `EvidenceRecord` outputs
- `Observation` outputs
