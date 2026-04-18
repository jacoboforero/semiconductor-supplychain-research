"""Deterministic facility resolution and source-crosswalk models."""

from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass
from enum import StrEnum
from uuid import NAMESPACE_URL, UUID, uuid5

from semisupply.registry import FacilityIdentifierType, FacilityRecord

_CANONICAL_FACILITY_NAMESPACE = uuid5(NAMESPACE_URL, "semisupply.normalize.facility")
_FACILITY_CROSSWALK_NAMESPACE = uuid5(NAMESPACE_URL, "semisupply.normalize.facility-crosswalk")
_FACILITY_NAME_NORMALIZATION_PATTERN = re.compile(r"[^A-Z0-9]+")
_STRONG_IDENTIFIER_TYPES = (
    FacilityIdentifierType.EPA_FRS_ID,
    FacilityIdentifierType.EPA_ECHO_ID,
    FacilityIdentifierType.PRTR_ID,
    FacilityIdentifierType.LEI,
    FacilityIdentifierType.REGISTRY_NUMBER,
)


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def normalize_facility_name(value: str) -> str:
    """Return an exact normalized facility-name key for deterministic matching."""

    cleaned = _strip_required(value, field_name="value").upper()
    collapsed = _FACILITY_NAME_NORMALIZATION_PATTERN.sub(" ", cleaned)
    return " ".join(collapsed.split())


class FacilityResolutionStatus(StrEnum):
    """Resolution states for source facility records."""

    RESOLVED = "resolved"


class FacilityResolutionRule(StrEnum):
    """Matching rules used by the first deterministic facility resolver."""

    SINGLETON = "singleton"
    STRONG_IDENTIFIER = "strong_identifier"


@dataclass(frozen=True, slots=True)
class SourceFacilityRecord:
    """A source-specific facility record entering the normalization layer."""

    source_key: str
    facility_record: FacilityRecord

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))


@dataclass(frozen=True, slots=True)
class FacilityCrosswalk:
    """Maps one source-bound facility record to one canonical facility record."""

    crosswalk_id: UUID
    source_key: str
    source_facility_id: UUID
    canonical_facility_id: UUID
    resolution_rule: FacilityResolutionRule
    confidence: float

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")


@dataclass(frozen=True, slots=True)
class FacilityResolutionDecision:
    """Resolution outcome for one source-bound facility record."""

    source_key: str
    source_facility_id: UUID
    resolution_status: FacilityResolutionStatus
    resolution_rule: FacilityResolutionRule
    confidence: float
    canonical_facility_id: UUID

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")


@dataclass(frozen=True, slots=True)
class FacilityResolutionResult:
    """Normalized output bundle for facility resolution."""

    canonical_facility_records: tuple[FacilityRecord, ...] = ()
    crosswalks: tuple[FacilityCrosswalk, ...] = ()
    decisions: tuple[FacilityResolutionDecision, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "canonical_facility_records", tuple(self.canonical_facility_records))
        object.__setattr__(self, "crosswalks", tuple(self.crosswalks))
        object.__setattr__(self, "decisions", tuple(self.decisions))


class FacilityResolver:
    """Resolve source-specific facility records into canonical facility entities."""

    def resolve(
        self,
        records: list[SourceFacilityRecord] | tuple[SourceFacilityRecord, ...],
    ) -> FacilityResolutionResult:
        ordered_records = tuple(sorted(records, key=self._record_sort_key))
        if not ordered_records:
            return FacilityResolutionResult()

        parent = list(range(len(ordered_records)))
        cluster_rules: dict[int, set[FacilityResolutionRule]] = {index: set() for index in range(len(ordered_records))}

        identifier_index: dict[tuple[FacilityIdentifierType, str], int] = {}
        for index, source_record in enumerate(ordered_records):
            for identifier_key in self._strong_identifier_keys(source_record.facility_record):
                match_index = identifier_index.get(identifier_key)
                if match_index is None:
                    identifier_index[identifier_key] = index
                    continue
                self._union(
                    parent=parent,
                    cluster_rules=cluster_rules,
                    left_index=index,
                    right_index=match_index,
                    rule=FacilityResolutionRule.STRONG_IDENTIFIER,
                )

        clusters = self._clusters(parent)
        canonical_records: list[FacilityRecord] = []
        crosswalks: list[FacilityCrosswalk] = []
        decisions: list[FacilityResolutionDecision] = []

        for leader, members in clusters.items():
            member_records = [ordered_records[member] for member in members]
            resolution_rule = self._cluster_resolution_rule(cluster_rules.get(leader, set()), len(member_records))
            confidence = self._rule_confidence(resolution_rule)
            canonical_record = self._build_canonical_facility_record(member_records)
            canonical_records.append(canonical_record)

            for member_record in member_records:
                crosswalks.append(
                    FacilityCrosswalk(
                        crosswalk_id=self._crosswalk_id(
                            source_key=member_record.source_key,
                            source_facility_id=member_record.facility_record.facility_id,
                            canonical_facility_id=canonical_record.facility_id,
                        ),
                        source_key=member_record.source_key,
                        source_facility_id=member_record.facility_record.facility_id,
                        canonical_facility_id=canonical_record.facility_id,
                        resolution_rule=resolution_rule,
                        confidence=confidence,
                    )
                )
                decisions.append(
                    FacilityResolutionDecision(
                        source_key=member_record.source_key,
                        source_facility_id=member_record.facility_record.facility_id,
                        resolution_status=FacilityResolutionStatus.RESOLVED,
                        resolution_rule=resolution_rule,
                        confidence=confidence,
                        canonical_facility_id=canonical_record.facility_id,
                    )
                )

        return FacilityResolutionResult(
            canonical_facility_records=tuple(canonical_records),
            crosswalks=tuple(crosswalks),
            decisions=tuple(decisions),
        )

    def _build_canonical_facility_record(self, source_records: list[SourceFacilityRecord]) -> FacilityRecord:
        representative = source_records[0].facility_record
        identifiers = []
        seen_identifiers: set[tuple[FacilityIdentifierType, str]] = set()
        for source_record in source_records:
            for identifier in source_record.facility_record.identifiers:
                key = (identifier.identifier_type, identifier.value)
                if key in seen_identifiers:
                    continue
                seen_identifiers.add(key)
                identifiers.append(identifier)

        stage_codes: list[str] = []
        seen_stage_codes: set[str] = set()
        for source_record in source_records:
            for stage_code in source_record.facility_record.stage_codes:
                if stage_code in seen_stage_codes:
                    continue
                seen_stage_codes.add(stage_code)
                stage_codes.append(stage_code)

        return FacilityRecord(
            facility_id=self._canonical_facility_id(source_records),
            facility_name=representative.facility_name,
            facility_type_code=representative.facility_type_code,
            country_code=representative.country_code,
            operator_company_id=representative.operator_company_id,
            owner_company_id=representative.owner_company_id,
            record_status=representative.record_status,
            facility_status=representative.facility_status,
            observed_at=representative.observed_at,
            valid_from=representative.valid_from,
            valid_to=representative.valid_to,
            address_text=representative.address_text,
            latitude=representative.latitude,
            longitude=representative.longitude,
            jurisdiction_code=representative.jurisdiction_code,
            stage_codes=tuple(stage_codes),
            identifiers=tuple(identifiers),
        )

    def _canonical_facility_id(self, source_records: list[SourceFacilityRecord]) -> UUID:
        strongest_identifier = self._preferred_identifier(source_records)
        if strongest_identifier is not None:
            identifier_type, identifier_value = strongest_identifier
            return uuid5(_CANONICAL_FACILITY_NAMESPACE, f"{identifier_type.value}:{identifier_value}")

        representative = source_records[0].facility_record
        fallback_key = (
            f"{normalize_facility_name(representative.facility_name)}:"
            f"{representative.country_code}:"
            f"{representative.operator_company_id}"
        )
        return uuid5(_CANONICAL_FACILITY_NAMESPACE, fallback_key)

    def _preferred_identifier(self, source_records: list[SourceFacilityRecord]) -> tuple[FacilityIdentifierType, str] | None:
        ordered_types = {identifier_type: index for index, identifier_type in enumerate(_STRONG_IDENTIFIER_TYPES)}
        candidates: list[tuple[int, str, tuple[FacilityIdentifierType, str]]] = []
        for source_record in source_records:
            for identifier in source_record.facility_record.identifiers:
                if identifier.identifier_type not in ordered_types:
                    continue
                candidates.append(
                    (
                        ordered_types[identifier.identifier_type],
                        identifier.value,
                        (identifier.identifier_type, identifier.value),
                    )
                )
        if not candidates:
            return None
        _, _, best = min(candidates)
        return best

    def _strong_identifier_keys(self, facility: FacilityRecord) -> tuple[tuple[FacilityIdentifierType, str], ...]:
        keys: list[tuple[FacilityIdentifierType, str]] = []
        for identifier in facility.identifiers:
            if identifier.identifier_type in _STRONG_IDENTIFIER_TYPES:
                keys.append((identifier.identifier_type, identifier.value))
        return tuple(keys)

    def _cluster_resolution_rule(
        self,
        rules: set[FacilityResolutionRule],
        cluster_size: int,
    ) -> FacilityResolutionRule:
        if FacilityResolutionRule.STRONG_IDENTIFIER in rules:
            return FacilityResolutionRule.STRONG_IDENTIFIER
        if cluster_size == 1:
            return FacilityResolutionRule.SINGLETON
        return FacilityResolutionRule.SINGLETON

    def _rule_confidence(self, rule: FacilityResolutionRule) -> float:
        if rule == FacilityResolutionRule.STRONG_IDENTIFIER:
            return 0.98
        return 1.0

    def _crosswalk_id(
        self,
        *,
        source_key: str,
        source_facility_id: UUID,
        canonical_facility_id: UUID,
    ) -> UUID:
        return uuid5(
            _FACILITY_CROSSWALK_NAMESPACE,
            f"{source_key}:{source_facility_id}:{canonical_facility_id}",
        )

    def _record_sort_key(self, source_record: SourceFacilityRecord) -> tuple[str, str]:
        return source_record.source_key, str(source_record.facility_record.facility_id)

    def _clusters(self, parent: list[int]) -> dict[int, list[int]]:
        grouped: dict[int, list[int]] = defaultdict(list)
        for index in range(len(parent)):
            grouped[self._find(parent, index)].append(index)
        return dict(grouped)

    def _union(
        self,
        *,
        parent: list[int],
        cluster_rules: dict[int, set[FacilityResolutionRule]],
        left_index: int,
        right_index: int,
        rule: FacilityResolutionRule,
    ) -> None:
        left_root = self._find(parent, left_index)
        right_root = self._find(parent, right_index)
        if left_root == right_root:
            cluster_rules[left_root].add(rule)
            return
        parent[right_root] = left_root
        cluster_rules[left_root].update(cluster_rules[right_root])
        cluster_rules[left_root].add(rule)
        cluster_rules.pop(right_root, None)

    def _find(self, parent: list[int], index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index
