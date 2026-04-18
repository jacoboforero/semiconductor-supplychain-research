"""Unit tests for facility resolution and crosswalk behavior."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
from uuid import uuid4

from semisupply.normalize import (
    FacilityResolutionRule,
    FacilityResolver,
    SourceFacilityRecord,
    normalize_facility_name,
)
from semisupply.registry import FacilityIdentifier, FacilityIdentifierType, FacilityRecord, FacilityStatus, RecordStatus


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


def facility_record(*, facility_id=None, frs_id: str, name: str = "Manassas Fab") -> FacilityRecord:
    return FacilityRecord(
        facility_id=facility_id or uuid4(),
        facility_name=name,
        facility_type_code="FAC.FAB",
        country_code="US",
        operator_company_id=uuid4(),
        record_status=RecordStatus.ACTIVE,
        facility_status=FacilityStatus.OPERATING,
        observed_at=aware_datetime(),
        stage_codes=("STAGE.WAFER_FAB",),
        identifiers=(
            FacilityIdentifier(
                identifier_type=FacilityIdentifierType.EPA_FRS_ID,
                value=frs_id,
                issuer="EPA",
                observed_at=aware_datetime(),
            ),
        ),
    )


class FacilityResolutionTests(unittest.TestCase):
    def test_normalize_facility_name_collapses_punctuation_and_spacing(self) -> None:
        self.assertEqual(normalize_facility_name("  Fab-12 (North) "), "FAB 12 NORTH")

    def test_resolver_merges_records_with_shared_strong_identifier(self) -> None:
        resolver = FacilityResolver()
        left = facility_record(facility_id=uuid4(), frs_id="110000000001")
        right = facility_record(facility_id=uuid4(), frs_id="110000000001")

        resolution = resolver.resolve(
            (
                SourceFacilityRecord(source_key="epa_frs", facility_record=left),
                SourceFacilityRecord(source_key="epa_frs", facility_record=right),
            )
        )

        self.assertEqual(len(resolution.canonical_facility_records), 1)
        self.assertEqual(len(resolution.crosswalks), 2)
        self.assertEqual(len(resolution.decisions), 2)
        self.assertEqual(resolution.decisions[0].resolution_rule, FacilityResolutionRule.STRONG_IDENTIFIER)

    def test_resolver_keeps_distinct_facilities_separate(self) -> None:
        resolver = FacilityResolver()
        left = facility_record(frs_id="110000000001", name="Manassas Fab")
        right = facility_record(frs_id="110000000002", name="Boise Fab")

        resolution = resolver.resolve(
            (
                SourceFacilityRecord(source_key="epa_frs", facility_record=left),
                SourceFacilityRecord(source_key="epa_frs", facility_record=right),
            )
        )

        self.assertEqual(len(resolution.canonical_facility_records), 2)
        rules = {decision.resolution_rule for decision in resolution.decisions}
        self.assertEqual(rules, {FacilityResolutionRule.SINGLETON})


if __name__ == "__main__":
    unittest.main()
