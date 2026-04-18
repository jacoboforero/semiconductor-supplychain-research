"""P0 adapter for GLEIF company identity data."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
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

from .common import parse_iso_datetime, parse_json_payload, sha256_hex, stable_company_id

PayloadLoader = Callable[[AdapterRunContext], bytes | str | JsonValue]


@dataclass(slots=True)
class GleifCompanyAdapter(SourceAdapter[list[dict[str, JsonValue]]]):
    """Capture and normalize GLEIF company identity records."""

    payload_loader: PayloadLoader
    capture_method: CaptureMethod = CaptureMethod.BULK_DOWNLOAD
    source_url: str | None = "https://www.gleif.org/en/lei-data/gleif-golden-copy/download-the-golden-copy"

    source_key = "gleif"

    def capture(self, context: AdapterRunContext) -> CapturedSource:
        payload = self.payload_loader(context)
        snapshot = SourceSnapshot(
            snapshot_id=uuid4(),
            source_key=self.source_key,
            source_type=SourceType.REGISTRY_DATASET,
            retrieved_at=context.requested_at,
            capture_method=self.capture_method,
            content_ref=f"snapshots/gleif/{context.run_id}.json",
            content_hash=sha256_hex(payload),
            source_url=self.source_url,
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
            if "data" in parsed and isinstance(parsed["data"], list):
                records = parsed["data"]
            else:
                records = [parsed]
        elif isinstance(parsed, list):
            records = parsed
        else:
            raise ValueError("GLEIF payload must decode to an object or list of objects")
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
            lei = self._extract_lei(record)
            company = self._build_company_record(record=record, lei=lei, observed_at=context.requested_at)
            evidence = EvidenceRecord(
                evidence_id=uuid4(),
                snapshot_id=parsed.snapshot.snapshot_id,
                evidence_type=EvidenceType.DATASET_ROW,
                source_key=self.source_key,
                retrieved_at=context.requested_at,
                row_ref=f"gleif-row-{index}",
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
                        observed_value={"identifier_type": "lei", "value": lei},
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=lei,
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

    def _extract_lei(self, record: dict[str, JsonValue]) -> str:
        value = record.get("lei") or record.get("LEI")
        if not isinstance(value, str) or len(value.strip()) != 20:
            raise ValueError("GLEIF record must include a 20-character LEI")
        return value.strip()

    def _build_company_record(
        self,
        *,
        record: dict[str, JsonValue],
        lei: str,
        observed_at: datetime,
    ) -> CompanyRecord:
        entity = record.get("entity")
        if not isinstance(entity, dict):
            raise ValueError("GLEIF record must contain an entity object")

        legal_name = self._extract_legal_name(entity)
        country_code = self._extract_country_code(entity)
        aliases = self._extract_aliases(entity, observed_at=observed_at)
        identifiers = (
            CompanyIdentifier(
                identifier_type=CompanyIdentifierType.LEI,
                value=lei,
                issuer="GLEIF",
                observed_at=observed_at,
            ),
        )
        registration = record.get("registration")
        valid_from = None
        if isinstance(registration, dict):
            initial_registration = registration.get("initialRegistrationDate")
            if isinstance(initial_registration, str):
                valid_from = parse_iso_datetime(initial_registration)

        return CompanyRecord(
            company_id=stable_company_id(
                source_key=self.source_key,
                identifier_type="lei",
                identifier_value=lei,
            ),
            canonical_name=legal_name,
            entity_type=EntityType.COMPANY,
            hq_country_code=country_code,
            record_status=RecordStatus.ACTIVE,
            observed_at=observed_at,
            valid_from=valid_from,
            lei=lei,
            jurisdiction_code=country_code,
            aliases=aliases,
            identifiers=identifiers,
        )

    def _extract_legal_name(self, entity: dict[str, JsonValue]) -> str:
        legal_name = entity.get("legalName")
        if isinstance(legal_name, dict):
            value = legal_name.get("name")
            if isinstance(value, str) and value.strip():
                return value.strip()
        if isinstance(legal_name, str) and legal_name.strip():
            return legal_name.strip()
        raise ValueError("GLEIF entity must include a legal name")

    def _extract_country_code(self, entity: dict[str, JsonValue]) -> str:
        legal_address = entity.get("legalAddress")
        if isinstance(legal_address, dict):
            country = legal_address.get("country")
            if isinstance(country, str) and len(country.strip()) == 2:
                return country.strip().upper()
        raise ValueError("GLEIF entity must include a two-letter legal address country")

    def _extract_aliases(self, entity: dict[str, JsonValue], *, observed_at: datetime) -> tuple[CompanyAlias, ...]:
        raw_aliases = entity.get("otherEntityNames")
        aliases: list[CompanyAlias] = []
        if not isinstance(raw_aliases, list):
            return ()
        for item in raw_aliases:
            if isinstance(item, dict):
                value = item.get("name")
            else:
                value = item
            if isinstance(value, str) and value.strip():
                aliases.append(
                    CompanyAlias(
                        value=value,
                        alias_type=CompanyAliasType.OTHER,
                        observed_at=observed_at,
                    )
                )
        return tuple(aliases)
