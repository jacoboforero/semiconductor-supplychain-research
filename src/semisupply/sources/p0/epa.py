"""P0 adapter for EPA facility grounding data."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Callable
from uuid import UUID, uuid4

from semisupply.registry import (
    CompanyIdentifier,
    CompanyIdentifierType,
    CompanyRecord,
    EntityType,
    FacilityIdentifier,
    FacilityIdentifierType,
    FacilityRecord,
    FacilityStatus,
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

from .common import infer_country_code, parse_json_payload, sha256_hex, stable_company_id, stable_facility_id

PayloadLoader = Callable[[AdapterRunContext], bytes | str | JsonValue]


@dataclass(slots=True)
class EpaFacilityAdapter(SourceAdapter[list[dict[str, JsonValue]]]):
    """Capture and normalize EPA facility grounding records."""

    payload_loader: PayloadLoader
    capture_method: CaptureMethod = CaptureMethod.FILE_DOWNLOAD
    source_url: str | None = "https://echo.epa.gov/tools/data-downloads"

    source_key = "epa_frs"

    def capture(self, context: AdapterRunContext) -> CapturedSource:
        payload = self.payload_loader(context)
        snapshot = SourceSnapshot(
            snapshot_id=uuid4(),
            source_key=self.source_key,
            source_type=SourceType.REGULATORY_DATASET,
            retrieved_at=context.requested_at,
            capture_method=self.capture_method,
            content_ref=f"snapshots/{self.source_key}/{context.run_id}.json",
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
            raise ValueError("EPA payload must decode to an object or list of objects")
        return ParsedSource(snapshot=captured.snapshot, parsed_payload=records)

    def extract(
        self,
        parsed: ParsedSource[list[dict[str, JsonValue]]],
        context: AdapterRunContext,
    ) -> ExtractedRecords:
        company_records: dict[UUID, CompanyRecord] = {}
        facility_records: list[FacilityRecord] = []
        evidence_records: list[EvidenceRecord] = []
        observations: list[Observation] = []

        for index, record in enumerate(parsed.parsed_payload):
            operator = self._build_operator_company_record(record=record, observed_at=context.requested_at)
            facility = self._build_facility_record(
                record=record,
                operator_company_id=operator.company_id,
                observed_at=context.requested_at,
            )
            evidence = EvidenceRecord(
                evidence_id=uuid4(),
                snapshot_id=parsed.snapshot.snapshot_id,
                evidence_type=EvidenceType.DATASET_ROW,
                source_key=self.source_key,
                retrieved_at=context.requested_at,
                row_ref=f"epa-facility-row-{index}",
            )

            company_records[operator.company_id] = operator
            facility_records.append(facility)
            evidence_records.append(evidence)
            observations.extend(
                [
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.FACILITY,
                        subject_id=str(facility.facility_id),
                        observation_type="facility_name_observed",
                        observed_value=facility.facility_name,
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=facility.facility_name,
                    ),
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.FACILITY,
                        subject_id=str(facility.facility_id),
                        observation_type="facility_operator_observed",
                        observed_value=operator.canonical_name,
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        object_type=RecordSubjectType.COMPANY,
                        object_id=str(operator.company_id),
                        normalized_value=operator.canonical_name,
                    ),
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.FACILITY,
                        subject_id=str(facility.facility_id),
                        observation_type="facility_country_observed",
                        observed_value=facility.country_code,
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=facility.country_code,
                    ),
                ]
            )
            for identifier in facility.identifiers:
                observations.append(
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.FACILITY,
                        subject_id=str(facility.facility_id),
                        observation_type="facility_identifier_observed",
                        observed_value={"identifier_type": identifier.identifier_type.value, "value": identifier.value},
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=identifier.value,
                    )
                )

        return ExtractedRecords(
            company_records=tuple(company_records.values()),
            facility_records=facility_records,
            evidence_records=evidence_records,
            observations=observations,
        )

    def _build_operator_company_record(
        self,
        *,
        record: dict[str, JsonValue],
        observed_at: datetime,
    ) -> CompanyRecord:
        operator_name = self._extract_required_string(record, "operator_name")
        operator_registry_number = self._extract_required_string(record, "operator_registry_number")
        country_code = self._extract_country_code(record)

        return CompanyRecord(
            company_id=stable_company_id(
                source_key=self.source_key,
                identifier_type="operator_registry_number",
                identifier_value=operator_registry_number,
            ),
            canonical_name=operator_name,
            entity_type=EntityType.COMPANY,
            hq_country_code=country_code,
            record_status=RecordStatus.ACTIVE,
            observed_at=observed_at,
            identifiers=(
                CompanyIdentifier(
                    identifier_type=CompanyIdentifierType.REGISTRY_NUMBER,
                    value=operator_registry_number,
                    issuer="EPA",
                    observed_at=observed_at,
                ),
            ),
        )

    def _build_facility_record(
        self,
        *,
        record: dict[str, JsonValue],
        operator_company_id: UUID,
        observed_at: datetime,
    ) -> FacilityRecord:
        frs_id = self._extract_required_string(record, "epa_frs_id")
        echo_id = self._extract_optional_string(record, "epa_echo_id")
        identifiers = [
            FacilityIdentifier(
                identifier_type=FacilityIdentifierType.EPA_FRS_ID,
                value=frs_id,
                issuer="EPA",
                observed_at=observed_at,
            )
        ]
        if echo_id is not None:
            identifiers.append(
                FacilityIdentifier(
                    identifier_type=FacilityIdentifierType.EPA_ECHO_ID,
                    value=echo_id,
                    issuer="EPA",
                    observed_at=observed_at,
                )
            )

        latitude = self._extract_optional_float(record, "latitude")
        longitude = self._extract_optional_float(record, "longitude")
        return FacilityRecord(
            facility_id=stable_facility_id(
                source_key=self.source_key,
                identifier_type="epa_frs_id",
                identifier_value=frs_id,
            ),
            facility_name=self._extract_required_string(record, "facility_name"),
            facility_type_code=self._extract_required_string(record, "facility_type_code"),
            country_code=self._extract_country_code(record),
            operator_company_id=operator_company_id,
            record_status=RecordStatus.ACTIVE,
            facility_status=self._extract_facility_status(record),
            observed_at=observed_at,
            address_text=self._build_address(record),
            latitude=latitude,
            longitude=longitude,
            jurisdiction_code=self._extract_optional_string(record, "jurisdiction_code"),
            stage_codes=self._extract_stage_codes(record),
            identifiers=tuple(identifiers),
        )

    def _extract_country_code(self, record: dict[str, JsonValue]) -> str:
        explicit_country = self._extract_optional_string(record, "country_code")
        if explicit_country is not None and len(explicit_country) == 2:
            return explicit_country.upper()

        inferred = infer_country_code(
            code=self._extract_optional_string(record, "state_code"),
            description=self._extract_optional_string(record, "state_name"),
        )
        if inferred is not None:
            return inferred

        raise ValueError("EPA facility record must include enough location data to infer country")

    def _extract_stage_codes(self, record: dict[str, JsonValue]) -> tuple[str, ...]:
        raw_values = record.get("stage_codes")
        if not isinstance(raw_values, list):
            return ()
        return tuple(value for value in raw_values if isinstance(value, str) and value.strip())

    def _extract_facility_status(self, record: dict[str, JsonValue]) -> FacilityStatus:
        raw_status = self._extract_optional_string(record, "facility_status")
        if raw_status is None:
            return FacilityStatus.UNKNOWN
        normalized = raw_status.strip().lower().replace(" ", "_")
        return FacilityStatus(normalized)

    def _build_address(self, record: dict[str, JsonValue]) -> str | None:
        parts = [
            self._extract_optional_string(record, "address_line_1"),
            self._extract_optional_string(record, "city"),
            self._extract_optional_string(record, "state_code"),
        ]
        filtered = [part for part in parts if part is not None]
        if not filtered:
            return None
        return ", ".join(filtered)

    def _extract_optional_float(self, record: dict[str, JsonValue], key: str) -> float | None:
        value = record.get(key)
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str) and value.strip():
            return float(value)
        raise ValueError(f"EPA facility record field {key} must be numeric when present")

    def _extract_required_string(self, record: dict[str, JsonValue], key: str) -> str:
        value = self._extract_optional_string(record, key)
        if value is None:
            raise ValueError(f"EPA facility record must include {key}")
        return value

    def _extract_optional_string(self, record: dict[str, JsonValue], key: str) -> str | None:
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
        return None
