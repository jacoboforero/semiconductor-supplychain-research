"""Typed graph-projection records derived from normalized pipeline layers."""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID

from semisupply.sources.models import JsonValue


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def _validate_aware_datetime(value: datetime, *, field_name: str) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware")
    return value


def _validate_json_value(value: JsonValue, *, field_name: str) -> None:
    if value is None or isinstance(value, (bool, int, str)):
        return
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError(f"{field_name} must not contain non-finite floats")
        return
    if isinstance(value, list):
        for index, item in enumerate(value):
            _validate_json_value(item, field_name=f"{field_name}[{index}]")
        return
    if isinstance(value, dict):
        for key, item in value.items():
            if not isinstance(key, str):
                raise ValueError(f"{field_name} keys must be strings")
            _validate_json_value(item, field_name=f"{field_name}.{key}")
        return
    raise ValueError(f"{field_name} must be JSON-compatible")


def _validate_properties(value: dict[str, JsonValue]) -> dict[str, JsonValue]:
    normalized = dict(value)
    for key, item in normalized.items():
        if not isinstance(key, str):
            raise ValueError("properties keys must be strings")
        _validate_json_value(item, field_name=f"properties.{key}")
    return normalized


class GraphNodeType(StrEnum):
    """Supported node types for the storage-agnostic graph projection."""

    COMPANY = "Company"
    COUNTRY = "Country"
    ROLE = "Role"
    SEGMENT = "Segment"
    FACILITY = "Facility"
    MATERIAL_OR_ITEM_CATEGORY = "MaterialOrItemCategory"
    POLICY_ENTITY = "PolicyEntity"


class GraphEdgeType(StrEnum):
    """Supported edge types for the storage-agnostic graph projection."""

    LOCATED_IN = "LOCATED_IN"
    HAS_ROLE = "HAS_ROLE"
    IN_SEGMENT = "IN_SEGMENT"
    OPERATES_FACILITY = "OPERATES_FACILITY"
    SUBJECT_TO_RESTRICTION = "SUBJECT_TO_RESTRICTION"
    DEPENDS_ON_ITEM = "DEPENDS_ON_ITEM"
    RELATED_TO_POLICY_ENTITY = "RELATED_TO_POLICY_ENTITY"


@dataclass(frozen=True, slots=True)
class GraphNode:
    """A projected graph node for the analytical graph view."""

    node_id: str
    node_type: GraphNodeType
    display_name: str
    properties: dict[str, JsonValue]

    def __post_init__(self) -> None:
        object.__setattr__(self, "node_id", _strip_required(self.node_id, field_name="node_id"))
        object.__setattr__(self, "display_name", _strip_required(self.display_name, field_name="display_name"))
        object.__setattr__(self, "properties", _validate_properties(self.properties))


@dataclass(frozen=True, slots=True)
class GraphEdge:
    """A projected graph edge that preserves provenance back to a claim when available."""

    edge_id: UUID
    edge_type: GraphEdgeType
    source_node_id: str
    target_node_id: str
    properties: dict[str, JsonValue]
    claim_id: UUID | None = None
    confidence: float | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_node_id", _strip_required(self.source_node_id, field_name="source_node_id"))
        object.__setattr__(self, "target_node_id", _strip_required(self.target_node_id, field_name="target_node_id"))
        object.__setattr__(self, "properties", _validate_properties(self.properties))
        if self.confidence is not None and not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")
        if self.valid_from is not None:
            _validate_aware_datetime(self.valid_from, field_name="valid_from")
        if self.valid_to is not None:
            _validate_aware_datetime(self.valid_to, field_name="valid_to")
        if self.valid_from is not None and self.valid_to is not None and self.valid_from > self.valid_to:
            raise ValueError("valid_from must be earlier than or equal to valid_to")


@dataclass(frozen=True, slots=True)
class GraphProjection:
    """A storage-agnostic graph view built from canonical records and claims."""

    nodes: tuple[GraphNode, ...] = ()
    edges: tuple[GraphEdge, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "nodes", tuple(self.nodes))
        object.__setattr__(self, "edges", tuple(self.edges))
