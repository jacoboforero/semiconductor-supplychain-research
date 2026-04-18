"""Initial graph projector for canonical companies and basic location claims."""

from __future__ import annotations

from collections import defaultdict
from uuid import NAMESPACE_URL, UUID, uuid5

from semisupply.claims import ClaimRecord
from semisupply.normalize import CompanyCrosswalk
from semisupply.registry import CompanyIdentifierType, CompanyRecord, FacilityRecord
from semisupply.sources import RecordSubjectType
from semisupply.taxonomy import DEFAULT_TAXONOMY, CompanyTaxonomyMapping, TaxonomyCatalog

from .models import GraphEdge, GraphEdgeType, GraphNode, GraphNodeType, GraphProjection

_GRAPH_EDGE_NAMESPACE = uuid5(NAMESPACE_URL, "semisupply.graph.edge")


class InitialGraphProjector:
    """Project the first canonical companies and country relationships into graph records."""

    def __init__(self, *, taxonomy: TaxonomyCatalog = DEFAULT_TAXONOMY) -> None:
        self.taxonomy = taxonomy

    def project(
        self,
        *,
        canonical_company_records: list[CompanyRecord] | tuple[CompanyRecord, ...],
        canonical_facility_records: list[FacilityRecord] | tuple[FacilityRecord, ...] = (),
        claims: list[ClaimRecord] | tuple[ClaimRecord, ...],
        crosswalks: list[CompanyCrosswalk] | tuple[CompanyCrosswalk, ...],
        taxonomy_mappings: list[CompanyTaxonomyMapping] | tuple[CompanyTaxonomyMapping, ...] = (),
    ) -> GraphProjection:
        """Project canonical company records and mapped claims into graph nodes and edges."""

        ordered_companies = tuple(sorted(canonical_company_records, key=lambda company: str(company.company_id)))
        ordered_facilities = tuple(sorted(canonical_facility_records, key=lambda facility: str(facility.facility_id)))
        canonical_company_ids = {str(company.company_id) for company in ordered_companies}
        crosswalk_index = {str(crosswalk.source_company_id): crosswalk.canonical_company_id for crosswalk in crosswalks}
        taxonomy_mapping_index = {mapping.company_id: mapping for mapping in taxonomy_mappings}

        nodes_by_id: dict[str, GraphNode] = {}
        edges_by_id: dict[UUID, GraphEdge] = {}

        for company in ordered_companies:
            mapping = taxonomy_mapping_index.get(str(company.company_id))
            company_node = self._company_node(company, mapping=mapping)
            nodes_by_id[company_node.node_id] = company_node
            if mapping is not None:
                for role_code in mapping.role_codes:
                    role_node = self._role_node(role_code)
                    nodes_by_id[role_node.node_id] = role_node
                    role_edge = self._taxonomy_edge(
                        edge_type=GraphEdgeType.HAS_ROLE,
                        source_node_id=company_node.node_id,
                        target_node_id=role_node.node_id,
                        mapping=mapping,
                    )
                    edges_by_id[role_edge.edge_id] = role_edge
                for segment_code in mapping.segment_codes:
                    segment_node = self._segment_node(segment_code)
                    nodes_by_id[segment_node.node_id] = segment_node
                    segment_edge = self._taxonomy_edge(
                        edge_type=GraphEdgeType.IN_SEGMENT,
                        source_node_id=company_node.node_id,
                        target_node_id=segment_node.node_id,
                        mapping=mapping,
                    )
                    edges_by_id[segment_edge.edge_id] = segment_edge

        for facility in ordered_facilities:
            facility_node = self._facility_node(facility)
            nodes_by_id[facility_node.node_id] = facility_node

            country_node = self._country_node(facility.country_code)
            nodes_by_id[country_node.node_id] = country_node
            country_edge = self._facility_located_in_edge(facility_node_id=facility_node.node_id, country_node_id=country_node.node_id)
            edges_by_id[country_edge.edge_id] = country_edge

            canonical_operator_company_id = self._canonical_company_id(
                claim_subject_id=str(facility.operator_company_id),
                canonical_company_ids=canonical_company_ids,
                crosswalk_index=crosswalk_index,
            )
            if canonical_operator_company_id is not None:
                company_node_id = self._company_node_id(canonical_operator_company_id)
                company_facility_edge = self._operates_facility_edge(
                    company_node_id=company_node_id,
                    facility_node_id=facility_node.node_id,
                )
                edges_by_id[company_facility_edge.edge_id] = company_facility_edge

        for claim in claims:
            if claim.subject_type != RecordSubjectType.COMPANY:
                continue

            canonical_company_id = self._canonical_company_id(
                claim_subject_id=claim.subject_id,
                canonical_company_ids=canonical_company_ids,
                crosswalk_index=crosswalk_index,
            )
            if canonical_company_id is None:
                continue

            company_node_id = self._company_node_id(canonical_company_id)
            if claim.predicate == "HEADQUARTERED_IN" and claim.object_type == RecordSubjectType.COUNTRY and claim.object_id:
                country_node = self._country_node(claim.object_id)
                nodes_by_id[country_node.node_id] = country_node
                edge = self._headquartered_in_edge(
                    company_node_id=company_node_id,
                    country_node_id=country_node.node_id,
                    claim=claim,
                )
                edges_by_id[edge.edge_id] = edge

        return GraphProjection(
            nodes=tuple(nodes_by_id.values()),
            edges=tuple(edges_by_id.values()),
        )

    def _canonical_company_id(
        self,
        *,
        claim_subject_id: str,
        canonical_company_ids: set[str],
        crosswalk_index: dict[str, UUID],
    ) -> UUID | None:
        if claim_subject_id in canonical_company_ids:
            return UUID(claim_subject_id)
        return crosswalk_index.get(claim_subject_id)

    def _company_node(self, company: CompanyRecord, *, mapping: CompanyTaxonomyMapping | None) -> GraphNode:
        return GraphNode(
            node_id=self._company_node_id(company.company_id),
            node_type=GraphNodeType.COMPANY,
            display_name=company.canonical_name,
            properties={
                "company_id": str(company.company_id),
                "canonical_name": company.canonical_name,
                "hq_country_code": company.hq_country_code,
                "record_status": company.record_status.value,
                "identifiers": self._identifier_properties(company),
                "known_names": list(company.all_known_names),
                "role_codes": list(mapping.role_codes) if mapping is not None else [],
                "segment_codes": list(mapping.segment_codes) if mapping is not None else [],
                "chip_codes": list(mapping.chip_codes) if mapping is not None else [],
                "taxonomy_seed_id": mapping.matched_seed_id if mapping is not None else None,
            },
        )

    def _country_node(self, country_code: str) -> GraphNode:
        normalized_country_code = country_code.strip().upper()
        return GraphNode(
            node_id=self._country_node_id(normalized_country_code),
            node_type=GraphNodeType.COUNTRY,
            display_name=normalized_country_code,
            properties={"country_code": normalized_country_code},
        )

    def _facility_node(self, facility: FacilityRecord) -> GraphNode:
        return GraphNode(
            node_id=self._facility_node_id(facility.facility_id),
            node_type=GraphNodeType.FACILITY,
            display_name=facility.facility_name,
            properties={
                "facility_id": str(facility.facility_id),
                "facility_name": facility.facility_name,
                "facility_type_code": facility.facility_type_code,
                "country_code": facility.country_code,
                "operator_company_id": str(facility.operator_company_id),
                "owner_company_id": str(facility.owner_company_id) if facility.owner_company_id is not None else None,
                "facility_status": facility.facility_status.value,
                "record_status": facility.record_status.value,
                "address_text": facility.address_text,
                "latitude": facility.latitude,
                "longitude": facility.longitude,
                "jurisdiction_code": facility.jurisdiction_code,
                "stage_codes": list(facility.stage_codes),
                "identifiers": self._facility_identifier_properties(facility),
            },
        )

    def _role_node(self, role_code: str) -> GraphNode:
        entry = self.taxonomy.require(role_code)
        return GraphNode(
            node_id=f"role:{entry.code}",
            node_type=GraphNodeType.ROLE,
            display_name=entry.label,
            properties={
                "taxonomy_code": entry.code,
                "description": entry.description,
                "taxonomy_kind": entry.kind.value,
            },
        )

    def _segment_node(self, segment_code: str) -> GraphNode:
        entry = self.taxonomy.require(segment_code)
        return GraphNode(
            node_id=f"segment:{entry.code}",
            node_type=GraphNodeType.SEGMENT,
            display_name=entry.label,
            properties={
                "taxonomy_code": entry.code,
                "description": entry.description,
                "taxonomy_kind": entry.kind.value,
            },
        )

    def _headquartered_in_edge(
        self,
        *,
        company_node_id: str,
        country_node_id: str,
        claim: ClaimRecord,
    ) -> GraphEdge:
        return GraphEdge(
            edge_id=uuid5(_GRAPH_EDGE_NAMESPACE, f"{claim.claim_id}:{GraphEdgeType.LOCATED_IN.value}"),
            edge_type=GraphEdgeType.LOCATED_IN,
            source_node_id=company_node_id,
            target_node_id=country_node_id,
            claim_id=claim.claim_id,
            confidence=claim.confidence,
            valid_from=claim.valid_from,
            valid_to=claim.valid_to,
            properties={
                "predicate": claim.predicate,
                "supporting_observation_count": len(claim.supporting_observation_ids),
            },
        )

    def _taxonomy_edge(
        self,
        *,
        edge_type: GraphEdgeType,
        source_node_id: str,
        target_node_id: str,
        mapping: CompanyTaxonomyMapping,
    ) -> GraphEdge:
        return GraphEdge(
            edge_id=uuid5(
                _GRAPH_EDGE_NAMESPACE,
                f"{mapping.company_id}:{edge_type.value}:{target_node_id}",
            ),
            edge_type=edge_type,
            source_node_id=source_node_id,
            target_node_id=target_node_id,
            confidence=mapping.confidence,
            properties={
                "mapping_source": "curated_taxonomy_seed",
                "matched_seed_id": mapping.matched_seed_id,
                "supporting_basis": "curated_company_seed",
            },
        )

    def _facility_located_in_edge(self, *, facility_node_id: str, country_node_id: str) -> GraphEdge:
        return GraphEdge(
            edge_id=uuid5(_GRAPH_EDGE_NAMESPACE, f"{facility_node_id}:{GraphEdgeType.LOCATED_IN.value}:{country_node_id}"),
            edge_type=GraphEdgeType.LOCATED_IN,
            source_node_id=facility_node_id,
            target_node_id=country_node_id,
            properties={"predicate": "FACILITY_LOCATED_IN", "source": "facility_registry_record"},
        )

    def _operates_facility_edge(self, *, company_node_id: str, facility_node_id: str) -> GraphEdge:
        return GraphEdge(
            edge_id=uuid5(_GRAPH_EDGE_NAMESPACE, f"{company_node_id}:{GraphEdgeType.OPERATES_FACILITY.value}:{facility_node_id}"),
            edge_type=GraphEdgeType.OPERATES_FACILITY,
            source_node_id=company_node_id,
            target_node_id=facility_node_id,
            properties={"predicate": "OPERATES_FACILITY", "source": "facility_registry_record"},
        )

    def _identifier_properties(self, company: CompanyRecord) -> dict[str, list[str]]:
        grouped: dict[str, list[str]] = defaultdict(list)
        for identifier in company.identifiers:
            grouped[identifier.identifier_type.value].append(identifier.value)
        return {key: sorted(values) for key, values in sorted(grouped.items())}

    def _facility_identifier_properties(self, facility: FacilityRecord) -> dict[str, list[str]]:
        grouped: dict[str, list[str]] = defaultdict(list)
        for identifier in facility.identifiers:
            grouped[identifier.identifier_type.value].append(identifier.value)
        return {key: sorted(values) for key, values in sorted(grouped.items())}

    def _company_node_id(self, company_id: UUID) -> str:
        return f"company:{company_id}"

    def _facility_node_id(self, facility_id: UUID) -> str:
        return f"facility:{facility_id}"

    def _country_node_id(self, country_code: str) -> str:
        return f"country:{country_code}"
