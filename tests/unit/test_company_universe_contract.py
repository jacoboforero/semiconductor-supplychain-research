"""Validation tests for the curated V1 company universe contract."""

from __future__ import annotations

import json
import re
import unittest
from collections import Counter
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
COMPANY_UNIVERSE_PATH = PROJECT_ROOT / "contracts" / "v1" / "company_universe.v1.json"
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class CompanyUniverseContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.payload = json.loads(COMPANY_UNIVERSE_PATH.read_text(encoding="utf-8"))

    def test_contract_metadata_is_present(self) -> None:
        self.assertEqual(self.payload["contract_version"], "v1")
        self.assertEqual(self.payload["created_at"], "2026-04-17")
        self.assertGreaterEqual(len(self.payload["selection_principles"]), 3)

    def test_contract_contains_exactly_200_companies(self) -> None:
        companies = self.payload["companies"]
        self.assertEqual(len(companies), 200)
        self.assertEqual(sum(self.payload["bucket_targets"].values()), 200)

    def test_bucket_counts_match_declared_targets(self) -> None:
        bucket_targets = self.payload["bucket_targets"]
        counts = Counter(company["primary_bucket"] for company in self.payload["companies"])

        self.assertEqual(dict(counts), bucket_targets)

    def test_company_records_have_unique_slugs_and_names(self) -> None:
        slugs = [company["company_slug"] for company in self.payload["companies"]]
        display_names = [company["display_name"] for company in self.payload["companies"]]

        self.assertEqual(len(slugs), len(set(slugs)))
        self.assertEqual(len(display_names), len(set(display_names)))
        self.assertTrue(all(SLUG_PATTERN.fullmatch(slug) for slug in slugs))
        self.assertTrue(all(name.strip() for name in display_names))

    def test_company_buckets_use_only_declared_bucket_codes(self) -> None:
        allowed_buckets = set(self.payload["bucket_targets"])
        company_buckets = {company["primary_bucket"] for company in self.payload["companies"]}

        self.assertEqual(company_buckets, allowed_buckets)


if __name__ == "__main__":
    unittest.main()
