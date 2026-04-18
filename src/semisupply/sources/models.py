"""Typed source-layer records for snapshots, evidence, and observations."""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID

JsonValue = None | bool | int | float | str | list["JsonValue"] | dict[str, "JsonValue"]


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def _strip_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _validate_aware_datetime(value: datetime, *, field_name: str) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware")
    return value


def _validate_url(value: str | None, *, field_name: str) -> str | None:
    normalized = _strip_optional(value)
    if normalized is None:
        return None
    if "://" not in normalized:
        raise ValueError(f"{field_name} must include a URL scheme")
    return normalized


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


class SourceType(StrEnum):
    """High-level categories for captured sources."""

    REGISTRY_DATASET = "registry_dataset"
    ISSUER_METADATA = "issuer_metadata"
    FILING = "filing"
    REGULATORY_DATASET = "regulatory_dataset"
    POLICY_LIST = "policy_list"
    REPORT = "report"
    OTHER = "other"


class CaptureMethod(StrEnum):
    """How a snapshot was acquired."""

    API = "api"
    BULK_DOWNLOAD = "bulk_download"
    FILE_DOWNLOAD = "file_download"
    PORTAL_EXPORT = "portal_export"
    MANUAL_CAPTURE = "manual_capture"
    SCRAPE = "scrape"
    OTHER = "other"


class EvidenceType(StrEnum):
    """Granularity of evidence extracted from a snapshot."""

    DOCUMENT = "document"
    DOCUMENT_SECTION = "document_section"
    DATASET_ROW = "dataset_row"
    TABLE_ROW = "table_row"
    LIST_ENTRY = "list_entry"
    OTHER = "other"


class RecordSubjectType(StrEnum):
    """Canonical record types referenced by observations."""

    COMPANY = "company"
    FACILITY = "facility"
    POLICY_ENTITY = "policy_entity"
    COUNTRY = "country"
    ITEM_CATEGORY = "item_category"
    SOURCE_ARTIFACT = "source_artifact"
    OTHER = "other"


@dataclass(frozen=True, slots=True)
class SourceSnapshot:
    """A retrieved source artifact or source dataset version."""

    snapshot_id: UUID
    source_key: str
    source_type: SourceType
    retrieved_at: datetime
    capture_method: CaptureMethod
    content_ref: str
    content_hash: str
    source_url: str | None = None
    source_version: str | None = None
    notes: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))
        object.__setattr__(self, "content_ref", _strip_required(self.content_ref, field_name="content_ref"))
        object.__setattr__(self, "content_hash", _strip_required(self.content_hash, field_name="content_hash"))
        object.__setattr__(self, "source_url", _validate_url(self.source_url, field_name="source_url"))
        object.__setattr__(self, "source_version", _strip_optional(self.source_version))
        object.__setattr__(self, "notes", _strip_optional(self.notes))
        _validate_aware_datetime(self.retrieved_at, field_name="retrieved_at")


@dataclass(frozen=True, slots=True)
class EvidenceRecord:
    """A specific source artifact or fragment used to support later reasoning."""

    evidence_id: UUID
    snapshot_id: UUID
    evidence_type: EvidenceType
    source_key: str
    retrieved_at: datetime
    document_ref: str | None = None
    page_ref: str | None = None
    section_ref: str | None = None
    row_ref: str | None = None
    quote_text: str | None = None
    language: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))
        object.__setattr__(self, "document_ref", _strip_optional(self.document_ref))
        object.__setattr__(self, "page_ref", _strip_optional(self.page_ref))
        object.__setattr__(self, "section_ref", _strip_optional(self.section_ref))
        object.__setattr__(self, "row_ref", _strip_optional(self.row_ref))
        object.__setattr__(self, "quote_text", _strip_optional(self.quote_text))
        object.__setattr__(self, "language", _strip_optional(self.language))
        _validate_aware_datetime(self.retrieved_at, field_name="retrieved_at")


@dataclass(frozen=True, slots=True)
class Observation:
    """A source-bound observation captured from one evidence record."""

    observation_id: UUID
    subject_type: RecordSubjectType
    subject_id: str
    observation_type: str
    observed_value: JsonValue
    evidence_id: UUID
    observed_at: datetime
    object_type: RecordSubjectType | None = None
    object_id: str | None = None
    normalized_value: JsonValue | None = None
    unit: str | None = None
    notes: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "subject_id", _strip_required(self.subject_id, field_name="subject_id"))
        object.__setattr__(
            self,
            "observation_type",
            _strip_required(self.observation_type, field_name="observation_type"),
        )
        object.__setattr__(self, "object_id", _strip_optional(self.object_id))
        object.__setattr__(self, "unit", _strip_optional(self.unit))
        object.__setattr__(self, "notes", _strip_optional(self.notes))
        _validate_aware_datetime(self.observed_at, field_name="observed_at")
        _validate_json_value(self.observed_value, field_name="observed_value")
        if self.normalized_value is not None:
            _validate_json_value(self.normalized_value, field_name="normalized_value")
        if (self.object_type is None) != (self.object_id is None):
            raise ValueError("object_type and object_id must either both be set or both be omitted")
