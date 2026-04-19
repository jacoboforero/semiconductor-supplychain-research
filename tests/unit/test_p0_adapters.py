"""Unit tests for concrete P0 source adapters."""

from __future__ import annotations

import json
import unittest
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from semisupply.registry import CompanyIdentifierType, FacilityIdentifierType
from semisupply.sources import AdapterRunContext
from semisupply.sources.p0 import (
    CuratedCompanySeedAdapter,
    CuratedDependencySeedAdapter,
    EdgarIssuerAdapter,
    EpaFacilityAdapter,
    GleifCompanyAdapter,
    KoreaPrtrFacilityAdapter,
)
from semisupply.sources.p0.common import stable_company_id


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


FIXTURE_ROOT = Path(__file__).resolve().parents[1] / "fixtures" / "p0"


def load_fixture(name: str) -> dict[str, object] | list[object]:
    return json.loads((FIXTURE_ROOT / name).read_text())


class P0AdapterTests(unittest.TestCase):
    def test_curated_seed_adapter_emits_company_records_with_seed_identifier(self) -> None:
        payload = {
            "data": [
                {
                    "company_slug": "apple",
                    "name": "Apple",
                    "country_code": "US",
                    "aliases": ["Apple Inc.", "Apple Computer, Inc."],
                }
            ]
        }
        adapter = CuratedCompanySeedAdapter(payload_loader=lambda context: payload)
        extracted = adapter.run(AdapterRunContext(run_id=uuid4(), requested_at=aware_datetime()))

        self.assertEqual(len(extracted.company_records), 1)
        self.assertEqual(len(extracted.evidence_records), 1)
        self.assertEqual(len(extracted.observations), 3)

        company = extracted.company_records[0]
        self.assertEqual(company.canonical_name, "Apple")
        self.assertEqual(company.hq_country_code, "US")
        self.assertEqual(company.aliases[0].value, "Apple Inc.")
        self.assertEqual(
            company.primary_identifier(CompanyIdentifierType.OTHER).value,
            "apple",
        )

    def test_curated_dependency_seed_adapter_emits_company_to_company_observations(self) -> None:
        payload = {
            "sources": [
                {
                    "source_id": "demo-source",
                    "label": "Demo source",
                    "url": "https://example.com/demo",
                }
            ],
            "relationships": [
                {
                    "relationship_id": "tsmc-apple-foundry",
                    "supplier_company_slug": "taiwan-semiconductor-manufacturing-company",
                    "customer_company_slug": "apple",
                    "predicate": "FABRICATES_FOR",
                    "item_code": "SERVICE.FOUNDRY_WAFER_FAB",
                    "stage_code": "STAGE.WAFER_FAB",
                    "source_ids": ["demo-source"],
                    "confidence": 0.96,
                    "notes": "Representative public relationship.",
                }
            ],
        }
        adapter = CuratedDependencySeedAdapter(payload_loader=lambda context: payload)
        extracted = adapter.run(AdapterRunContext(run_id=uuid4(), requested_at=aware_datetime()))

        self.assertEqual(len(extracted.company_records), 0)
        self.assertEqual(len(extracted.facility_records), 0)
        self.assertEqual(len(extracted.evidence_records), 1)
        self.assertEqual(len(extracted.observations), 1)

        observation = extracted.observations[0]
        self.assertEqual(observation.observation_type, "company_dependency_observed")
        self.assertEqual(observation.subject_type.value, "company")
        self.assertEqual(observation.object_type.value, "company")
        self.assertEqual(
            observation.subject_id,
            str(
                stable_company_id(
                    source_key="curated_seed",
                    identifier_type="company_slug",
                    identifier_value="taiwan-semiconductor-manufacturing-company",
                )
            ),
        )
        self.assertEqual(
            observation.object_id,
            str(
                stable_company_id(
                    source_key="curated_seed",
                    identifier_type="company_slug",
                    identifier_value="apple",
                )
            ),
        )
        self.assertEqual(observation.normalized_value["predicate"], "FABRICATES_FOR")
        self.assertEqual(observation.normalized_value["item_code"], "SERVICE.FOUNDRY_WAFER_FAB")
        self.assertEqual(observation.normalized_value["stage_code"], "STAGE.WAFER_FAB")
        self.assertEqual(observation.normalized_value["sources"][0]["source_id"], "demo-source")

    def test_gleif_adapter_emits_company_evidence_and_observations(self) -> None:
        payload = {
            "data": [
                {
                    "lei": "5493001KJTIIGC8Y1R12",
                    "entity": {
                        "legalName": {"name": "Example Semiconductor Holdings Ltd."},
                        "legalAddress": {"country": "KR"},
                        "otherEntityNames": [{"name": "Example Semi"}],
                    },
                    "registration": {
                        "initialRegistrationDate": "2024-01-05T00:00:00Z",
                    },
                }
            ]
        }
        adapter = GleifCompanyAdapter(payload_loader=lambda context: json.dumps(payload))
        extracted = adapter.run(AdapterRunContext(run_id=uuid4(), requested_at=aware_datetime()))

        self.assertEqual(len(extracted.company_records), 1)
        self.assertEqual(len(extracted.evidence_records), 1)
        self.assertEqual(len(extracted.observations), 3)

        company = extracted.company_records[0]
        self.assertEqual(company.canonical_name, "Example Semiconductor Holdings Ltd.")
        self.assertEqual(company.hq_country_code, "KR")
        self.assertEqual(company.lei, "5493001KJTIIGC8Y1R12")
        self.assertEqual(company.aliases[0].value, "Example Semi")
        self.assertEqual(
            company.primary_identifier(CompanyIdentifierType.LEI).value,
            "5493001KJTIIGC8Y1R12",
        )

    def test_edgar_adapter_emits_company_evidence_and_observations(self) -> None:
        payload = {
            "cik": 320193,
            "name": "Apple Inc.",
            "tickers": ["AAPL"],
            "formerNames": [{"name": "Apple Computer, Inc."}],
            "addresses": {
                "business": {
                    "stateOrCountry": "CA",
                    "stateOrCountryDescription": "CALIFORNIA",
                }
            },
            "filings": {
                "recent": {
                    "filingDate": ["2026-02-01"],
                }
            },
        }
        adapter = EdgarIssuerAdapter(payload_loader=lambda context: payload)
        extracted = adapter.run(AdapterRunContext(run_id=uuid4(), requested_at=aware_datetime()))

        self.assertEqual(len(extracted.company_records), 1)
        self.assertEqual(len(extracted.evidence_records), 1)
        self.assertEqual(len(extracted.observations), 4)

        company = extracted.company_records[0]
        self.assertEqual(company.canonical_name, "Apple Inc.")
        self.assertEqual(company.hq_country_code, "US")
        self.assertEqual(company.cik, "0000320193")
        self.assertEqual(company.aliases[0].value, "Apple Computer, Inc.")
        self.assertEqual(
            company.primary_identifier(CompanyIdentifierType.CIK).value,
            "0000320193",
        )
        ticker_values = [
            identifier.value
            for identifier in company.identifiers
            if identifier.identifier_type == CompanyIdentifierType.TICKER
        ]
        self.assertEqual(ticker_values, ["AAPL"])

    def test_edgar_adapter_requires_country_information(self) -> None:
        payload = {
            "cik": 320193,
            "name": "Apple Inc.",
            "tickers": ["AAPL"],
        }
        adapter = EdgarIssuerAdapter(payload_loader=lambda context: payload)

        with self.assertRaisesRegex(ValueError, "infer country"):
            adapter.run(AdapterRunContext(run_id=uuid4(), requested_at=aware_datetime()))

    def test_epa_adapter_emits_facility_records_and_operator_company(self) -> None:
        adapter = EpaFacilityAdapter(payload_loader=lambda context: load_fixture("epa_facilities.json"))
        extracted = adapter.run(AdapterRunContext(run_id=uuid4(), requested_at=aware_datetime()))

        self.assertEqual(len(extracted.company_records), 1)
        self.assertEqual(len(extracted.facility_records), 1)
        self.assertEqual(len(extracted.evidence_records), 1)
        self.assertEqual(len(extracted.observations), 5)

        operator = extracted.company_records[0]
        facility = extracted.facility_records[0]
        self.assertEqual(operator.canonical_name, "Micron Technology, Inc.")
        self.assertEqual(operator.hq_country_code, "US")
        self.assertEqual(facility.facility_name, "Manassas Fab")
        self.assertEqual(facility.country_code, "US")
        self.assertEqual(facility.operator_company_id, operator.company_id)
        self.assertTrue(facility.has_stage("STAGE.WAFER_FAB"))
        self.assertEqual(
            facility.primary_identifier(FacilityIdentifierType.EPA_FRS_ID).value,
            "110000000001",
        )

    def test_korea_prtr_adapter_emits_facility_records_and_operator_company(self) -> None:
        adapter = KoreaPrtrFacilityAdapter(payload_loader=lambda context: load_fixture("korea_prtr_facilities.json"))
        extracted = adapter.run(AdapterRunContext(run_id=uuid4(), requested_at=aware_datetime()))

        self.assertEqual(len(extracted.company_records), 1)
        self.assertEqual(len(extracted.facility_records), 1)
        self.assertEqual(len(extracted.evidence_records), 1)
        self.assertEqual(len(extracted.observations), 3)

        operator = extracted.company_records[0]
        facility = extracted.facility_records[0]
        self.assertEqual(operator.canonical_name, "SK hynix Inc.")
        self.assertEqual(operator.hq_country_code, "KR")
        self.assertEqual(facility.facility_name, "Icheon Campus")
        self.assertEqual(facility.country_code, "KR")
        self.assertEqual(facility.operator_company_id, operator.company_id)
        self.assertTrue(facility.has_stage("STAGE.WAFER_FAB"))
        self.assertEqual(
            facility.primary_identifier(FacilityIdentifierType.PRTR_ID).value,
            "PRTR-ICHEON-001",
        )


if __name__ == "__main__":
    unittest.main()
