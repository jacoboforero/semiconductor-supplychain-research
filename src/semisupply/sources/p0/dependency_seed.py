"""P0 adapter for curated company-to-company dependency seed relationships."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable
from uuid import uuid4

from semisupply.sources import (
    AdapterRunContext,
    CaptureMethod,
    CapturedSource,
    EvidenceRecord,
    EvidenceType,
    ExtractedRecords,
    Observation,
    ParsedSource,
    RecordSubjectType,
    SourceAdapter,
    SourceSnapshot,
    SourceType,
)
from semisupply.sources.models import JsonValue

from .common import parse_json_payload, sha256_hex, stable_company_id

PayloadLoader = Callable[[AdapterRunContext], bytes | str | JsonValue]


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def _optional_string(value: JsonValue) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError("optional dependency fields must be strings when present")
    cleaned = value.strip()
    return cleaned or None


@dataclass(slots=True)
class CuratedDependencySeedAdapter(SourceAdapter[list[dict[str, JsonValue]]]):
    """Capture repo-managed dependency seed rows as company-to-company observations."""

    payload_loader: PayloadLoader
    capture_method: CaptureMethod = CaptureMethod.MANUAL_CAPTURE
    source_url: str | None = None

    source_key = "dependency_seed"

    def capture(self, context: AdapterRunContext) -> CapturedSource:
        payload = self.payload_loader(context)
        snapshot = SourceSnapshot(
            snapshot_id=uuid4(),
            source_key=self.source_key,
            source_type=SourceType.OTHER,
            retrieved_at=context.requested_at,
            capture_method=self.capture_method,
            content_ref=f"snapshots/dependency_seed/{context.run_id}.json",
            content_hash=sha256_hex(payload),
            source_url=self.source_url,
            notes="Curated dependency edge seed for the company-only flow graph.",
        )
        return CapturedSource(snapshot=snapshot, payload=payload, media_type="application/json")

    def parse(
        self,
        captured: CapturedSource,
        context: AdapterRunContext,
    ) -> ParsedSource[list[dict[str, JsonValue]]]:
        _ = context
        parsed = parse_json_payload(captured.payload)
        if not isinstance(parsed, dict):
            raise ValueError("dependency seed payload must decode to an object")

        raw_relationships = parsed.get("relationships")
        if not isinstance(raw_relationships, list):
            raise ValueError("dependency seed payload must contain a relationships list")

        raw_sources = parsed.get("sources", [])
        if not isinstance(raw_sources, list):
            raise ValueError("dependency seed payload sources must be a list when present")

        sources_by_id: dict[str, dict[str, JsonValue]] = {}
        for source in raw_sources:
            if not isinstance(source, dict):
                raise ValueError("dependency seed sources must be objects")
            source_id = _strip_required(str(source["source_id"]), field_name="source_id")
            sources_by_id[source_id] = source

        records: list[dict[str, JsonValue]] = []
        for row in raw_relationships:
            if not isinstance(row, dict):
                raise ValueError("dependency seed relationships must be objects")

            source_ids = row.get("source_ids", [])
            if not isinstance(source_ids, list):
                raise ValueError("dependency seed source_ids must be a list when present")

            linked_sources = []
            for source_id in source_ids:
                if not isinstance(source_id, str):
                    raise ValueError("dependency seed source_ids must contain strings")
                linked_source = sources_by_id.get(source_id)
                if linked_source is None:
                    raise ValueError(f"dependency seed references unknown source_id: {source_id}")
                linked_sources.append(
                    {
                        "source_id": source_id,
                        "label": linked_source.get("label"),
                        "url": linked_source.get("url"),
                    }
                )

            record = dict(row)
            record["resolved_sources"] = linked_sources
            records.append(record)

        return ParsedSource(snapshot=captured.snapshot, parsed_payload=records)

    def extract(
        self,
        parsed: ParsedSource[list[dict[str, JsonValue]]],
        context: AdapterRunContext,
    ) -> ExtractedRecords:
        evidence_records: list[EvidenceRecord] = []
        observations: list[Observation] = []

        for index, row in enumerate(parsed.parsed_payload):
            relationship_id = _strip_required(str(row["relationship_id"]), field_name="relationship_id")
            supplier_slug = _strip_required(str(row["supplier_company_slug"]), field_name="supplier_company_slug")
            customer_slug = _strip_required(str(row["customer_company_slug"]), field_name="customer_company_slug")

            evidence = EvidenceRecord(
                evidence_id=uuid4(),
                snapshot_id=parsed.snapshot.snapshot_id,
                evidence_type=EvidenceType.DATASET_ROW,
                source_key=self.source_key,
                retrieved_at=context.requested_at,
                row_ref=f"dependency-seed-row-{index}:{relationship_id}",
                quote_text=_optional_string(row.get("notes")),
            )

            supplier_id = stable_company_id(
                source_key="curated_seed",
                identifier_type="company_slug",
                identifier_value=supplier_slug,
            )
            customer_id = stable_company_id(
                source_key="curated_seed",
                identifier_type="company_slug",
                identifier_value=customer_slug,
            )

            observations.append(
                Observation(
                    observation_id=uuid4(),
                    subject_type=RecordSubjectType.COMPANY,
                    subject_id=str(supplier_id),
                    observation_type="company_dependency_observed",
                    observed_value={
                        "relationship_id": relationship_id,
                        "predicate": _strip_required(str(row["predicate"]), field_name="predicate"),
                        "item_code": _optional_string(row.get("item_code")),
                        "stage_code": _optional_string(row.get("stage_code")),
                        "confidence": row.get("confidence"),
                        "notes": _optional_string(row.get("notes")),
                        "sources": row.get("resolved_sources", []),
                    },
                    evidence_id=evidence.evidence_id,
                    observed_at=context.requested_at,
                    object_type=RecordSubjectType.COMPANY,
                    object_id=str(customer_id),
                    normalized_value={
                        "relationship_id": relationship_id,
                        "predicate": _strip_required(str(row["predicate"]), field_name="predicate").upper(),
                        "item_code": _optional_string(row.get("item_code")),
                        "stage_code": _optional_string(row.get("stage_code")),
                        "confidence": row.get("confidence"),
                        "notes": _optional_string(row.get("notes")),
                        "sources": row.get("resolved_sources", []),
                    },
                    notes=_optional_string(row.get("notes")),
                )
            )
            evidence_records.append(evidence)

        return ExtractedRecords(
            evidence_records=evidence_records,
            observations=observations,
        )
