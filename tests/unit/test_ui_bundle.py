"""Unit tests for the UI bundle builder."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
from uuid import uuid4

from semisupply.graph.models import GraphEdge, GraphEdgeType, GraphNode, GraphNodeType, GraphProjection
from semisupply.graph.ui_bundle import UiBundleBuilder
from semisupply.runs.models import P0RunManifest, RunStatus, SourceRunSummary


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


class UiBundleBuilderTests(unittest.TestCase):
    def test_bundle_builder_collapses_duplicate_edges_and_computes_country_counts(self) -> None:
        company_node = GraphNode(
            node_id="company:123",
            node_type=GraphNodeType.COMPANY,
            display_name="Apple Inc.",
            properties={"company_id": "123", "hq_country_code": "US"},
        )
        country_node = GraphNode(
            node_id="country:US",
            node_type=GraphNodeType.COUNTRY,
            display_name="US",
            properties={"country_code": "US"},
        )
        projection = GraphProjection(
            nodes=(company_node, country_node),
            edges=(
                GraphEdge(
                    edge_id=uuid4(),
                    edge_type=GraphEdgeType.LOCATED_IN,
                    source_node_id="company:123",
                    target_node_id="country:US",
                    claim_id=uuid4(),
                    confidence=0.9,
                    properties={"predicate": "HEADQUARTERED_IN"},
                ),
                GraphEdge(
                    edge_id=uuid4(),
                    edge_type=GraphEdgeType.LOCATED_IN,
                    source_node_id="company:123",
                    target_node_id="country:US",
                    claim_id=uuid4(),
                    confidence=1.0,
                    properties={"predicate": "HEADQUARTERED_IN"},
                ),
            ),
        )
        manifest = P0RunManifest(
            run_id=uuid4(),
            pipeline_key="p0",
            requested_at=aware_datetime(),
            completed_at=aware_datetime(hour=12, minute=5),
            status=RunStatus.SUCCEEDED,
            source_runs=(
                SourceRunSummary(
                    source_key="gleif",
                    snapshot_count=1,
                    company_record_count=1,
                    facility_record_count=0,
                    evidence_record_count=1,
                    observation_count=3,
                    claim_count=3,
                ),
                SourceRunSummary(
                    source_key="edgar",
                    snapshot_count=1,
                    company_record_count=1,
                    facility_record_count=0,
                    evidence_record_count=1,
                    observation_count=4,
                    claim_count=4,
                ),
            ),
            artifacts=(),
            snapshot_count=2,
            source_company_record_count=2,
            source_facility_record_count=0,
            evidence_record_count=2,
            observation_count=7,
            claim_count=7,
            canonical_company_count=1,
            canonical_facility_count=0,
            crosswalk_count=2,
            resolution_decision_count=2,
            facility_crosswalk_count=0,
            facility_resolution_decision_count=0,
            graph_node_count=2,
            graph_edge_count=2,
        )

        bundle = UiBundleBuilder().build(manifest=manifest, projection=projection)

        self.assertEqual(bundle.summary.company_count, 1)
        self.assertEqual(bundle.summary.facility_count, 0)
        self.assertEqual(bundle.summary.country_count, 1)
        self.assertEqual(bundle.summary.role_count, 0)
        self.assertEqual(bundle.summary.segment_count, 0)
        self.assertEqual(bundle.summary.edge_count, 1)
        self.assertEqual(bundle.summary.claim_count, 7)
        self.assertEqual(bundle.source_keys, ("gleif", "edgar"))
        self.assertEqual(len(bundle.edges), 1)
        self.assertEqual(bundle.edges[0].claim_count, 2)
        self.assertEqual(bundle.edges[0].confidence, 1.0)
        self.assertEqual(bundle.edges[0].properties["supporting_edge_count"], 2)
        self.assertEqual(bundle.countries[0].country_code, "US")
        self.assertEqual(bundle.countries[0].company_count, 1)
        self.assertEqual(bundle.countries[0].facility_count, 0)
        self.assertEqual(bundle.nodes[0].degree + bundle.nodes[1].degree, 2)

    def test_bundle_builder_preserves_dependency_edge_properties(self) -> None:
        supplier = GraphNode(
            node_id="company:supplier",
            node_type=GraphNodeType.COMPANY,
            display_name="TSMC",
            properties={"company_id": "supplier"},
        )
        customer = GraphNode(
            node_id="company:customer",
            node_type=GraphNodeType.COMPANY,
            display_name="Apple",
            properties={"company_id": "customer"},
        )
        projection = GraphProjection(
            nodes=(supplier, customer),
            edges=(
                GraphEdge(
                    edge_id=uuid4(),
                    edge_type=GraphEdgeType.SUPPLIES_TO,
                    source_node_id=supplier.node_id,
                    target_node_id=customer.node_id,
                    claim_id=uuid4(),
                    confidence=0.96,
                    properties={
                        "predicate": "FABRICATES_FOR",
                        "predicate_label": "Fabricates For",
                        "item_code": "SERVICE.FOUNDRY_WAFER_FAB",
                        "item_label": "Foundry Wafer Fab",
                        "stage_code": "STAGE.WAFER_FAB",
                        "stage_label": "Wafer Fab",
                        "sources": [{"source_id": "demo", "label": "Demo source"}],
                    },
                ),
            ),
        )
        manifest = P0RunManifest(
            run_id=uuid4(),
            pipeline_key="p0",
            requested_at=aware_datetime(),
            completed_at=aware_datetime(hour=12, minute=5),
            status=RunStatus.SUCCEEDED,
            source_runs=(
                SourceRunSummary(
                    source_key="dependency_seed",
                    snapshot_count=1,
                    company_record_count=0,
                    facility_record_count=0,
                    evidence_record_count=1,
                    observation_count=1,
                    claim_count=1,
                ),
            ),
            artifacts=(),
            snapshot_count=1,
            source_company_record_count=0,
            source_facility_record_count=0,
            evidence_record_count=1,
            observation_count=1,
            claim_count=1,
            canonical_company_count=2,
            canonical_facility_count=0,
            crosswalk_count=0,
            resolution_decision_count=0,
            facility_crosswalk_count=0,
            facility_resolution_decision_count=0,
            graph_node_count=2,
            graph_edge_count=1,
        )

        bundle = UiBundleBuilder().build(manifest=manifest, projection=projection)

        self.assertEqual(bundle.summary.edge_count, 1)
        self.assertEqual(bundle.edges[0].edge_type, GraphEdgeType.SUPPLIES_TO)
        self.assertEqual(bundle.edges[0].properties["predicate"], "FABRICATES_FOR")
        self.assertEqual(bundle.edges[0].properties["item_label"], "Foundry Wafer Fab")
        self.assertEqual(bundle.edges[0].properties["sources"][0]["source_id"], "demo")


if __name__ == "__main__":
    unittest.main()
