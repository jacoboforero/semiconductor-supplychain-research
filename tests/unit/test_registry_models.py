"""Unit tests for canonical company registry models."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
from uuid import uuid4

from semisupply.registry import (
    CompanyAlias,
    CompanyAliasType,
    CompanyIdentifier,
    CompanyIdentifierType,
    CompanyName,
    CompanyNameType,
    CompanyRecord,
    CompanyRoleAssignment,
    EntityType,
    FacilityIdentifier,
    FacilityIdentifierType,
    FacilityRecord,
    FacilityStatus,
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


class CompanyRecordModelTests(unittest.TestCase):
    def test_company_record_normalizes_fields_and_exposes_helpers(self) -> None:
        company = CompanyRecord(
            company_id=uuid4(),
            canonical_name="  Example Semiconductor Co.  ",
            entity_type=EntityType.COMPANY,
            hq_country_code="us",
            record_status=RecordStatus.ACTIVE,
            observed_at=aware_datetime(),
            website="https://example.com",
            lei="12345678901234567890",
            names=[
                CompanyName(
                    value="Example Semiconductor Company",
                    name_type=CompanyNameType.LEGAL,
                    observed_at=aware_datetime(),
                )
            ],
            aliases=[
                CompanyAlias(
                    value=" Example Semi ",
                    alias_type=CompanyAliasType.SHORT_NAME,
                    observed_at=aware_datetime(),
                )
            ],
            identifiers=[
                CompanyIdentifier(
                    identifier_type=CompanyIdentifierType.LEI,
                    value="12345678901234567890",
                    observed_at=aware_datetime(),
                )
            ],
            roles=[
                CompanyRoleAssignment(
                    role_code="role.foundry",
                    confidence=0.9,
                    observed_at=aware_datetime(),
                )
            ],
        )

        self.assertEqual(company.canonical_name, "Example Semiconductor Co.")
        self.assertEqual(company.hq_country_code, "US")
        self.assertEqual(company.aliases[0].value, "Example Semi")
        self.assertEqual(company.roles[0].role_code, "ROLE.FOUNDRY")
        self.assertTrue(company.has_role("ROLE.FOUNDRY"))
        self.assertEqual(
            company.primary_identifier(CompanyIdentifierType.LEI),
            company.identifiers[0],
        )
        self.assertEqual(
            company.all_known_names,
            (
                "Example Semiconductor Co.",
                "Example Semiconductor Company",
                "Example Semi",
            ),
        )

    def test_company_record_rejects_invalid_country_code(self) -> None:
        with self.assertRaisesRegex(ValueError, "country_code"):
            CompanyRecord(
                company_id=uuid4(),
                canonical_name="Example Semiconductor Co.",
                entity_type=EntityType.COMPANY,
                hq_country_code="USA",
                record_status=RecordStatus.ACTIVE,
                observed_at=aware_datetime(),
            )

    def test_company_record_requires_aware_datetimes(self) -> None:
        with self.assertRaisesRegex(ValueError, "observed_at"):
            CompanyRecord(
                company_id=uuid4(),
                canonical_name="Example Semiconductor Co.",
                entity_type=EntityType.COMPANY,
                hq_country_code="US",
                record_status=RecordStatus.ACTIVE,
                observed_at=datetime(2026, 4, 17, 12, 0),
            )

    def test_identifier_rejects_blank_values(self) -> None:
        with self.assertRaisesRegex(ValueError, "must not be blank"):
            CompanyIdentifier(
                identifier_type=CompanyIdentifierType.CIK,
                value="   ",
            )

    def test_role_assignment_rejects_invalid_role_codes(self) -> None:
        with self.assertRaisesRegex(ValueError, "ROLE."):
            CompanyRoleAssignment(role_code="FOUNDRY")

    def test_role_assignment_rejects_invalid_confidence(self) -> None:
        with self.assertRaisesRegex(ValueError, "confidence"):
            CompanyRoleAssignment(role_code="ROLE.FOUNDRY", confidence=1.5)

    def test_company_record_rejects_invalid_lei_length(self) -> None:
        with self.assertRaisesRegex(ValueError, "20 characters"):
            CompanyRecord(
                company_id=uuid4(),
                canonical_name="Example Semiconductor Co.",
                entity_type=EntityType.COMPANY,
                hq_country_code="US",
                record_status=RecordStatus.ACTIVE,
                observed_at=aware_datetime(),
                lei="1234",
            )

    def test_company_record_requires_url_scheme_when_website_present(self) -> None:
        with self.assertRaisesRegex(ValueError, "URL scheme"):
            CompanyRecord(
                company_id=uuid4(),
                canonical_name="Example Semiconductor Co.",
                entity_type=EntityType.COMPANY,
                hq_country_code="US",
                record_status=RecordStatus.ACTIVE,
                observed_at=aware_datetime(),
                website="example.com",
            )


class FacilityRecordModelTests(unittest.TestCase):
    def test_facility_record_normalizes_fields_and_exposes_helpers(self) -> None:
        company_id = uuid4()
        facility = FacilityRecord(
            facility_id=uuid4(),
            facility_name="  Fab 12  ",
            facility_type_code="fac.fab",
            country_code="tw",
            operator_company_id=company_id,
            owner_company_id=company_id,
            record_status=RecordStatus.ACTIVE,
            facility_status=FacilityStatus.OPERATING,
            observed_at=aware_datetime(),
            address_text="  Hsinchu Science Park  ",
            latitude=24.7808,
            longitude=121.0050,
            jurisdiction_code=" tw ",
            stage_codes=["stage.wafer_fab", "stage.wafer_sort"],
            identifiers=[
                FacilityIdentifier(
                    identifier_type=FacilityIdentifierType.EPA_FRS_ID,
                    value="  110000000001 ",
                    observed_at=aware_datetime(),
                )
            ],
        )

        self.assertEqual(facility.facility_name, "Fab 12")
        self.assertEqual(facility.facility_type_code, "FAC.FAB")
        self.assertEqual(facility.country_code, "TW")
        self.assertEqual(facility.address_text, "Hsinchu Science Park")
        self.assertEqual(facility.jurisdiction_code, "tw")
        self.assertEqual(facility.stage_codes, ("STAGE.WAFER_FAB", "STAGE.WAFER_SORT"))
        self.assertTrue(facility.has_stage("stage.wafer_fab"))
        self.assertEqual(
            facility.primary_identifier(FacilityIdentifierType.EPA_FRS_ID),
            facility.identifiers[0],
        )

    def test_facility_record_rejects_invalid_facility_type_code(self) -> None:
        with self.assertRaisesRegex(ValueError, "FAC."):
            FacilityRecord(
                facility_id=uuid4(),
                facility_name="Fab 12",
                facility_type_code="FAB",
                country_code="TW",
                operator_company_id=uuid4(),
                record_status=RecordStatus.ACTIVE,
                observed_at=aware_datetime(),
            )

    def test_facility_record_rejects_invalid_stage_code(self) -> None:
        with self.assertRaisesRegex(ValueError, "STAGE."):
            FacilityRecord(
                facility_id=uuid4(),
                facility_name="Fab 12",
                facility_type_code="FAC.FAB",
                country_code="TW",
                operator_company_id=uuid4(),
                record_status=RecordStatus.ACTIVE,
                observed_at=aware_datetime(),
                stage_codes=["WAFER_FAB"],
            )

    def test_facility_record_requires_coordinate_pair(self) -> None:
        with self.assertRaisesRegex(ValueError, "latitude and longitude"):
            FacilityRecord(
                facility_id=uuid4(),
                facility_name="Fab 12",
                facility_type_code="FAC.FAB",
                country_code="TW",
                operator_company_id=uuid4(),
                record_status=RecordStatus.ACTIVE,
                observed_at=aware_datetime(),
                latitude=24.7,
            )

    def test_facility_record_rejects_out_of_range_coordinates(self) -> None:
        with self.assertRaisesRegex(ValueError, "latitude"):
            FacilityRecord(
                facility_id=uuid4(),
                facility_name="Fab 12",
                facility_type_code="FAC.FAB",
                country_code="TW",
                operator_company_id=uuid4(),
                record_status=RecordStatus.ACTIVE,
                observed_at=aware_datetime(),
                latitude=124.7,
                longitude=121.0,
            )

    def test_facility_identifier_rejects_blank_values(self) -> None:
        with self.assertRaisesRegex(ValueError, "must not be blank"):
            FacilityIdentifier(
                identifier_type=FacilityIdentifierType.PRTR_ID,
                value=" ",
            )


if __name__ == "__main__":
    unittest.main()
