"""Unit tests for initial graph projection models and projector behavior."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
from uuid import uuid4

from semisupply.claims import DirectObservationClaimBuilder
from semisupply.graph import GraphEdgeType, GraphNodeType, InitialGraphProjector
from semisupply.normalize import CompanyResolver, SourceCompanyRecord
from semisupply.registry import (
    CompanyIdentifier,
    CompanyIdentifierType,
    CompanyRecord,
    EntityType,
    FacilityIdentifier,
    FacilityIdentifierType,
    FacilityRecord,
    FacilityStatus,
    RecordStatus,
)
from semisupply.sources import Observation, RecordSubjectType
from semisupply.taxonomy import default_company_taxonomy_mapper


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


def company_record(*, company_id=None, canonical_name: str, country_code: str) -> CompanyRecord:
    return CompanyRecord(
        company_id=company_id or uuid4(),
        canonical_name=canonical_name,
        entity_type=EntityType.COMPANY,
        hq_country_code=country_code,
        record_status=RecordStatus.ACTIVE,
        observed_at=aware_datetime(),
        identifiers=(
            CompanyIdentifier(
                identifier_type=CompanyIdentifierType.LEI,
                value="5493001KJTIIGC8Y1R12",
                issuer="GLEIF",
                observed_at=aware_datetime(),
            ),
        ),
    )


def facility_record(*, operator_company_id, facility_id=None) -> FacilityRecord:
    return FacilityRecord(
        facility_id=facility_id or uuid4(),
        facility_name="Manassas Fab",
        facility_type_code="FAC.FAB",
        country_code="US",
        operator_company_id=operator_company_id,
        record_status=RecordStatus.ACTIVE,
        facility_status=FacilityStatus.OPERATING,
        observed_at=aware_datetime(),
        stage_codes=("STAGE.WAFER_FAB",),
        identifiers=(
            FacilityIdentifier(
                identifier_type=FacilityIdentifierType.EPA_FRS_ID,
                value="110000000001",
                issuer="EPA",
                observed_at=aware_datetime(),
            ),
        ),
    )


class GraphProjectionTests(unittest.TestCase):
    def test_projector_emits_company_country_and_located_in_edge(self) -> None:
        resolver = CompanyResolver()
        builder = DirectObservationClaimBuilder()
        projector = InitialGraphProjector()

        source_company = company_record(
            company_id=uuid4(),
            canonical_name="Example Semiconductor Holdings Ltd.",
            country_code="KR",
        )
        resolution = resolver.resolve((SourceCompanyRecord(source_key="gleif", company_record=source_company),))
        claim = builder.build_from_observation(
            Observation(
                observation_id=uuid4(),
                subject_type=RecordSubjectType.COMPANY,
                subject_id=str(source_company.company_id),
                observation_type="company_hq_country_observed",
                observed_value="KR",
                evidence_id=uuid4(),
                observed_at=aware_datetime(),
                normalized_value="KR",
            )
        )

        self.assertIsNotNone(claim)
        projection = projector.project(
            canonical_company_records=resolution.canonical_company_records,
            claims=(claim,),
            crosswalks=resolution.crosswalks,
        )

        self.assertEqual(len(projection.nodes), 2)
        self.assertEqual(len(projection.edges), 1)

        node_types = {node.node_type for node in projection.nodes}
        self.assertEqual(node_types, {GraphNodeType.COMPANY, GraphNodeType.COUNTRY})

        company_node = next(node for node in projection.nodes if node.node_type == GraphNodeType.COMPANY)
        edge = projection.edges[0]
        self.assertEqual(company_node.display_name, "Example Semiconductor Holdings Ltd.")
        self.assertEqual(company_node.properties["hq_country_code"], "KR")
        self.assertEqual(edge.edge_type, GraphEdgeType.LOCATED_IN)
        self.assertEqual(edge.claim_id, claim.claim_id)
        self.assertEqual(edge.target_node_id, "country:KR")
        self.assertEqual(edge.properties["predicate"], "HEADQUARTERED_IN")

    def test_projector_emits_role_and_segment_nodes_for_taxonomy_mappings(self) -> None:
        resolver = CompanyResolver()
        projector = InitialGraphProjector()
        mapper = default_company_taxonomy_mapper()

        source_company = CompanyRecord(
            company_id=uuid4(),
            canonical_name="Apple Inc.",
            entity_type=EntityType.COMPANY,
            hq_country_code="US",
            record_status=RecordStatus.ACTIVE,
            observed_at=aware_datetime(),
            identifiers=(
                CompanyIdentifier(
                    identifier_type=CompanyIdentifierType.CIK,
                    value="0000320193",
                    issuer="SEC",
                    observed_at=aware_datetime(),
                ),
            ),
        )
        resolution = resolver.resolve((SourceCompanyRecord(source_key="edgar", company_record=source_company),))
        mapping = mapper.map_company(resolution.canonical_company_records[0])

        self.assertIsNotNone(mapping)
        projection = projector.project(
            canonical_company_records=resolution.canonical_company_records,
            claims=(),
            crosswalks=resolution.crosswalks,
            taxonomy_mappings=(mapping,),
        )

        node_types = {node.node_type for node in projection.nodes}
        self.assertIn(GraphNodeType.COMPANY, node_types)
        self.assertIn(GraphNodeType.ROLE, node_types)
        self.assertIn(GraphNodeType.SEGMENT, node_types)

        edge_types = {edge.edge_type for edge in projection.edges}
        self.assertEqual(edge_types, {GraphEdgeType.HAS_ROLE, GraphEdgeType.IN_SEGMENT})
        company_node = next(node for node in projection.nodes if node.node_type == GraphNodeType.COMPANY)
        self.assertEqual(company_node.properties["role_codes"], ["ROLE.FABLESS"])
        self.assertEqual(company_node.properties["segment_codes"], ["SEG.DESIGN_SOFTWARE"])

    def test_projector_skips_claims_without_canonical_company_mapping(self) -> None:
        projector = InitialGraphProjector()
        builder = DirectObservationClaimBuilder()
        claim = builder.build_from_observation(
            Observation(
                observation_id=uuid4(),
                subject_type=RecordSubjectType.COMPANY,
                subject_id=str(uuid4()),
                observation_type="issuer_country_observed",
                observed_value="US",
                evidence_id=uuid4(),
                observed_at=aware_datetime(),
                normalized_value="US",
            )
        )

        self.assertIsNotNone(claim)
        projection = projector.project(
            canonical_company_records=(),
            claims=(claim,),
            crosswalks=(),
        )

        self.assertEqual(projection.nodes, ())
        self.assertEqual(projection.edges, ())

    def test_projector_emits_facility_and_operator_edges(self) -> None:
        resolver = CompanyResolver()
        projector = InitialGraphProjector()

        source_company = company_record(
            company_id=uuid4(),
            canonical_name="Micron Technology, Inc.",
            country_code="US",
        )
        resolution = resolver.resolve((SourceCompanyRecord(source_key="epa_frs", company_record=source_company),))
        canonical_company = resolution.canonical_company_records[0]
        facility = facility_record(operator_company_id=canonical_company.company_id)

        projection = projector.project(
            canonical_company_records=resolution.canonical_company_records,
            canonical_facility_records=(facility,),
            claims=(),
            crosswalks=resolution.crosswalks,
        )

        node_types = {node.node_type for node in projection.nodes}
        self.assertTrue({GraphNodeType.COMPANY, GraphNodeType.FACILITY, GraphNodeType.COUNTRY}.issubset(node_types))

        edge_types = {edge.edge_type for edge in projection.edges}
        self.assertIn(GraphEdgeType.OPERATES_FACILITY, edge_types)
        self.assertIn(GraphEdgeType.LOCATED_IN, edge_types)
        facility_node = next(node for node in projection.nodes if node.node_type == GraphNodeType.FACILITY)
        self.assertEqual(facility_node.display_name, "Manassas Fab")
        self.assertEqual(facility_node.properties["facility_type_code"], "FAC.FAB")


if __name__ == "__main__":
    unittest.main()
