"""Unit tests for the initial taxonomy catalog and seeded mappings."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
from uuid import uuid4

from semisupply.registry import (
    CompanyIdentifier,
    CompanyIdentifierType,
    CompanyRecord,
    EntityType,
    RecordStatus,
)
from semisupply.taxonomy import (
    DEFAULT_TAXONOMY,
    TaxonomyCatalog,
    TaxonomyEntry,
    TaxonomyKind,
    default_company_taxonomy_mapper,
)


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


class TaxonomyTests(unittest.TestCase):
    def test_default_catalog_exposes_role_and_stage_codes(self) -> None:
        self.assertTrue(DEFAULT_TAXONOMY.has("ROLE.FABLESS"))
        self.assertTrue(DEFAULT_TAXONOMY.has("STAGE.WAFER_FAB"))
        self.assertIn("SEG.DESIGN_SOFTWARE", DEFAULT_TAXONOMY.codes_for_kind(TaxonomyKind.SEGMENT))

    def test_taxonomy_entry_validates_prefix_for_kind(self) -> None:
        with self.assertRaisesRegex(ValueError, "ROLE."):
            TaxonomyEntry(
                code="SEG.DESIGN_SOFTWARE",
                kind=TaxonomyKind.ROLE,
                label="Bad",
            )

    def test_taxonomy_catalog_rejects_duplicate_codes(self) -> None:
        with self.assertRaisesRegex(ValueError, "unique"):
            TaxonomyCatalog(
                version="v1",
                entries=(
                    TaxonomyEntry(code="ROLE.FABLESS", kind=TaxonomyKind.ROLE, label="Fabless"),
                    TaxonomyEntry(code="ROLE.FABLESS", kind=TaxonomyKind.ROLE, label="Fabless 2"),
                ),
            )

    def test_default_mapper_maps_apple_to_roles_segments_and_chip_output(self) -> None:
        mapper = default_company_taxonomy_mapper()
        company = CompanyRecord(
            company_id=uuid4(),
            canonical_name="Apple Inc.",
            entity_type=EntityType.COMPANY,
            hq_country_code="US",
            record_status=RecordStatus.ACTIVE,
            observed_at=aware_datetime(),
            cik="0000320193",
            identifiers=(
                CompanyIdentifier(
                    identifier_type=CompanyIdentifierType.CIK,
                    value="0000320193",
                    issuer="SEC",
                    observed_at=aware_datetime(),
                ),
            ),
        )

        mapping = mapper.map_company(company)

        self.assertIsNotNone(mapping)
        assert mapping is not None
        self.assertEqual(mapping.matched_seed_id, "apple")
        self.assertEqual(mapping.role_codes, ("ROLE.FABLESS",))
        self.assertEqual(mapping.segment_codes, ("SEG.DESIGN_SOFTWARE",))
        self.assertEqual(mapping.chip_codes, ("CHIP.LOGIC",))

    def test_default_mapper_returns_none_for_unknown_company(self) -> None:
        mapper = default_company_taxonomy_mapper()
        company = CompanyRecord(
            company_id=uuid4(),
            canonical_name="Example Unknown Semiconductor Co.",
            entity_type=EntityType.COMPANY,
            hq_country_code="US",
            record_status=RecordStatus.ACTIVE,
            observed_at=aware_datetime(),
        )

        self.assertIsNone(mapper.map_company(company))

    def test_default_mapper_loads_full_curated_v1_seed_set(self) -> None:
        mapper = default_company_taxonomy_mapper()

        self.assertEqual(len(mapper.seeds), 200)
        self.assertEqual(len({seed.seed_id for seed in mapper.seeds}), 200)

    def test_default_mapper_maps_tsmc_with_foundry_codes_from_contract(self) -> None:
        mapper = default_company_taxonomy_mapper()
        company = CompanyRecord(
            company_id=uuid4(),
            canonical_name="Taiwan Semiconductor Manufacturing Company Limited",
            entity_type=EntityType.COMPANY,
            hq_country_code="TW",
            record_status=RecordStatus.ACTIVE,
            observed_at=aware_datetime(),
        )

        mapping = mapper.map_company(company)

        self.assertIsNotNone(mapping)
        assert mapping is not None
        self.assertEqual(mapping.role_codes, ("ROLE.FOUNDRY",))
        self.assertEqual(mapping.segment_codes, ("SEG.FRONTEND_MANUFACTURING",))
        self.assertEqual(mapping.chip_codes, ("CHIP.LOGIC", "CHIP.OTHER"))

    def test_default_mapper_maps_photomask_supplier_bucket_override(self) -> None:
        mapper = default_company_taxonomy_mapper()
        company = CompanyRecord(
            company_id=uuid4(),
            canonical_name="Photronics",
            entity_type=EntityType.COMPANY,
            hq_country_code="US",
            record_status=RecordStatus.ACTIVE,
            observed_at=aware_datetime(),
        )

        mapping = mapper.map_company(company)

        self.assertIsNotNone(mapping)
        assert mapping is not None
        self.assertEqual(mapping.role_codes, ("ROLE.PHOTOMASK_SUPPLIER",))
        self.assertEqual(mapping.segment_codes, ("SEG.MASKS_RETICLES",))

    def test_default_mapper_maps_substrate_supplier_bucket_override(self) -> None:
        mapper = default_company_taxonomy_mapper()
        company = CompanyRecord(
            company_id=uuid4(),
            canonical_name="Ibiden",
            entity_type=EntityType.COMPANY,
            hq_country_code="JP",
            record_status=RecordStatus.ACTIVE,
            observed_at=aware_datetime(),
        )

        mapping = mapper.map_company(company)

        self.assertIsNotNone(mapping)
        assert mapping is not None
        self.assertEqual(mapping.role_codes, ("ROLE.SUBSTRATE_MANUFACTURER",))
        self.assertEqual(mapping.segment_codes, ("SEG.WAFERS_SUBSTRATES",))


if __name__ == "__main__":
    unittest.main()
