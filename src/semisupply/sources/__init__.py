"""Source-layer records and adapter primitives."""

from .interfaces import (
    AdapterRunContext,
    CapturedSource,
    ExtractedRecords,
    ParsedSource,
    SourceAdapter,
)
from .models import (
    CaptureMethod,
    EvidenceRecord,
    EvidenceType,
    Observation,
    RecordSubjectType,
    SourceSnapshot,
    SourceType,
)

__all__ = [
    "AdapterRunContext",
    "CaptureMethod",
    "CapturedSource",
    "EvidenceRecord",
    "EvidenceType",
    "ExtractedRecords",
    "Observation",
    "ParsedSource",
    "RecordSubjectType",
    "SourceAdapter",
    "SourceSnapshot",
    "SourceType",
]
