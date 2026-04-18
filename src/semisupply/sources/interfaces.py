"""Source adapter interfaces and workflow boundaries."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Generic, TypeVar
from uuid import UUID

from semisupply.registry import CompanyRecord, FacilityRecord

from .models import EvidenceRecord, JsonValue, Observation, SourceSnapshot

RawPayload = bytes | str | JsonValue
TParsed = TypeVar("TParsed")


def _validate_aware_datetime(value: datetime, *, field_name: str) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware")
    return value


def _strip_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


@dataclass(frozen=True, slots=True)
class AdapterRunContext:
    """Execution context passed through capture, parse, and extract steps."""

    run_id: UUID
    requested_at: datetime
    artifact_root: Path | None = None
    notes: str | None = None

    def __post_init__(self) -> None:
        _validate_aware_datetime(self.requested_at, field_name="requested_at")
        object.__setattr__(self, "notes", _strip_optional(self.notes))


@dataclass(frozen=True, slots=True)
class CapturedSource:
    """Raw material captured from a source together with its snapshot record."""

    snapshot: SourceSnapshot
    payload: RawPayload
    media_type: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "media_type", _strip_optional(self.media_type))
        if isinstance(self.payload, bytes) and len(self.payload) == 0:
            raise ValueError("payload must not be empty when bytes are provided")
        if isinstance(self.payload, str):
            _strip_required(self.payload, field_name="payload")


@dataclass(frozen=True, slots=True)
class ParsedSource(Generic[TParsed]):
    """Parsed source material ready for extraction into shared contracts."""

    snapshot: SourceSnapshot
    parsed_payload: TParsed


@dataclass(frozen=True, slots=True)
class ExtractedRecords:
    """Normalized source outputs shared by later pipeline stages."""

    company_records: tuple[CompanyRecord, ...] = ()
    facility_records: tuple[FacilityRecord, ...] = ()
    evidence_records: tuple[EvidenceRecord, ...] = ()
    observations: tuple[Observation, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "company_records", tuple(self.company_records))
        object.__setattr__(self, "facility_records", tuple(self.facility_records))
        object.__setattr__(self, "evidence_records", tuple(self.evidence_records))
        object.__setattr__(self, "observations", tuple(self.observations))


class SourceAdapter(ABC, Generic[TParsed]):
    """Base interface for source adapters with explicit workflow stages."""

    source_key: str

    @abstractmethod
    def capture(self, context: AdapterRunContext) -> CapturedSource:
        """Capture a raw source artifact or dataset snapshot."""

    @abstractmethod
    def parse(self, captured: CapturedSource, context: AdapterRunContext) -> ParsedSource[TParsed]:
        """Parse a captured source artifact into a typed intermediate representation."""

    @abstractmethod
    def extract(
        self,
        parsed: ParsedSource[TParsed],
        context: AdapterRunContext,
    ) -> ExtractedRecords:
        """Extract evidence and observations from parsed source data."""

    def run(self, context: AdapterRunContext) -> ExtractedRecords:
        """Execute the standard capture -> parse -> extract flow."""

        captured = self.capture(context)
        parsed = self.parse(captured, context)
        return self.extract(parsed, context)
