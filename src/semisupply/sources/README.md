# Sources

This area will hold source adapter logic and source-specific extraction code.

Rules:

- keep source-specific logic isolated by source
- normalize into shared contracts rather than passing raw source shapes through the system
- treat capture, parsing, and extraction as separate concerns where possible

The current shared workflow is:

1. `AdapterRunContext`
2. `CapturedSource`
3. `ParsedSource`
4. `ExtractedRecords`

Adapters should implement the `SourceAdapter` interface and keep concrete source logic in source-specific modules rather than in generic helpers.

`ExtractedRecords` is the normalized handoff object for later pipeline stages and can now carry:

- canonical `CompanyRecord` outputs
- `EvidenceRecord` outputs
- `Observation` outputs
