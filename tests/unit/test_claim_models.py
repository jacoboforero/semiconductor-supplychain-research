"""Unit tests for claim models and direct observation claim building."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime
from uuid import uuid4

from semisupply.claims import ClaimRecord, ClaimStatus, ClaimType, DirectObservationClaimBuilder, ReviewStatus
from semisupply.sources import Observation, RecordSubjectType


def aware_datetime(
    year: int = 2026,
    month: int = 4,
    day: int = 17,
    hour: int = 12,
    minute: int = 0,
) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


class ClaimModelTests(unittest.TestCase):
    def test_claim_record_normalizes_fields(self) -> None:
        observation_id = uuid4()
        claim = ClaimRecord(
            claim_id=uuid4(),
            claim_type=ClaimType.DIRECT_DISCLOSURE,
            subject_type=RecordSubjectType.COMPANY,
            subject_id=" company:123 ",
            predicate=" has_name ",
            confidence=1.0,
            claim_status=ClaimStatus.ACTIVE,
            supporting_observation_ids=(observation_id,),
            claim_value={"name_type": "legal", "value": "Example Semiconductor"},
            valid_from=aware_datetime(),
            review_status=ReviewStatus.UNREVIEWED,
            review_notes=" direct registry fact ",
        )

        self.assertEqual(claim.subject_id, "company:123")
        self.assertEqual(claim.predicate, "HAS_NAME")
        self.assertEqual(claim.review_notes, "direct registry fact")

    def test_claim_record_requires_supporting_observations(self) -> None:
        with self.assertRaisesRegex(ValueError, "supporting_observation_ids"):
            ClaimRecord(
                claim_id=uuid4(),
                claim_type=ClaimType.DIRECT_DISCLOSURE,
                subject_type=RecordSubjectType.COMPANY,
                subject_id="company:123",
                predicate="HAS_NAME",
                confidence=1.0,
                claim_status=ClaimStatus.ACTIVE,
                supporting_observation_ids=(),
                claim_value={"name_type": "legal", "value": "Example"},
            )

    def test_claim_record_requires_object_pair_or_claim_value(self) -> None:
        with self.assertRaisesRegex(ValueError, "claim_value or object_id"):
            ClaimRecord(
                claim_id=uuid4(),
                claim_type=ClaimType.DIRECT_DISCLOSURE,
                subject_type=RecordSubjectType.COMPANY,
                subject_id="company:123",
                predicate="HEADQUARTERED_IN",
                confidence=1.0,
                claim_status=ClaimStatus.ACTIVE,
                supporting_observation_ids=(uuid4(),),
            )

    def test_claim_record_rejects_duplicate_supporting_observations(self) -> None:
        observation_id = uuid4()
        with self.assertRaisesRegex(ValueError, "must not contain duplicates"):
            ClaimRecord(
                claim_id=uuid4(),
                claim_type=ClaimType.DIRECT_DISCLOSURE,
                subject_type=RecordSubjectType.COMPANY,
                subject_id="company:123",
                predicate="HAS_IDENTIFIER",
                confidence=1.0,
                claim_status=ClaimStatus.ACTIVE,
                supporting_observation_ids=(observation_id, observation_id),
                claim_value={"identifier_type": "lei", "value": "5493001KJTIIGC8Y1R12"},
            )

    def test_direct_claim_builder_maps_supported_observations(self) -> None:
        builder = DirectObservationClaimBuilder()
        company_id = "company:123"
        evidence_id = uuid4()
        observations = (
            Observation(
                observation_id=uuid4(),
                subject_type=RecordSubjectType.COMPANY,
                subject_id=company_id,
                observation_type="company_legal_name_observed",
                observed_value="Example Semiconductor Holdings Ltd.",
                evidence_id=evidence_id,
                observed_at=aware_datetime(),
                normalized_value="Example Semiconductor Holdings Ltd.",
            ),
            Observation(
                observation_id=uuid4(),
                subject_type=RecordSubjectType.COMPANY,
                subject_id=company_id,
                observation_type="company_identifier_observed",
                observed_value={"identifier_type": "lei", "value": "5493001KJTIIGC8Y1R12"},
                evidence_id=evidence_id,
                observed_at=aware_datetime(),
                normalized_value="5493001KJTIIGC8Y1R12",
            ),
            Observation(
                observation_id=uuid4(),
                subject_type=RecordSubjectType.COMPANY,
                subject_id=company_id,
                observation_type="company_hq_country_observed",
                observed_value="KR",
                evidence_id=evidence_id,
                observed_at=aware_datetime(),
                normalized_value="KR",
            ),
        )

        claims = builder.build(observations)

        self.assertEqual(len(claims), 3)
        self.assertEqual(claims[0].predicate, "HAS_NAME")
        self.assertEqual(
            claims[0].claim_value,
            {"name_type": "legal", "value": "Example Semiconductor Holdings Ltd."},
        )
        self.assertEqual(claims[1].predicate, "HAS_IDENTIFIER")
        self.assertEqual(
            claims[1].claim_value,
            {"identifier_type": "lei", "value": "5493001KJTIIGC8Y1R12"},
        )
        self.assertEqual(claims[2].predicate, "HEADQUARTERED_IN")
        self.assertEqual(claims[2].object_type, RecordSubjectType.COUNTRY)
        self.assertEqual(claims[2].object_id, "KR")

    def test_direct_claim_builder_ignores_unsupported_observations(self) -> None:
        builder = DirectObservationClaimBuilder()
        unsupported = Observation(
            observation_id=uuid4(),
            subject_type=RecordSubjectType.COMPANY,
            subject_id="company:123",
            observation_type="company_alias_observed",
            observed_value="Example Semi",
            evidence_id=uuid4(),
            observed_at=aware_datetime(),
        )

        self.assertEqual(builder.build((unsupported,)), ())

    def test_direct_claim_builder_is_deterministic_for_same_observation(self) -> None:
        builder = DirectObservationClaimBuilder()
        observation = Observation(
            observation_id=uuid4(),
            subject_type=RecordSubjectType.COMPANY,
            subject_id="company:123",
            observation_type="issuer_ticker_observed",
            observed_value="AAPL",
            evidence_id=uuid4(),
            observed_at=aware_datetime(),
            normalized_value="AAPL",
        )

        first = builder.build_from_observation(observation)
        second = builder.build_from_observation(observation)

        self.assertIsNotNone(first)
        self.assertIsNotNone(second)
        self.assertEqual(first.claim_id, second.claim_id)
        self.assertEqual(first.claim_value, {"identifier_type": "ticker", "value": "AAPL"})


if __name__ == "__main__":
    unittest.main()
