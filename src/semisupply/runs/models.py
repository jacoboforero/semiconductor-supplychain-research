"""Typed models for reproducible pipeline run manifests."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from pathlib import Path
from uuid import UUID


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def _validate_aware_datetime(value: datetime, *, field_name: str) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware")
    return value


def _validate_count(value: int, *, field_name: str) -> int:
    if value < 0:
        raise ValueError(f"{field_name} must be greater than or equal to 0")
    return value


class RunStatus(StrEnum):
    """Lifecycle states for local pipeline runs."""

    SUCCEEDED = "succeeded"
    FAILED = "failed"


@dataclass(frozen=True, slots=True)
class ArtifactManifestEntry:
    """Metadata for one artifact written by a pipeline run."""

    artifact_key: str
    relative_path: str
    record_count: int

    def __post_init__(self) -> None:
        object.__setattr__(self, "artifact_key", _strip_required(self.artifact_key, field_name="artifact_key"))
        object.__setattr__(self, "relative_path", _strip_required(self.relative_path, field_name="relative_path"))
        _validate_count(self.record_count, field_name="record_count")


@dataclass(frozen=True, slots=True)
class SourceRunSummary:
    """Per-source execution counts recorded in the run manifest."""

    source_key: str
    snapshot_count: int
    company_record_count: int
    facility_record_count: int
    evidence_record_count: int
    observation_count: int
    claim_count: int

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))
        _validate_count(self.snapshot_count, field_name="snapshot_count")
        _validate_count(self.company_record_count, field_name="company_record_count")
        _validate_count(self.facility_record_count, field_name="facility_record_count")
        _validate_count(self.evidence_record_count, field_name="evidence_record_count")
        _validate_count(self.observation_count, field_name="observation_count")
        _validate_count(self.claim_count, field_name="claim_count")


@dataclass(frozen=True, slots=True)
class P0RunManifest:
    """Manifest for one end-to-end P0 pipeline run."""

    run_id: UUID
    pipeline_key: str
    requested_at: datetime
    completed_at: datetime
    status: RunStatus
    source_runs: tuple[SourceRunSummary, ...]
    artifacts: tuple[ArtifactManifestEntry, ...]
    snapshot_count: int
    source_company_record_count: int
    source_facility_record_count: int
    evidence_record_count: int
    observation_count: int
    claim_count: int
    canonical_company_count: int
    canonical_facility_count: int
    crosswalk_count: int
    resolution_decision_count: int
    facility_crosswalk_count: int
    facility_resolution_decision_count: int
    graph_node_count: int
    graph_edge_count: int

    def __post_init__(self) -> None:
        object.__setattr__(self, "pipeline_key", _strip_required(self.pipeline_key, field_name="pipeline_key"))
        _validate_aware_datetime(self.requested_at, field_name="requested_at")
        _validate_aware_datetime(self.completed_at, field_name="completed_at")
        if self.completed_at < self.requested_at:
            raise ValueError("completed_at must be later than or equal to requested_at")
        object.__setattr__(self, "source_runs", tuple(self.source_runs))
        object.__setattr__(self, "artifacts", tuple(self.artifacts))
        _validate_count(self.snapshot_count, field_name="snapshot_count")
        _validate_count(self.source_company_record_count, field_name="source_company_record_count")
        _validate_count(self.source_facility_record_count, field_name="source_facility_record_count")
        _validate_count(self.evidence_record_count, field_name="evidence_record_count")
        _validate_count(self.observation_count, field_name="observation_count")
        _validate_count(self.claim_count, field_name="claim_count")
        _validate_count(self.canonical_company_count, field_name="canonical_company_count")
        _validate_count(self.canonical_facility_count, field_name="canonical_facility_count")
        _validate_count(self.crosswalk_count, field_name="crosswalk_count")
        _validate_count(self.resolution_decision_count, field_name="resolution_decision_count")
        _validate_count(self.facility_crosswalk_count, field_name="facility_crosswalk_count")
        _validate_count(self.facility_resolution_decision_count, field_name="facility_resolution_decision_count")
        _validate_count(self.graph_node_count, field_name="graph_node_count")
        _validate_count(self.graph_edge_count, field_name="graph_edge_count")


@dataclass(frozen=True, slots=True)
class P0RunResult:
    """Return value for a completed P0 pipeline run."""

    manifest: P0RunManifest
    manifest_path: Path
    artifact_root: Path
    artifact_paths: dict[str, Path]

    def __post_init__(self) -> None:
        object.__setattr__(self, "artifact_paths", dict(self.artifact_paths))
