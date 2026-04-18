"""P0 adapter for SEC EDGAR issuer metadata."""

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

from .common import (
    infer_country_code,
    normalize_cik,
    parse_iso_datetime,
    parse_json_payload,
    sha256_hex,
    stable_company_id,
)

PayloadLoader = Callable[[AdapterRunContext], bytes | str | JsonValue]


@dataclass(slots=True)
class EdgarIssuerAdapter(SourceAdapter[list[dict[str, JsonValue]]]):
    """Capture and normalize SEC EDGAR issuer metadata records."""

    payload_loader: PayloadLoader
    capture_method: CaptureMethod = CaptureMethod.API
    source_url: str | None = "https://data.sec.gov/"

    source_key = "edgar"

    def capture(self, context: AdapterRunContext) -> CapturedSource:
        payload = self.payload_loader(context)
        snapshot = SourceSnapshot(
            snapshot_id=uuid4(),
            source_key=self.source_key,
            source_type=SourceType.ISSUER_METADATA,
            retrieved_at=context.requested_at,
            capture_method=self.capture_method,
            content_ref=f"snapshots/edgar/{context.run_id}.json",
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
            raise ValueError("EDGAR payload must decode to an object or list of objects")
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
            cik = self._extract_cik(record)
            company = self._build_company_record(record=record, cik=cik, observed_at=context.requested_at)
            evidence = EvidenceRecord(
                evidence_id=uuid4(),
                snapshot_id=parsed.snapshot.snapshot_id,
                evidence_type=EvidenceType.DOCUMENT,
                source_key=self.source_key,
                retrieved_at=context.requested_at,
                document_ref=f"edgar-submission-{cik}.json",
                row_ref=f"edgar-record-{index}",
            )
            company_records.append(company)
            evidence_records.append(evidence)
            observations.extend(
                [
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.COMPANY,
                        subject_id=str(company.company_id),
                        observation_type="issuer_name_observed",
                        observed_value=company.canonical_name,
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=company.canonical_name,
                    ),
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.COMPANY,
                        subject_id=str(company.company_id),
                        observation_type="issuer_cik_observed",
                        observed_value={"identifier_type": "cik", "value": cik},
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=cik,
                    ),
                    Observation(
                        observation_id=uuid4(),
                        subject_type=RecordSubjectType.COMPANY,
                        subject_id=str(company.company_id),
                        observation_type="issuer_country_observed",
                        observed_value=company.hq_country_code,
                        evidence_id=evidence.evidence_id,
                        observed_at=context.requested_at,
                        normalized_value=company.hq_country_code,
                    ),
                ]
            )
            for identifier in company.identifiers:
                if identifier.identifier_type == CompanyIdentifierType.TICKER:
                    observations.append(
                        Observation(
                            observation_id=uuid4(),
                            subject_type=RecordSubjectType.COMPANY,
                            subject_id=str(company.company_id),
                            observation_type="issuer_ticker_observed",
                            observed_value=identifier.value,
                            evidence_id=evidence.evidence_id,
                            observed_at=context.requested_at,
                            normalized_value=identifier.value,
                        )
                    )

        return ExtractedRecords(
            company_records=company_records,
            evidence_records=evidence_records,
            observations=observations,
        )

    def _extract_cik(self, record: dict[str, JsonValue]) -> str:
        value = record.get("cik")
        if value is None:
            raise ValueError("EDGAR record must include a cik field")
        return normalize_cik(value)

    def _build_company_record(
        self,
        *,
        record: dict[str, JsonValue],
        cik: str,
        observed_at: datetime,
    ) -> CompanyRecord:
        name = record.get("name")
        if not isinstance(name, str) or not name.strip():
            raise ValueError("EDGAR record must include a company name")

        country_code = self._extract_country_code(record)
        tickers = self._extract_tickers(record, observed_at=observed_at)
        former_aliases = self._extract_former_names(record, observed_at=observed_at)
        valid_from = None
        filings = record.get("filings")
        if isinstance(filings, dict):
            recent = filings.get("recent")
            if isinstance(recent, dict):
                filing_dates = recent.get("filingDate")
                if isinstance(filing_dates, list):
                    for filing_date in filing_dates:
                        if isinstance(filing_date, str):
                            parsed_date = parse_iso_datetime(f"{filing_date}T00:00:00+00:00")
                            if parsed_date is not None:
                                valid_from = parsed_date
                                break

        identifiers = [
            CompanyIdentifier(
                identifier_type=CompanyIdentifierType.CIK,
                value=cik,
                issuer="SEC",
                observed_at=observed_at,
            )
        ]
        identifiers.extend(tickers)

        return CompanyRecord(
            company_id=stable_company_id(
                source_key=self.source_key,
                identifier_type="cik",
                identifier_value=cik,
            ),
            canonical_name=name,
            entity_type=EntityType.COMPANY,
            hq_country_code=country_code,
            record_status=RecordStatus.ACTIVE,
            observed_at=observed_at,
            valid_from=valid_from,
            cik=cik,
            aliases=former_aliases,
            identifiers=tuple(identifiers),
        )

    def _extract_country_code(self, record: dict[str, JsonValue]) -> str:
        addresses = record.get("addresses")
        if isinstance(addresses, dict):
            for address_key in ("business", "mailing"):
                address = addresses.get(address_key)
                if isinstance(address, dict):
                    code = address.get("stateOrCountry")
                    description = address.get("stateOrCountryDescription")
                    if isinstance(code, str) or isinstance(description, str):
                        inferred = infer_country_code(
                            code=code if isinstance(code, str) else None,
                            description=description if isinstance(description, str) else None,
                        )
                        if inferred is not None:
                            return inferred

        top_level_code = record.get("stateOfIncorporation")
        if isinstance(top_level_code, str):
            inferred = infer_country_code(code=top_level_code)
            if inferred is not None:
                return inferred

        raise ValueError("EDGAR record must include enough address data to infer country")

    def _extract_tickers(
        self,
        record: dict[str, JsonValue],
        *,
        observed_at: datetime,
    ) -> list[CompanyIdentifier]:
        raw_tickers = record.get("tickers")
        if not isinstance(raw_tickers, list):
            return []

        identifiers: list[CompanyIdentifier] = []
        for ticker in raw_tickers:
            if isinstance(ticker, str) and ticker.strip():
                identifiers.append(
                    CompanyIdentifier(
                        identifier_type=CompanyIdentifierType.TICKER,
                        value=ticker,
                        issuer="SEC",
                        observed_at=observed_at,
                    )
                )
        return identifiers

    def _extract_former_names(
        self,
        record: dict[str, JsonValue],
        *,
        observed_at: datetime,
    ) -> tuple[CompanyAlias, ...]:
        raw_former_names = record.get("formerNames")
        aliases: list[CompanyAlias] = []
        if not isinstance(raw_former_names, list):
            return ()
        for former_name in raw_former_names:
            if not isinstance(former_name, dict):
                continue
            name = former_name.get("name")
            if isinstance(name, str) and name.strip():
                aliases.append(
                    CompanyAlias(
                        value=name,
                        alias_type=CompanyAliasType.FORMER_NAME,
                        observed_at=observed_at,
                    )
                )
        return tuple(aliases)
