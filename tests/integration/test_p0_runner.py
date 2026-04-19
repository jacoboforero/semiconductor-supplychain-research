"""Integration tests for the fixture-backed P0 pipeline runner."""

from __future__ import annotations

import json
import tempfile
import unittest
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from semisupply.runs import P0PipelineRunner, RunStatus
from semisupply.sources.p0 import (
    CuratedCompanySeedAdapter,
    CuratedDependencySeedAdapter,
    EdgarIssuerAdapter,
    EpaFacilityAdapter,
    GleifCompanyAdapter,
    KoreaPrtrFacilityAdapter,
)


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


class P0RunnerIntegrationTests(unittest.TestCase):
    def test_fixture_backed_runner_writes_manifest_and_artifacts(self) -> None:
        repo_root = Path(__file__).resolve().parents[2]
        fixture_dir = repo_root / "tests" / "fixtures" / "p0"

        runner = P0PipelineRunner(
            adapters=(
                GleifCompanyAdapter(
                    payload_loader=lambda context: (fixture_dir / "gleif_company.json").read_text(encoding="utf-8")
                ),
                EdgarIssuerAdapter(
                    payload_loader=lambda context: (fixture_dir / "edgar_company.json").read_text(encoding="utf-8")
                ),
            )
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            result = runner.run(
                artifact_root=Path(tmpdir) / "artifacts",
                requested_at=aware_datetime(),
                run_id=uuid4(),
            )

            self.assertTrue(result.manifest_path.exists())
            self.assertEqual(result.manifest.status, RunStatus.SUCCEEDED)
            self.assertEqual(result.manifest.snapshot_count, 2)
            self.assertEqual(result.manifest.source_company_record_count, 12)
            self.assertEqual(result.manifest.source_facility_record_count, 0)
            self.assertEqual(result.manifest.evidence_record_count, 12)
            self.assertEqual(result.manifest.observation_count, 42)
            self.assertEqual(result.manifest.claim_count, 42)
            self.assertEqual(result.manifest.canonical_company_count, 11)
            self.assertEqual(result.manifest.canonical_facility_count, 0)
            self.assertEqual(result.manifest.crosswalk_count, 12)
            self.assertEqual(result.manifest.facility_crosswalk_count, 0)
            self.assertGreaterEqual(result.manifest.graph_node_count, 20)
            self.assertGreaterEqual(result.manifest.graph_edge_count, 30)

            manifest_payload = json.loads(result.manifest_path.read_text(encoding="utf-8"))
            self.assertEqual(manifest_payload["pipeline_key"], "p0")
            self.assertEqual(len(manifest_payload["source_runs"]), 2)
            self.assertEqual(len(manifest_payload["artifacts"]), 11)

            claims_payload = json.loads(result.artifact_paths["claims"].read_text(encoding="utf-8"))
            self.assertEqual(len(claims_payload), 42)

            resolution_payload = json.loads(result.artifact_paths["company_resolution"].read_text(encoding="utf-8"))
            self.assertEqual(len(resolution_payload["canonical_company_records"]), 11)
            canonical_names = {company["canonical_name"] for company in resolution_payload["canonical_company_records"]}
            self.assertIn("Apple Inc.", canonical_names)
            self.assertIn("Taiwan Semiconductor Manufacturing Company Limited", canonical_names)
            self.assertIn("ASML Holding N.V.", canonical_names)

            taxonomy_payload = json.loads(result.artifact_paths["taxonomy_mappings"].read_text(encoding="utf-8"))
            self.assertEqual(len(taxonomy_payload), 11)
            mapped_roles = {role for row in taxonomy_payload for role in row["role_codes"]}
            self.assertIn("ROLE.FOUNDRY", mapped_roles)
            self.assertIn("ROLE.OSAT", mapped_roles)
            self.assertIn("ROLE.EQUIPMENT_SUPPLIER", mapped_roles)

            graph_payload = json.loads(result.artifact_paths["graph_projection"].read_text(encoding="utf-8"))
            self.assertEqual(len(graph_payload["nodes"]), 28)
            self.assertEqual(len(graph_payload["edges"]), 38)
            node_types = {node["node_type"] for node in graph_payload["nodes"]}
            self.assertTrue({"Company", "Country", "Role", "Segment"}.issubset(node_types))

            ui_bundle_payload = json.loads(result.artifact_paths["ui_bundle"].read_text(encoding="utf-8"))
            self.assertEqual(ui_bundle_payload["summary"]["source_count"], 2)
            self.assertEqual(ui_bundle_payload["summary"]["company_count"], 11)
            self.assertEqual(ui_bundle_payload["summary"]["country_count"], 4)
            self.assertEqual(ui_bundle_payload["summary"]["role_count"], 8)
            self.assertEqual(ui_bundle_payload["summary"]["segment_count"], 5)
            self.assertEqual(ui_bundle_payload["summary"]["edge_count"], 37)
            self.assertEqual(ui_bundle_payload["countries"][0]["country_code"], "US")
            self.assertEqual(ui_bundle_payload["countries"][0]["company_count"], 6)

    def test_fixture_backed_runner_writes_facility_artifacts_when_facility_sources_exist(self) -> None:
        repo_root = Path(__file__).resolve().parents[2]
        fixture_dir = repo_root / "tests" / "fixtures" / "p0"

        runner = P0PipelineRunner(
            adapters=(
                EpaFacilityAdapter(
                    payload_loader=lambda context: (fixture_dir / "epa_facilities.json").read_text(encoding="utf-8")
                ),
                KoreaPrtrFacilityAdapter(
                    payload_loader=lambda context: (fixture_dir / "korea_prtr_facilities.json").read_text(encoding="utf-8")
                ),
            )
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            result = runner.run(
                artifact_root=Path(tmpdir) / "artifacts",
                requested_at=aware_datetime(),
                run_id=uuid4(),
            )

            self.assertEqual(result.manifest.status, RunStatus.SUCCEEDED)
            self.assertEqual(result.manifest.snapshot_count, 2)
            self.assertEqual(result.manifest.source_company_record_count, 2)
            self.assertEqual(result.manifest.source_facility_record_count, 2)
            self.assertEqual(result.manifest.canonical_company_count, 2)
            self.assertEqual(result.manifest.canonical_facility_count, 2)
            self.assertEqual(result.manifest.facility_crosswalk_count, 2)
            self.assertEqual(result.manifest.facility_resolution_decision_count, 2)
            self.assertGreaterEqual(result.manifest.graph_node_count, 6)
            self.assertGreaterEqual(result.manifest.graph_edge_count, 4)

            facility_resolution_payload = json.loads(result.artifact_paths["facility_resolution"].read_text(encoding="utf-8"))
            self.assertEqual(len(facility_resolution_payload["canonical_facility_records"]), 2)
            facility_names = {facility["facility_name"] for facility in facility_resolution_payload["canonical_facility_records"]}
            self.assertIn("Manassas Fab", facility_names)
            self.assertIn("Icheon Campus", facility_names)

            graph_payload = json.loads(result.artifact_paths["graph_projection"].read_text(encoding="utf-8"))
            node_types = {node["node_type"] for node in graph_payload["nodes"]}
            edge_types = {edge["edge_type"] for edge in graph_payload["edges"]}
            self.assertIn("Facility", node_types)
            self.assertIn("OPERATES_FACILITY", edge_types)

            ui_bundle_payload = json.loads(result.artifact_paths["ui_bundle"].read_text(encoding="utf-8"))
            self.assertEqual(ui_bundle_payload["summary"]["facility_count"], 2)
            facility_counts = {row["country_code"]: row["facility_count"] for row in ui_bundle_payload["countries"]}
            self.assertEqual(facility_counts["US"], 1)
            self.assertEqual(facility_counts["KR"], 1)

    def test_runner_supports_curated_200_company_seed_fixture(self) -> None:
        repo_root = Path(__file__).resolve().parents[2]
        fixture_dir = repo_root / "tests" / "fixtures" / "p0"
        contract_dir = repo_root / "contracts" / "v1"

        runner = P0PipelineRunner(
            adapters=(
                CuratedCompanySeedAdapter(
                    payload_loader=lambda context: (fixture_dir / "company_universe_seed.json").read_text(encoding="utf-8")
                ),
                CuratedDependencySeedAdapter(
                    payload_loader=lambda context: (contract_dir / "company_dependency_edges.v1.json").read_text(encoding="utf-8")
                ),
                EpaFacilityAdapter(
                    payload_loader=lambda context: (fixture_dir / "epa_facilities.json").read_text(encoding="utf-8")
                ),
                KoreaPrtrFacilityAdapter(
                    payload_loader=lambda context: (fixture_dir / "korea_prtr_facilities.json").read_text(encoding="utf-8")
                ),
            )
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            result = runner.run(
                artifact_root=Path(tmpdir) / "artifacts",
                requested_at=aware_datetime(),
                run_id=uuid4(),
            )

            self.assertEqual(result.manifest.status, RunStatus.SUCCEEDED)
            self.assertEqual(result.manifest.snapshot_count, 4)
            self.assertEqual(result.manifest.source_company_record_count, 202)
            self.assertEqual(result.manifest.source_facility_record_count, 2)
            self.assertEqual(result.manifest.canonical_company_count, 200)
            self.assertEqual(result.manifest.canonical_facility_count, 2)
            self.assertEqual(result.manifest.facility_crosswalk_count, 2)
            self.assertGreater(result.manifest.graph_node_count, 220)
            self.assertGreater(result.manifest.graph_edge_count, 470)

            taxonomy_payload = json.loads(result.artifact_paths["taxonomy_mappings"].read_text(encoding="utf-8"))
            self.assertEqual(len(taxonomy_payload), 200)
            mapped_roles = {role for row in taxonomy_payload for role in row["role_codes"]}
            self.assertIn("ROLE.FABLESS", mapped_roles)
            self.assertIn("ROLE.FOUNDRY", mapped_roles)
            self.assertIn("ROLE.WAFER_MANUFACTURER", mapped_roles)
            self.assertIn("ROLE.PHOTOMASK_SUPPLIER", mapped_roles)
            self.assertIn("ROLE.SUBSTRATE_MANUFACTURER", mapped_roles)

            ui_bundle_payload = json.loads(result.artifact_paths["ui_bundle"].read_text(encoding="utf-8"))
            self.assertEqual(ui_bundle_payload["summary"]["source_count"], 4)
            self.assertEqual(ui_bundle_payload["summary"]["company_count"], 200)
            self.assertEqual(ui_bundle_payload["summary"]["facility_count"], 2)
            self.assertGreaterEqual(ui_bundle_payload["summary"]["country_count"], 12)
            dependency_edges = [edge for edge in ui_bundle_payload["edges"] if edge["edge_type"] == "SUPPLIES_TO"]
            self.assertGreaterEqual(len(dependency_edges), 15)


if __name__ == "__main__":
    unittest.main()
