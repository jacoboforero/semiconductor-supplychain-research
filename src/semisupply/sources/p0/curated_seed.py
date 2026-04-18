"""P0 adapter for curated company seed records used in larger local prototype runs."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable
from uuid import uuid4

from semisupply.registry import (
    CompanyAlias,
    CompanyAliasType,
    CompanyIdentifier,
    CompanyIdentifierType,
    CompanyRecord,
    EntityType,
    RecordStatus,
)
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


@dataclass(slots=True)
class CuratedCompanySeedAdapter(SourceAdapter[list[dict[str, JsonValue]]]):
    """Capture and normalize curated company seed records into registry records."""

    payload_loader: PayloadLoader
    capture_method: CaptureMethod = CaptureMethod.MANUAL_CAPTURE
    source_url: str | None = None

    source_key = "curated_seed"

    def capture(self, context: AdapterRunContext) -> CapturedSource:
        payload = self.payload_loader(context)
        snapshot = SourceSnapshot(
            snapshot_id=uuid4(),
            source_key=self.source_key,
            source_type=SourceType.OTHER,
            retrieved_at=context.requested_at,
            capture_method=self.capture_method,
            content_ref=f"snapshots/curated_seed/{context.run_id}.json",
            content_hash=sha256_hex(payload),
            source_url=self.source_url,
            notes="Curated seed dataset for larger local prototype runs.",
        )
        return CapturedSource(snapshot=snapshot, payload=payload, media_type="application/json")

    def parse(
        self,
        captured: CapturedSource,
        context: AdapterRunContext,
    ) -> ParsedSource[list[dict[str, JsonValue]]]:
        _ = context
        parsed = parse_json_payload(captured.payload)
        if isinstance(parsed, dict):
            data = parsed.get("data")
            if isinstance(data, list):
                records = data
            else:
                records = [parsed]
        elif isinstance(parsed, list):
            records = parsed
        else:
            raise ValueError("curated seed payload must decode to an object or list of objects")
        return ParsedSource(snapshot=captured.snapshot, parsed_payload=records)

    def extract(
        self,
        parsed: ParsedSource[list[dict[str, JsonValue]]],
        context: AdapterRunContext,
    ) -> ExtractedRecords:
        company_records: list[CompanyRecord] = []
        evidence_records: list[EvidenceRecord] = []
        observations: list[Observation] = []

        for index, record in enumerate(parsed.parsed_payload):
            slug = self._extract_slug(record)
            company = self._build_company_record(record=record, slug=slug, observed_at=context.requested_at)
            evidence = EvidenceRecord(
                evidence_id=uuid4(),
                snapshot_id=parsed.snapshot.snapshot_id,
                evidence_type=EvidenceType.DATASET_ROW,
                source_key=self.source_key,
                retrieved_at=context.requested_at,
                row_ref=f"curated-seed-row-{index}",
            )
            company_records.append(company)
            evidence_records.append(evidence)
            observations.extend(
                [
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.COMPANY,
                        subject_id=str(company.company_id),
                        observation_type="company_legal_name_observed",
                        observed_value=company.canonical_name,
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=company.canonical_name,
                    ),
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.COMPANY,
                        subject_id=str(company.company_id),
                        observation_type="company_identifier_observed",
                        observed_value={"identifier_type": "other", "value": slug},
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=slug,
                    ),
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.COMPANY,
                        subject_id=str(company.company_id),
                        observation_type="company_hq_country_observed",
                        observed_value=company.hq_country_code,
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=company.hq_country_code,
                    ),
                ]
            )

        return ExtractedRecords(
            company_records=company_records,
            evidence_records=evidence_records,
            observations=observations,
        )

    def _extract_slug(self, record: dict[str, JsonValue]) -> str:
        value = record.get("company_slug")
        if not isinstance(value, str):
            raise ValueError("curated seed records must include company_slug")
        return _strip_required(value, field_name="company_slug")

    def _build_company_record(
        self,
        *,
        record: dict[str, JsonValue],
        slug: str,
        observed_at,
    ) -> CompanyRecord:
        name = record.get("name")
        if not isinstance(name, str):
            raise ValueError("curated seed records must include name")

        country_code = record.get("country_code")
        if not isinstance(country_code, str):
            raise ValueError("curated seed records must include country_code")

        aliases = self._extract_aliases(record, observed_at=observed_at)
        identifiers = (
            CompanyIdentifier(
                identifier_type=CompanyIdentifierType.OTHER,
                value=slug,
                issuer="curated_seed",
                observed_at=observed_at,
            ),
        )

        return CompanyRecord(
            company_id=stable_company_id(
                source_key=self.source_key,
                identifier_type="company_slug",
                identifier_value=slug,
            ),
            canonical_name=_strip_required(name, field_name="name"),
            entity_type=EntityType.COMPANY,
            hq_country_code=_strip_required(country_code, field_name="country_code").upper(),
            record_status=RecordStatus.ACTIVE,
            observed_at=observed_at,
            jurisdiction_code=_strip_required(country_code, field_name="country_code").upper(),
            aliases=aliases,
            identifiers=identifiers,
        )

    def _extract_aliases(self, record: dict[str, JsonValue], *, observed_at) -> tuple[CompanyAlias, ...]:
        raw_aliases = record.get("aliases")
        if not isinstance(raw_aliases, list):
            return ()

        aliases: list[CompanyAlias] = []
        seen: set[str] = set()
        for item in raw_aliases:
            if not isinstance(item, str):
                raise ValueError("curated seed aliases must be strings")
            alias_value = _strip_required(item, field_name="aliases")
            normalized = alias_value.casefold()
            if normalized in seen:
                continue
            seen.add(normalized)
            aliases.append(
                CompanyAlias(
                    value=alias_value,
                    alias_type=CompanyAliasType.OTHER,
                    observed_at=observed_at,
                )
            )
        return tuple(aliases)
