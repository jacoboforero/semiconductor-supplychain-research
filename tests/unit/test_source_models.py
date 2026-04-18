"""Unit tests for source-layer snapshot, evidence, and observation models."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
from uuid import uuid4

from semisupply.sources import (
    CaptureMethod,
    EvidenceRecord,
    EvidenceType,
    Observation,
    RecordSubjectType,
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


class SourceModelTests(unittest.TestCase):
    def test_source_snapshot_normalizes_optional_fields(self) -> None:
        snapshot = SourceSnapshot(
            snapshot_id=uuid4(),
            source_key="edgar",
            source_type=SourceType.FILING,
            retrieved_at=aware_datetime(),
            capture_method=CaptureMethod.API,
            content_ref="snapshots/edgar/2026-04-17.json",
            content_hash="abc123",
            source_url="https://www.sec.gov/example",
            source_version=" 2026-04-17 ",
            notes=" nightly pull ",
        )

        self.assertEqual(snapshot.source_version, "2026-04-17")
        self.assertEqual(snapshot.notes, "nightly pull")

    def test_source_snapshot_requires_aware_datetime(self) -> None:
        with self.assertRaisesRegex(ValueError, "retrieved_at"):
            SourceSnapshot(
                snapshot_id=uuid4(),
                source_key="edgar",
                source_type=SourceType.FILING,
                retrieved_at=datetime(2026, 4, 17, 12, 0),
                capture_method=CaptureMethod.API,
                content_ref="snapshots/edgar/2026-04-17.json",
                content_hash="abc123",
            )

    def test_evidence_record_rejects_blank_source_key(self) -> None:
        with self.assertRaisesRegex(ValueError, "source_key"):
            EvidenceRecord(
                evidence_id=uuid4(),
                snapshot_id=uuid4(),
                evidence_type=EvidenceType.DOCUMENT_SECTION,
                source_key="   ",
                retrieved_at=aware_datetime(),
            )

    def test_observation_accepts_json_compatible_payloads(self) -> None:
        observation = Observation(
            observation_id=uuid4(),
            subject_type=RecordSubjectType.COMPANY,
            subject_id="company:123",
            observation_type="company_alias_observed",
            observed_value={"alias": "Example Semi", "confidence": 0.9},
            evidence_id=uuid4(),
            observed_at=aware_datetime(),
            object_type=RecordSubjectType.SOURCE_ARTIFACT,
            object_id="artifact:edgar:10k",
            normalized_value={"alias": "Example Semi"},
        )

        self.assertEqual(observation.subject_id, "company:123")
        self.assertEqual(observation.object_id, "artifact:edgar:10k")

    def test_observation_requires_object_type_and_object_id_together(self) -> None:
        with self.assertRaisesRegex(ValueError, "object_type and object_id"):
            Observation(
                observation_id=uuid4(),
                subject_type=RecordSubjectType.COMPANY,
                subject_id="company:123",
                observation_type="company_alias_observed",
                observed_value="Example Semi",
                evidence_id=uuid4(),
                observed_at=aware_datetime(),
                object_type=RecordSubjectType.SOURCE_ARTIFACT,
            )

    def test_observation_rejects_non_json_values(self) -> None:
        with self.assertRaisesRegex(ValueError, "JSON-compatible"):
            Observation(
                observation_id=uuid4(),
                subject_type=RecordSubjectType.COMPANY,
                subject_id="company:123",
                observation_type="company_alias_observed",
                observed_value={"bad": {1, 2}},
                evidence_id=uuid4(),
                observed_at=aware_datetime(),
            )


if __name__ == "__main__":
    unittest.main()
