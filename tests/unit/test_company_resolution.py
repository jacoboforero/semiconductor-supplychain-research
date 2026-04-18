"""Unit tests for deterministic company resolution and source crosswalks."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
from uuid import uuid4

from semisupply.normalize import (
    CompanyResolutionRule,
    CompanyResolutionStatus,
    CompanyResolver,
    SourceCompanyRecord,
    normalize_company_name,
)
from semisupply.registry import (
    CompanyIdentifier,
    CompanyIdentifierType,
    CompanyRecord,
    EntityType,
    RecordStatus,
)


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


def company_record(
    *,
    canonical_name: str,
    hq_country_code: str,
    identifiers: tuple[CompanyIdentifier, ...],
    observed_at: datetime | None = None,
) -> CompanyRecord:
    return CompanyRecord(
        company_id=uuid4(),
        canonical_name=canonical_name,
        entity_type=EntityType.COMPANY,
        hq_country_code=hq_country_code,
        record_status=RecordStatus.ACTIVE,
        observed_at=observed_at or aware_datetime(),
        identifiers=identifiers,
    )


def identifier(identifier_type: CompanyIdentifierType, value: str, *, observed_at: datetime | None = None) -> CompanyIdentifier:
    return CompanyIdentifier(
        identifier_type=identifier_type,
        value=value,
        issuer="test",
        observed_at=observed_at or aware_datetime(),
    )


class CompanyResolutionTests(unittest.TestCase):
    def test_normalize_company_name_collapses_case_and_punctuation(self) -> None:
        self.assertEqual(normalize_company_name(" Apple, Inc. "), "APPLE INC")

    def test_resolver_creates_singleton_canonical_record(self) -> None:
        resolver = CompanyResolver()
        source_record = SourceCompanyRecord(
            source_key="gleif",
            company_record=company_record(
                canonical_name="Example Semiconductor Holdings Ltd.",
                hq_country_code="KR",
                identifiers=(identifier(CompanyIdentifierType.LEI, "5493001KJTIIGC8Y1R12"),),
            ),
        )

        result = resolver.resolve((source_record,))

        self.assertEqual(len(result.canonical_company_records), 1)
        self.assertEqual(len(result.crosswalks), 1)
        self.assertEqual(len(result.decisions), 1)
        self.assertEqual(result.crosswalks[0].resolution_rule, CompanyResolutionRule.SINGLETON)
        self.assertEqual(result.decisions[0].resolution_status, CompanyResolutionStatus.RESOLVED)

    def test_resolver_merges_records_on_strong_identifier(self) -> None:
        resolver = CompanyResolver()
        records = (
            SourceCompanyRecord(
                source_key="edgar",
                company_record=company_record(
                    canonical_name="Apple Inc.",
                    hq_country_code="US",
                    identifiers=(identifier(CompanyIdentifierType.CIK, "0000320193"),),
                ),
            ),
            SourceCompanyRecord(
                source_key="edgar",
                company_record=company_record(
                    canonical_name="APPLE INC.",
                    hq_country_code="US",
                    identifiers=(identifier(CompanyIdentifierType.CIK, "0000320193"),),
                ),
            ),
        )

        result = resolver.resolve(records)

        self.assertEqual(len(result.canonical_company_records), 1)
        self.assertEqual(len(result.crosswalks), 2)
        self.assertTrue(all(crosswalk.resolution_rule == CompanyResolutionRule.STRONG_IDENTIFIER for crosswalk in result.crosswalks))
        self.assertEqual(result.canonical_company_records[0].cik, "0000320193")

    def test_resolver_merges_cross_source_records_on_exact_name_and_country(self) -> None:
        resolver = CompanyResolver()
        records = (
            SourceCompanyRecord(
                source_key="gleif",
                company_record=company_record(
                    canonical_name="Apple Inc.",
                    hq_country_code="US",
                    identifiers=(identifier(CompanyIdentifierType.LEI, "HWUPKR0MPOU8FGXBT394"),),
                ),
            ),
            SourceCompanyRecord(
                source_key="edgar",
                company_record=company_record(
                    canonical_name="APPLE, INC.",
                    hq_country_code="US",
                    identifiers=(identifier(CompanyIdentifierType.CIK, "0000320193"),),
                ),
            ),
        )

        result = resolver.resolve(records)

        self.assertEqual(len(result.canonical_company_records), 1)
        self.assertEqual(len(result.crosswalks), 2)
        self.assertTrue(all(crosswalk.resolution_rule == CompanyResolutionRule.EXACT_NAME_COUNTRY for crosswalk in result.crosswalks))
        canonical = result.canonical_company_records[0]
        self.assertEqual(canonical.canonical_name, "Apple Inc.")
        self.assertEqual(canonical.lei, "HWUPKR0MPOU8FGXBT394")
        self.assertEqual(canonical.cik, "0000320193")

    def test_resolver_flags_conflicting_identifier_matches_for_review(self) -> None:
        resolver = CompanyResolver()
        records = (
            SourceCompanyRecord(
                source_key="edgar",
                company_record=company_record(
                    canonical_name="Example Semiconductor Co.",
                    hq_country_code="US",
                    identifiers=(identifier(CompanyIdentifierType.CIK, "0001000001"),),
                ),
            ),
            SourceCompanyRecord(
                source_key="edgar",
                company_record=company_record(
                    canonical_name="EXAMPLE SEMICONDUCTOR CO",
                    hq_country_code="US",
                    identifiers=(identifier(CompanyIdentifierType.CIK, "0002000002"),),
                ),
            ),
        )

        result = resolver.resolve(records)

        self.assertEqual(result.canonical_company_records, ())
        self.assertEqual(result.crosswalks, ())
        self.assertEqual(len(result.decisions), 2)
        self.assertTrue(
            all(decision.resolution_status == CompanyResolutionStatus.NEEDS_REVIEW for decision in result.decisions)
        )
        self.assertTrue(
            all(decision.resolution_rule == CompanyResolutionRule.AMBIGUOUS_NAME_COUNTRY for decision in result.decisions)
        )


if __name__ == "__main__":
    unittest.main()
