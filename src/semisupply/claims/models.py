"""Typed claim records used between observations and graph projection."""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID

from semisupply.sources.models import JsonValue, RecordSubjectType

_PREDICATE_PATTERN = re.compile(r"^[A-Z][A-Z0-9_]*(?:\.[A-Z][A-Z0-9_]*)*$")


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


def _validate_optional_date_range(
    *,
    valid_from: datetime | None,
    valid_to: datetime | None,
) -> None:
    if valid_from is not None:
        _validate_aware_datetime(valid_from, field_name="valid_from")
    if valid_to is not None:
        _validate_aware_datetime(valid_to, field_name="valid_to")
    if valid_from is not None and valid_to is not None and valid_from > valid_to:
        raise ValueError("valid_from must be earlier than or equal to valid_to")


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


def _validate_predicate(value: str) -> str:
    normalized = _strip_required(value, field_name="predicate").upper()
    if _PREDICATE_PATTERN.fullmatch(normalized) is None:
        raise ValueError("predicate must use uppercase normalized codes")
    return normalized


def _validate_optional_code(value: str | None, *, field_name: str, prefixes: tuple[str, ...]) -> str | None:
    normalized = _strip_optional(value)
    if normalized is None:
        return None
    uppercased = normalized.upper()
    if not any(uppercased.startswith(prefix) for prefix in prefixes):
        expected = ", ".join(f"'{prefix}'" for prefix in prefixes)
        raise ValueError(f"{field_name} must start with one of {expected}")
    return uppercased


class ClaimType(StrEnum):
    """High-level claim categories used by the pipeline."""

    DIRECT_DISCLOSURE = "direct_disclosure"
    DETERMINISTIC_DERIVATION = "deterministic_derivation"
    INFERRED_RELATIONSHIP = "inferred_relationship"
    MANUAL_ASSERTION = "manual_assertion"


class ClaimStatus(StrEnum):
    """Lifecycle states for normalized claims."""

    ACTIVE = "active"
    PENDING_REVIEW = "pending_review"
    SUPERSEDED = "superseded"
    REJECTED = "rejected"


class ReviewStatus(StrEnum):
    """Human review states for claims that may need adjudication."""

    UNREVIEWED = "unreviewed"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


@dataclass(frozen=True, slots=True)
class ClaimRecord:
    """A normalized assertion derived from one or more observations."""

    claim_id: UUID
    claim_type: ClaimType
    subject_type: RecordSubjectType
    subject_id: str
    predicate: str
    confidence: float
    claim_status: ClaimStatus
    supporting_observation_ids: tuple[UUID, ...]
    object_type: RecordSubjectType | None = None
    object_id: str | None = None
    claim_value: JsonValue | None = None
    unit: str | None = None
    item_code: str | None = None
    stage_code: str | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    review_status: ReviewStatus = ReviewStatus.UNREVIEWED
    review_notes: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "subject_id", _strip_required(self.subject_id, field_name="subject_id"))
        object.__setattr__(self, "predicate", _validate_predicate(self.predicate))
        object.__setattr__(self, "object_id", _strip_optional(self.object_id))
        object.__setattr__(self, "unit", _strip_optional(self.unit))
        object.__setattr__(
            self,
            "item_code",
            _validate_optional_code(
                self.item_code,
                field_name="item_code",
                prefixes=("ITEM.", "SERVICE.", "GOOD.", "TOOL.", "SW.", "IP."),
            ),
        )
        object.__setattr__(
            self,
            "stage_code",
            _validate_optional_code(self.stage_code, field_name="stage_code", prefixes=("STAGE.",)),
        )
        object.__setattr__(self, "review_notes", _strip_optional(self.review_notes))

        supporting_observation_ids = tuple(self.supporting_observation_ids)
        if not supporting_observation_ids:
            raise ValueError("supporting_observation_ids must include at least one observation")
        if len(set(supporting_observation_ids)) != len(supporting_observation_ids):
            raise ValueError("supporting_observation_ids must not contain duplicates")
        object.__setattr__(self, "supporting_observation_ids", supporting_observation_ids)

        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")

        if self.claim_value is not None:
            _validate_json_value(self.claim_value, field_name="claim_value")

        if (self.object_type is None) != (self.object_id is None):
            raise ValueError("object_type and object_id must either both be set or both be omitted")
        if self.object_id is None and self.claim_value is None:
            raise ValueError("claim_value or object_id must be provided")

        _validate_optional_date_range(valid_from=self.valid_from, valid_to=self.valid_to)
