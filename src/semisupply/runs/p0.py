"""Local-first P0 pipeline orchestration and artifact writing."""

from __future__ import annotations

import json
from dataclasses import fields, is_dataclass
from datetime import UTC, datetime
from enum import Enum
from pathlib import Path
from typing import Any
from uuid import UUID, uuid4

from semisupply.claims import ClaimRecord, DirectObservationClaimBuilder
from semisupply.graph import GraphProjection, InitialGraphProjector
from semisupply.graph.ui_bundle import UiBundleBuilder
from semisupply.normalize import (
    CompanyResolver,
    FacilityResolutionResult,
    FacilityResolver,
    SourceCompanyRecord,
    SourceFacilityRecord,
)
from semisupply.registry import CompanyRecord, FacilityRecord
from semisupply.sources import AdapterRunContext, EvidenceRecord, Observation, SourceAdapter, SourceSnapshot
from semisupply.taxonomy import CompanyTaxonomyMapping, SeedCompanyTaxonomyMapper, default_company_taxonomy_mapper

from .models import ArtifactManifestEntry, P0RunManifest, P0RunResult, RunStatus, SourceRunSummary


def _validate_aware_datetime(value: datetime, *, field_name: str) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware")
    return value


def _json_compatible(value: Any) -> Any:
    if is_dataclass(value):
        return {
            field.name: _json_compatible(getattr(value, field.name))
            for field in fields(value)
        }
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, tuple):
        return [_json_compatible(item) for item in value]
    if isinstance(value, list):
        return [_json_compatible(item) for item in value]
    if isinstance(value, dict):
        return {str(key): _json_compatible(item) for key, item in value.items()}
    return value


class P0PipelineRunner:
    """Run the current P0 source, claim, resolution, and graph flow end to end."""

    def __init__(
        self,
        *,
        adapters: list[SourceAdapter[Any]] | tuple[SourceAdapter[Any], ...],
        claim_builder: DirectObservationClaimBuilder | None = None,
        company_resolver: CompanyResolver | None = None,
        facility_resolver: FacilityResolver | None = None,
        graph_projector: InitialGraphProjector | None = None,
        company_taxonomy_mapper: SeedCompanyTaxonomyMapper | None = None,
        ui_bundle_builder: UiBundleBuilder | None = None,
    ) -> None:
        self.adapters = tuple(adapters)
        if not self.adapters:
            raise ValueError("adapters must include at least one source adapter")
        source_keys = [adapter.source_key for adapter in self.adapters]
        if len(set(source_keys)) != len(source_keys):
            raise ValueError("adapter source_key values must be unique")

        self.claim_builder = claim_builder or DirectObservationClaimBuilder()
        self.company_resolver = company_resolver or CompanyResolver()
        self.facility_resolver = facility_resolver or FacilityResolver()
        self.graph_projector = graph_projector or InitialGraphProjector()
        self.company_taxonomy_mapper = company_taxonomy_mapper or default_company_taxonomy_mapper()
        self.ui_bundle_builder = ui_bundle_builder or UiBundleBuilder()

    def run(
        self,
        *,
        artifact_root: Path,
        requested_at: datetime | None = None,
        run_id: UUID | None = None,
    ) -> P0RunResult:
        """Execute one full P0 pipeline run and write local artifact files."""

        effective_requested_at = requested_at or datetime.now(UTC)
        _validate_aware_datetime(effective_requested_at, field_name="requested_at")
        effective_run_id = run_id or uuid4()

        normalized_dir = artifact_root / "normalized" / "p0" / str(effective_run_id)
        graph_dir = artifact_root / "graph" / "p0" / str(effective_run_id)
        log_dir = artifact_root / "logs" / "p0" / str(effective_run_id)
        for directory in (normalized_dir, graph_dir, log_dir):
            directory.mkdir(parents=True, exist_ok=True)

        snapshots: list[SourceSnapshot] = []
        source_company_records: list[SourceCompanyRecord] = []
        source_facility_records: list[SourceFacilityRecord] = []
        evidence_records: list[EvidenceRecord] = []
        observations: list[Observation] = []
        claims: list[ClaimRecord] = []
        source_runs: list[SourceRunSummary] = []

        for adapter in self.adapters:
            context = AdapterRunContext(
                run_id=effective_run_id,
                requested_at=effective_requested_at,
                artifact_root=artifact_root,
            )
            captured = adapter.capture(context)
            parsed = adapter.parse(captured, context)
            extracted = adapter.extract(parsed, context)
            source_claims = self.claim_builder.build(extracted.observations)

            snapshots.append(captured.snapshot)
            source_company_records.extend(
                SourceCompanyRecord(source_key=adapter.source_key, company_record=record)
                for record in extracted.company_records
            )
            source_facility_records.extend(
                SourceFacilityRecord(source_key=adapter.source_key, facility_record=record)
                for record in extracted.facility_records
            )
            evidence_records.extend(extracted.evidence_records)
            observations.extend(extracted.observations)
            claims.extend(source_claims)
            source_runs.append(
                SourceRunSummary(
                    source_key=adapter.source_key,
                    snapshot_count=1,
                    company_record_count=len(extracted.company_records),
                    facility_record_count=len(extracted.facility_records),
                    evidence_record_count=len(extracted.evidence_records),
                    observation_count=len(extracted.observations),
                    claim_count=len(source_claims),
                )
            )

        resolution = self.company_resolver.resolve(source_company_records)
        facility_resolution = self.facility_resolver.resolve(source_facility_records)
        taxonomy_mappings = tuple(
            mapping
            for company in resolution.canonical_company_records
            for mapping in [self.company_taxonomy_mapper.map_company(company)]
            if mapping is not None
        )
        projection = self.graph_projector.project(
            canonical_company_records=resolution.canonical_company_records,
            canonical_facility_records=facility_resolution.canonical_facility_records,
            claims=claims,
            crosswalks=resolution.crosswalks,
            taxonomy_mappings=taxonomy_mappings,
        )
        completed_at = datetime.now(UTC)

        artifact_paths: dict[str, Path] = {}
        artifact_entries: list[ArtifactManifestEntry] = []

        artifact_entries.append(
            self._write_artifact(
                artifact_key="snapshots",
                path=normalized_dir / "snapshots.json",
                payload=snapshots,
                record_count=len(snapshots),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="source_company_records",
                path=normalized_dir / "source_company_records.json",
                payload=source_company_records,
                record_count=len(source_company_records),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="source_facility_records",
                path=normalized_dir / "source_facility_records.json",
                payload=source_facility_records,
                record_count=len(source_facility_records),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="evidence_records",
                path=normalized_dir / "evidence_records.json",
                payload=evidence_records,
                record_count=len(evidence_records),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="observations",
                path=normalized_dir / "observations.json",
                payload=observations,
                record_count=len(observations),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="claims",
                path=normalized_dir / "claims.json",
                payload=claims,
                record_count=len(claims),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="company_resolution",
                path=normalized_dir / "company_resolution.json",
                payload={
                    "canonical_company_records": resolution.canonical_company_records,
                    "crosswalks": resolution.crosswalks,
                    "decisions": resolution.decisions,
                },
                record_count=(
                    len(resolution.canonical_company_records)
                    + len(resolution.crosswalks)
                    + len(resolution.decisions)
                ),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="facility_resolution",
                path=normalized_dir / "facility_resolution.json",
                payload={
                    "canonical_facility_records": facility_resolution.canonical_facility_records,
                    "crosswalks": facility_resolution.crosswalks,
                    "decisions": facility_resolution.decisions,
                },
                record_count=(
                    len(facility_resolution.canonical_facility_records)
                    + len(facility_resolution.crosswalks)
                    + len(facility_resolution.decisions)
                ),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="taxonomy_mappings",
                path=normalized_dir / "taxonomy_mappings.json",
                payload=taxonomy_mappings,
                record_count=len(taxonomy_mappings),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )
        artifact_entries.append(
            self._write_artifact(
                artifact_key="graph_projection",
                path=graph_dir / "graph_projection.json",
                payload={
                    "nodes": projection.nodes,
                    "edges": projection.edges,
                },
                record_count=len(projection.nodes) + len(projection.edges),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )

        manifest = P0RunManifest(
            run_id=effective_run_id,
            pipeline_key="p0",
            requested_at=effective_requested_at,
            completed_at=completed_at,
            status=RunStatus.SUCCEEDED,
            source_runs=tuple(source_runs),
            artifacts=tuple(artifact_entries),
            snapshot_count=len(snapshots),
            source_company_record_count=len(source_company_records),
            source_facility_record_count=len(source_facility_records),
            evidence_record_count=len(evidence_records),
            observation_count=len(observations),
            claim_count=len(claims),
            canonical_company_count=len(resolution.canonical_company_records),
            canonical_facility_count=len(facility_resolution.canonical_facility_records),
            crosswalk_count=len(resolution.crosswalks),
            resolution_decision_count=len(resolution.decisions),
            facility_crosswalk_count=len(facility_resolution.crosswalks),
            facility_resolution_decision_count=len(facility_resolution.decisions),
            graph_node_count=len(projection.nodes),
            graph_edge_count=len(projection.edges),
        )

        ui_bundle = self.ui_bundle_builder.build(manifest=manifest, projection=projection)
        artifact_entries.append(
            self._write_artifact(
                artifact_key="ui_bundle",
                path=artifact_root / "exports" / "p0" / str(effective_run_id) / "ui_bundle.json",
                payload=ui_bundle,
                record_count=len(ui_bundle.nodes) + len(ui_bundle.edges),
                artifact_root=artifact_root,
                artifact_paths=artifact_paths,
            )
        )

        manifest = P0RunManifest(
            run_id=effective_run_id,
            pipeline_key="p0",
            requested_at=effective_requested_at,
            completed_at=completed_at,
            status=RunStatus.SUCCEEDED,
            source_runs=tuple(source_runs),
            artifacts=tuple(artifact_entries),
            snapshot_count=len(snapshots),
            source_company_record_count=len(source_company_records),
            source_facility_record_count=len(source_facility_records),
            evidence_record_count=len(evidence_records),
            observation_count=len(observations),
            claim_count=len(claims),
            canonical_company_count=len(resolution.canonical_company_records),
            canonical_facility_count=len(facility_resolution.canonical_facility_records),
            crosswalk_count=len(resolution.crosswalks),
            resolution_decision_count=len(resolution.decisions),
            facility_crosswalk_count=len(facility_resolution.crosswalks),
            facility_resolution_decision_count=len(facility_resolution.decisions),
            graph_node_count=len(projection.nodes),
            graph_edge_count=len(projection.edges),
        )

        manifest_path = log_dir / "run_manifest.json"
        self._write_json(manifest_path, manifest)
        artifact_paths["run_manifest"] = manifest_path

        return P0RunResult(
            manifest=manifest,
            manifest_path=manifest_path,
            artifact_root=artifact_root,
            artifact_paths=artifact_paths,
        )

    def _write_artifact(
        self,
        *,
        artifact_key: str,
        path: Path,
        payload: Any,
        record_count: int,
        artifact_root: Path,
        artifact_paths: dict[str, Path],
    ) -> ArtifactManifestEntry:
        self._write_json(path, payload)
        artifact_paths[artifact_key] = path
        return ArtifactManifestEntry(
            artifact_key=artifact_key,
            relative_path=path.relative_to(artifact_root).as_posix(),
            record_count=record_count,
        )

    def _write_json(self, path: Path, payload: Any) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(_json_compatible(payload), indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
