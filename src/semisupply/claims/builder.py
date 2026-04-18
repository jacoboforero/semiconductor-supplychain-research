"""Minimal builders for converting observations into typed claims."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Iterable
from uuid import NAMESPACE_URL, UUID, uuid5

from semisupply.sources import Observation, RecordSubjectType
from semisupply.sources.models import JsonValue

from .models import ClaimRecord, ClaimStatus, ClaimType, ReviewStatus

_CLAIM_NAMESPACE = uuid5(NAMESPACE_URL, "semisupply.claims.direct-observation")


def _string_value(value: JsonValue, *, field_name: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must resolve to a string")
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def _structured_identifier(observation: Observation) -> dict[str, str]:
    if isinstance(observation.observed_value, dict):
        identifier_type = observation.observed_value.get("identifier_type")
        identifier_value = observation.observed_value.get("value")
        if isinstance(identifier_type, str) and isinstance(identifier_value, str):
            return {
                "identifier_type": _string_value(identifier_type, field_name="identifier_type").lower(),
                "value": _string_value(identifier_value, field_name="identifier_value"),
            }

    normalized_value = observation.normalized_value if observation.normalized_value is not None else observation.observed_value
    return {
        "identifier_type": "other",
        "value": _string_value(normalized_value, field_name="normalized_value"),
    }


@dataclass(frozen=True, slots=True)
class DirectObservationClaimBuilder:
    """Build direct claims from deterministic source observations."""

    default_confidence: float = 1.0
    claim_type: ClaimType = ClaimType.DIRECT_DISCLOSURE
    claim_status: ClaimStatus = ClaimStatus.ACTIVE
    review_status: ReviewStatus = ReviewStatus.UNREVIEWED

    def __post_init__(self) -> None:
        if not 0.0 <= self.default_confidence <= 1.0:
            raise ValueError("default_confidence must be between 0.0 and 1.0")

    def build(self, observations: Iterable[Observation]) -> tuple[ClaimRecord, ...]:
        """Build claims for the subset of observation types supported by this builder."""

        claims: list[ClaimRecord] = []
        for observation in observations:
            claim = self.build_from_observation(observation)
            if claim is not None:
                claims.append(claim)
        return tuple(claims)

    def build_from_observation(self, observation: Observation) -> ClaimRecord | None:
        """Return one direct claim for a supported observation, or `None` if unsupported."""

        match observation.observation_type:
            case "company_legal_name_observed":
                name_value = observation.normalized_value if observation.normalized_value is not None else observation.observed_value
                return self._build_literal_claim(
                    observation=observation,
                    predicate="HAS_NAME",
                    claim_value={
                        "name_type": "legal",
                        "value": _string_value(name_value, field_name="name_value"),
                    },
                )
            case "issuer_name_observed":
                name_value = observation.normalized_value if observation.normalized_value is not None else observation.observed_value
                return self._build_literal_claim(
                    observation=observation,
                    predicate="HAS_NAME",
                    claim_value={
                        "name_type": "reported",
                        "value": _string_value(name_value, field_name="name_value"),
                    },
                )
            case "company_identifier_observed" | "issuer_cik_observed" | "issuer_ticker_observed":
                return self._build_literal_claim(
                    observation=observation,
                    predicate="HAS_IDENTIFIER",
                    claim_value=self._normalized_identifier_claim_value(observation),
                )
            case "company_hq_country_observed" | "issuer_country_observed":
                country_value = observation.normalized_value if observation.normalized_value is not None else observation.observed_value
                return self._build_object_claim(
                    observation=observation,
                    predicate="HEADQUARTERED_IN",
                    object_type=RecordSubjectType.COUNTRY,
                    object_id=_string_value(country_value, field_name="country_value").upper(),
                )
            case _:
                return None

    def _normalized_identifier_claim_value(self, observation: Observation) -> dict[str, str]:
        if observation.observation_type == "issuer_cik_observed":
            identifier_value = observation.normalized_value if observation.normalized_value is not None else observation.observed_value
            return {
                "identifier_type": "cik",
                "value": _string_value(identifier_value, field_name="identifier_value"),
            }
        if observation.observation_type == "issuer_ticker_observed":
            identifier_value = observation.normalized_value if observation.normalized_value is not None else observation.observed_value
            return {
                "identifier_type": "ticker",
                "value": _string_value(identifier_value, field_name="identifier_value"),
            }
        return _structured_identifier(observation)

    def _build_literal_claim(
        self,
        *,
        observation: Observation,
        predicate: str,
        claim_value: JsonValue,
    ) -> ClaimRecord:
        claim_id = self._claim_id(
            observation=observation,
            predicate=predicate,
            object_type=None,
            object_id=None,
            claim_value=claim_value,
        )
        return ClaimRecord(
            claim_id=claim_id,
            claim_type=self.claim_type,
            subject_type=observation.subject_type,
            subject_id=observation.subject_id,
            predicate=predicate,
            confidence=self.default_confidence,
            claim_status=self.claim_status,
            supporting_observation_ids=(observation.observation_id,),
            claim_value=claim_value,
            valid_from=observation.observed_at,
            review_status=self.review_status,
        )

    def _build_object_claim(
        self,
        *,
        observation: Observation,
        predicate: str,
        object_type: RecordSubjectType,
        object_id: str,
    ) -> ClaimRecord:
        claim_id = self._claim_id(
            observation=observation,
            predicate=predicate,
            object_type=object_type,
            object_id=object_id,
            claim_value=None,
        )
        return ClaimRecord(
            claim_id=claim_id,
            claim_type=self.claim_type,
            subject_type=observation.subject_type,
            subject_id=observation.subject_id,
            predicate=predicate,
            confidence=self.default_confidence,
            claim_status=self.claim_status,
            supporting_observation_ids=(observation.observation_id,),
            object_type=object_type,
            object_id=object_id,
            valid_from=observation.observed_at,
            review_status=self.review_status,
        )

    def _claim_id(
        self,
        *,
        observation: Observation,
        predicate: str,
        object_type: RecordSubjectType | None,
        object_id: str | None,
        claim_value: JsonValue | None,
    ) -> UUID:
        payload = json.dumps(
            {
                "observation_id": str(observation.observation_id),
                "predicate": predicate,
                "object_type": object_type.value if object_type is not None else None,
                "object_id": object_id,
                "claim_value": claim_value,
            },
            sort_keys=True,
            separators=(",", ":"),
        )
        return uuid5(_CLAIM_NAMESPACE, payload)
