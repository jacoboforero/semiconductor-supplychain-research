"""Unit tests for source adapter interfaces."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
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


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


class FakeAdapter(SourceAdapter[dict[str, str]]):
    source_key = "fake"

    def capture(self, context: AdapterRunContext) -> CapturedSource:
        return CapturedSource(
            snapshot=SourceSnapshot(
                snapshot_id=uuid4(),
                source_key=self.source_key,
                source_type=SourceType.ISSUER_METADATA,
                retrieved_at=context.requested_at,
                capture_method=CaptureMethod.API,
                content_ref="snapshots/fake/source.json",
                content_hash="abc123",
            ),
            payload='{"name":"Example Semiconductor"}',
            media_type="application/json",
        )

    def parse(
        self,
        captured: CapturedSource,
        context: AdapterRunContext,
    ) -> ParsedSource[dict[str, str]]:
        _ = context
        return ParsedSource(
            snapshot=captured.snapshot,
            parsed_payload={"name": "Example Semiconductor"},
        )

    def extract(
        self,
        parsed: ParsedSource[dict[str, str]],
        context: AdapterRunContext,
    ) -> ExtractedRecords:
        evidence = EvidenceRecord(
            evidence_id=uuid4(),
            snapshot_id=parsed.snapshot.snapshot_id,
            evidence_type=EvidenceType.DOCUMENT,
            source_key=self.source_key,
            retrieved_at=context.requested_at,
            document_ref="company.json",
        )
        observation = Observation(
            observation_id=uuid4(),
            subject_type=RecordSubjectType.COMPANY,
            subject_id="company:example",
            observation_type="issuer_name_observed",
            observed_value=parsed.parsed_payload["name"],
            evidence_id=evidence.evidence_id,
            observed_at=context.requested_at,
        )
        return ExtractedRecords(evidence_records=[evidence], observations=[observation])


class SourceInterfaceTests(unittest.TestCase):
    def test_adapter_run_executes_capture_parse_extract_flow(self) -> None:
        adapter = FakeAdapter()
        context = AdapterRunContext(run_id=uuid4(), requested_at=aware_datetime())

        extracted = adapter.run(context)

        self.assertEqual(len(extracted.company_records), 0)
        self.assertEqual(len(extracted.facility_records), 0)
        self.assertEqual(len(extracted.evidence_records), 1)
        self.assertEqual(len(extracted.observations), 1)
        self.assertEqual(extracted.observations[0].observed_value, "Example Semiconductor")

    def test_adapter_context_requires_aware_datetimes(self) -> None:
        with self.assertRaisesRegex(ValueError, "requested_at"):
            AdapterRunContext(run_id=uuid4(), requested_at=datetime(2026, 4, 17, 12, 0))

    def test_captured_source_rejects_empty_byte_payloads(self) -> None:
        with self.assertRaisesRegex(ValueError, "payload"):
            CapturedSource(
                snapshot=SourceSnapshot(
                    snapshot_id=uuid4(),
                    source_key="fake",
                    source_type=SourceType.OTHER,
                    retrieved_at=aware_datetime(),
                    capture_method=CaptureMethod.FILE_DOWNLOAD,
                    content_ref="snapshots/fake/source.bin",
                    content_hash="abc123",
                ),
                payload=b"",
            )

    def test_extracted_records_normalizes_sequences_to_tuples(self) -> None:
        evidence = EvidenceRecord(
            evidence_id=uuid4(),
            snapshot_id=uuid4(),
            evidence_type=EvidenceType.DOCUMENT,
            source_key="fake",
            retrieved_at=aware_datetime(),
        )
        observation = Observation(
            observation_id=uuid4(),
            subject_type=RecordSubjectType.COMPANY,
            subject_id="company:example",
            observation_type="issuer_name_observed",
            observed_value="Example Semiconductor",
            evidence_id=evidence.evidence_id,
            observed_at=aware_datetime(),
        )

        extracted = ExtractedRecords(evidence_records=[evidence], observations=[observation])

        self.assertIsInstance(extracted.company_records, tuple)
        self.assertIsInstance(extracted.facility_records, tuple)
        self.assertIsInstance(extracted.evidence_records, tuple)
        self.assertIsInstance(extracted.observations, tuple)


if __name__ == "__main__":
    unittest.main()
