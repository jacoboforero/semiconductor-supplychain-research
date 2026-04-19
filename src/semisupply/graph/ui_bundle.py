"""UI-oriented bundle contract derived from graph projection and run metadata."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
import json
from typing import TYPE_CHECKING
from uuid import UUID

from semisupply.sources.models import JsonValue

from .models import GraphEdge, GraphEdgeType, GraphNode, GraphNodeType, GraphProjection

if TYPE_CHECKING:
    from semisupply.runs.models import P0RunManifest


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def _validate_count(value: int, *, field_name: str) -> int:
    if value < 0:
        raise ValueError(f"{field_name} must be greater than or equal to 0")
    return value


@dataclass(frozen=True, slots=True)
class UiBundleSummary:
    """Top-level summary metrics for the prototype UI."""

    source_count: int
    company_count: int
    facility_count: int
    country_count: int
    role_count: int
    segment_count: int
    claim_count: int
    canonical_company_count: int
    node_count: int
    edge_count: int

    def __post_init__(self) -> None:
        _validate_count(self.source_count, field_name="source_count")
        _validate_count(self.company_count, field_name="company_count")
        _validate_count(self.facility_count, field_name="facility_count")
        _validate_count(self.country_count, field_name="country_count")
        _validate_count(self.role_count, field_name="role_count")
        _validate_count(self.segment_count, field_name="segment_count")
        _validate_count(self.claim_count, field_name="claim_count")
        _validate_count(self.canonical_company_count, field_name="canonical_company_count")
        _validate_count(self.node_count, field_name="node_count")
        _validate_count(self.edge_count, field_name="edge_count")


@dataclass(frozen=True, slots=True)
class UiCountrySummary:
    """Simple per-country summary for prototype side panels."""

    country_code: str
    company_count: int
    facility_count: int = 0

    def __post_init__(self) -> None:
        object.__setattr__(self, "country_code", _strip_required(self.country_code, field_name="country_code"))
        _validate_count(self.company_count, field_name="company_count")
        _validate_count(self.facility_count, field_name="facility_count")


@dataclass(frozen=True, slots=True)
class UiGraphNode:
    """Node record shaped for the prototype graph viewer."""

    node_id: str
    node_type: GraphNodeType
    display_name: str
    degree: int
    properties: dict[str, JsonValue]

    def __post_init__(self) -> None:
        object.__setattr__(self, "node_id", _strip_required(self.node_id, field_name="node_id"))
        object.__setattr__(self, "display_name", _strip_required(self.display_name, field_name="display_name"))
        _validate_count(self.degree, field_name="degree")


@dataclass(frozen=True, slots=True)
class UiGraphEdge:
    """Display-oriented edge record that can aggregate multiple raw graph edges."""

    edge_id: str
    edge_type: GraphEdgeType
    source_node_id: str
    target_node_id: str
    claim_ids: tuple[UUID, ...]
    claim_count: int
    confidence: float | None = None
    properties: dict[str, JsonValue] = None  # type: ignore[assignment]

    def __post_init__(self) -> None:
        object.__setattr__(self, "edge_id", _strip_required(self.edge_id, field_name="edge_id"))
        object.__setattr__(self, "source_node_id", _strip_required(self.source_node_id, field_name="source_node_id"))
        object.__setattr__(self, "target_node_id", _strip_required(self.target_node_id, field_name="target_node_id"))
        object.__setattr__(self, "claim_ids", tuple(self.claim_ids))
        _validate_count(self.claim_count, field_name="claim_count")
        if self.confidence is not None and not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")
        if self.properties is None:
            object.__setattr__(self, "properties", {})


@dataclass(frozen=True, slots=True)
class UiBundle:
    """Stable UI-facing export bundle for the prototype graph explorer."""

    run_id: UUID
    pipeline_key: str
    generated_at: datetime
    source_keys: tuple[str, ...]
    summary: UiBundleSummary
    countries: tuple[UiCountrySummary, ...]
    nodes: tuple[UiGraphNode, ...]
    edges: tuple[UiGraphEdge, ...]

    def __post_init__(self) -> None:
        object.__setattr__(self, "pipeline_key", _strip_required(self.pipeline_key, field_name="pipeline_key"))
        object.__setattr__(self, "source_keys", tuple(self.source_keys))
        object.__setattr__(self, "countries", tuple(self.countries))
        object.__setattr__(self, "nodes", tuple(self.nodes))
        object.__setattr__(self, "edges", tuple(self.edges))


class UiBundleBuilder:
    """Build a frontend-facing bundle from a run manifest and graph projection."""

    def build(self, *, manifest: P0RunManifest, projection: GraphProjection) -> UiBundle:
        """Return a UI bundle with collapsed display edges and summary metrics."""

        display_edges = self._collapse_edges(projection.edges)
        node_degrees = self._node_degrees(display_edges)
        display_nodes = tuple(
            UiGraphNode(
                node_id=node.node_id,
                node_type=node.node_type,
                display_name=node.display_name,
                degree=node_degrees.get(node.node_id, 0),
                properties=node.properties,
            )
            for node in projection.nodes
        )
        company_count = sum(1 for node in display_nodes if node.node_type == GraphNodeType.COMPANY)
        facility_count = sum(1 for node in display_nodes if node.node_type == GraphNodeType.FACILITY)
        country_count = sum(1 for node in display_nodes if node.node_type == GraphNodeType.COUNTRY)
        role_count = sum(1 for node in display_nodes if node.node_type == GraphNodeType.ROLE)
        segment_count = sum(1 for node in display_nodes if node.node_type == GraphNodeType.SEGMENT)
        node_type_by_id = {node.node_id: node.node_type for node in display_nodes}

        return UiBundle(
            run_id=manifest.run_id,
            pipeline_key=manifest.pipeline_key,
            generated_at=manifest.completed_at,
            source_keys=tuple(summary.source_key for summary in manifest.source_runs),
            summary=UiBundleSummary(
                source_count=len(manifest.source_runs),
                company_count=company_count,
                facility_count=facility_count,
                country_count=country_count,
                role_count=role_count,
                segment_count=segment_count,
                claim_count=manifest.claim_count,
                canonical_company_count=manifest.canonical_company_count,
                node_count=len(display_nodes),
                edge_count=len(display_edges),
            ),
            countries=self._country_summaries(display_edges, node_type_by_id=node_type_by_id),
            nodes=display_nodes,
            edges=display_edges,
        )

    def _collapse_edges(self, edges: tuple[GraphEdge, ...]) -> tuple[UiGraphEdge, ...]:
        grouped: dict[tuple[GraphEdgeType, str, str], list[GraphEdge]] = defaultdict(list)
        for edge in edges:
            grouped[(edge.edge_type, edge.source_node_id, edge.target_node_id)].append(edge)

        collapsed: list[UiGraphEdge] = []
        for edge_type, source_node_id, target_node_id in sorted(grouped):
            raw_edges = grouped[(edge_type, source_node_id, target_node_id)]
            claim_ids = tuple(edge.claim_id for edge in raw_edges if edge.claim_id is not None)
            confidences = [edge.confidence for edge in raw_edges if edge.confidence is not None]
            collapsed.append(
                UiGraphEdge(
                    edge_id=f"{edge_type.value}:{source_node_id}:{target_node_id}",
                    edge_type=edge_type,
                    source_node_id=source_node_id,
                    target_node_id=target_node_id,
                    claim_ids=claim_ids,
                    claim_count=len(raw_edges),
                    confidence=max(confidences) if confidences else None,
                    properties=self._merge_edge_properties(raw_edges),
                )
            )
        return tuple(collapsed)

    def _merge_edge_properties(self, raw_edges: list[GraphEdge]) -> dict[str, JsonValue]:
        merged: dict[str, JsonValue] = {
            "supporting_edge_count": len(raw_edges),
            "raw_edge_count": len(raw_edges),
        }
        keys = sorted({key for edge in raw_edges for key in edge.properties})
        for key in keys:
            values = [edge.properties[key] for edge in raw_edges if key in edge.properties]
            if not values:
                continue
            if all(value == values[0] for value in values[1:]):
                merged[key] = values[0]
                continue
            deduped: list[JsonValue] = []
            seen: set[str] = set()
            for value in values:
                token = json.dumps(value, sort_keys=True, separators=(",", ":"))
                if token in seen:
                    continue
                seen.add(token)
                deduped.append(value)
            merged[key] = deduped if len(deduped) > 1 else deduped[0]
        return merged

    def _node_degrees(self, edges: tuple[UiGraphEdge, ...]) -> dict[str, int]:
        degrees: dict[str, int] = defaultdict(int)
        for edge in edges:
            degrees[edge.source_node_id] += 1
            degrees[edge.target_node_id] += 1
        return dict(degrees)

    def _country_summaries(
        self,
        edges: tuple[UiGraphEdge, ...],
        *,
        node_type_by_id: dict[str, GraphNodeType],
    ) -> tuple[UiCountrySummary, ...]:
        companies_by_country: dict[str, set[str]] = defaultdict(set)
        facilities_by_country: dict[str, set[str]] = defaultdict(set)
        for edge in edges:
            if edge.edge_type != GraphEdgeType.LOCATED_IN:
                continue
            if not edge.target_node_id.startswith("country:"):
                continue
            country_code = edge.target_node_id.removeprefix("country:")
            source_node_type = node_type_by_id.get(edge.source_node_id)
            if source_node_type == GraphNodeType.COMPANY:
                companies_by_country[country_code].add(edge.source_node_id)
            elif source_node_type == GraphNodeType.FACILITY:
                facilities_by_country[country_code].add(edge.source_node_id)

        all_country_codes = set(companies_by_country) | set(facilities_by_country)

        return tuple(
            UiCountrySummary(
                country_code=country_code,
                company_count=len(companies_by_country.get(country_code, set())),
                facility_count=len(facilities_by_country.get(country_code, set())),
            )
            for country_code in sorted(
                all_country_codes,
                key=lambda code: (
                    -len(companies_by_country.get(code, set())),
                    -len(facilities_by_country.get(code, set())),
                    code,
                ),
            )
        )
