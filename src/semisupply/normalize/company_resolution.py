"""Deterministic company resolution and source-crosswalk models."""

from __future__ import annotations

import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import NAMESPACE_URL, UUID, uuid5

from semisupply.registry import (
    CompanyAlias,
    CompanyIdentifier,
    CompanyIdentifierType,
    CompanyName,
    CompanyNameType,
    CompanyRecord,
    RecordStatus,
)

_CANONICAL_COMPANY_NAMESPACE = uuid5(NAMESPACE_URL, "semisupply.normalize.company")
_CROSSWALK_NAMESPACE = uuid5(NAMESPACE_URL, "semisupply.normalize.company-crosswalk")
_NAME_NORMALIZATION_PATTERN = re.compile(r"[^A-Z0-9]+")
_SOURCE_PRIORITY = {"gleif": 0, "edgar": 1}
_STRONG_IDENTIFIER_TYPES = (
    CompanyIdentifierType.LEI,
    CompanyIdentifierType.CIK,
    CompanyIdentifierType.DART_CORP_CODE,
    CompanyIdentifierType.ISIN,
    CompanyIdentifierType.REGISTRY_NUMBER,
)
_IDENTIFIER_PRIORITY = {
    CompanyIdentifierType.LEI: 0,
    CompanyIdentifierType.CIK: 1,
    CompanyIdentifierType.DART_CORP_CODE: 2,
    CompanyIdentifierType.ISIN: 3,
    CompanyIdentifierType.REGISTRY_NUMBER: 4,
}


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def _strip_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _validate_aware_datetime(value: datetime, *, field_name: str) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware")
    return value


def normalize_company_name(value: str) -> str:
    """Return an exact normalized company-name key for deterministic matching."""

    cleaned = _strip_required(value, field_name="value").upper()
    collapsed = _NAME_NORMALIZATION_PATTERN.sub(" ", cleaned)
    return " ".join(collapsed.split())


class CompanyResolutionStatus(StrEnum):
    """Resolution states for source company records."""

    RESOLVED = "resolved"
    NEEDS_REVIEW = "needs_review"


class CompanyResolutionRule(StrEnum):
    """Matching rules used by the first deterministic company resolver."""

    SINGLETON = "singleton"
    STRONG_IDENTIFIER = "strong_identifier"
    EXACT_NAME_COUNTRY = "exact_name_country"
    AMBIGUOUS_NAME_COUNTRY = "ambiguous_name_country"


@dataclass(frozen=True, slots=True)
class SourceCompanyRecord:
    """A source-specific company record entering the normalization layer."""

    source_key: str
    company_record: CompanyRecord

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))


@dataclass(frozen=True, slots=True)
class CompanyCrosswalk:
    """Maps one source-bound company record to one canonical company record."""

    crosswalk_id: UUID
    source_key: str
    source_company_id: UUID
    canonical_company_id: UUID
    resolution_rule: CompanyResolutionRule
    confidence: float

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")


@dataclass(frozen=True, slots=True)
class CompanyResolutionDecision:
    """Resolution outcome for one source-bound company record."""

    source_key: str
    source_company_id: UUID
    resolution_status: CompanyResolutionStatus
    resolution_rule: CompanyResolutionRule
    confidence: float
    canonical_company_id: UUID | None = None
    review_notes: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "source_key", _strip_required(self.source_key, field_name="source_key"))
        object.__setattr__(self, "review_notes", _strip_optional(self.review_notes))
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")
        if self.resolution_status == CompanyResolutionStatus.RESOLVED and self.canonical_company_id is None:
            raise ValueError("resolved decisions must include canonical_company_id")
        if self.resolution_status == CompanyResolutionStatus.NEEDS_REVIEW and self.canonical_company_id is not None:
            raise ValueError("needs_review decisions must not include canonical_company_id")


@dataclass(frozen=True, slots=True)
class CompanyResolutionResult:
    """Normalized output bundle for company resolution."""

    canonical_company_records: tuple[CompanyRecord, ...] = ()
    crosswalks: tuple[CompanyCrosswalk, ...] = ()
    decisions: tuple[CompanyResolutionDecision, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "canonical_company_records", tuple(self.canonical_company_records))
        object.__setattr__(self, "crosswalks", tuple(self.crosswalks))
        object.__setattr__(self, "decisions", tuple(self.decisions))


class CompanyResolver:
    """Resolve source-specific company records into canonical company entities."""

    def resolve(
        self,
        records: list[SourceCompanyRecord] | tuple[SourceCompanyRecord, ...],
    ) -> CompanyResolutionResult:
        """Resolve one batch of source company records into canonical records and crosswalks."""

        ordered_records = tuple(sorted(records, key=self._record_sort_key))
        if not ordered_records:
            return CompanyResolutionResult()

        parent = list(range(len(ordered_records)))
        cluster_rules: dict[int, set[CompanyResolutionRule]] = {index: set() for index in range(len(ordered_records))}

        identifier_index: dict[tuple[CompanyIdentifierType, str], int] = {}
        for index, source_record in enumerate(ordered_records):
            for identifier_key in self._strong_identifier_keys(source_record.company_record):
                match_index = identifier_index.get(identifier_key)
                if match_index is None:
                    identifier_index[identifier_key] = index
                    continue
                self._union(
                    parent=parent,
                    cluster_rules=cluster_rules,
                    left_index=index,
                    right_index=match_index,
                    rule=CompanyResolutionRule.STRONG_IDENTIFIER,
                )

        review_indices: set[int] = set()
        name_country_buckets: dict[tuple[str, str], list[int]] = defaultdict(list)
        for leader, members in self._clusters(parent).items():
            sample_record = ordered_records[members[0]].company_record
            name_country_buckets[(normalize_company_name(sample_record.canonical_name), sample_record.hq_country_code)].append(
                leader
            )

        for leaders in name_country_buckets.values():
            if len(leaders) < 2:
                continue
            if self._has_conflicting_strong_identifiers(leaders=leaders, clusters=self._clusters(parent), records=ordered_records):
                for leader in leaders:
                    review_indices.update(self._clusters(parent)[leader])
                continue
            anchor = leaders[0]
            for other in leaders[1:]:
                self._union(
                    parent=parent,
                    cluster_rules=cluster_rules,
                    left_index=anchor,
                    right_index=other,
                    rule=CompanyResolutionRule.EXACT_NAME_COUNTRY,
                )

        clusters = self._clusters(parent)
        canonical_records: list[CompanyRecord] = []
        crosswalks: list[CompanyCrosswalk] = []
        decisions: list[CompanyResolutionDecision] = []

        for leader, members in clusters.items():
            if any(member in review_indices for member in members):
                for member in members:
                    source_record = ordered_records[member]
                    decisions.append(
                        CompanyResolutionDecision(
                            source_key=source_record.source_key,
                            source_company_id=source_record.company_record.company_id,
                            resolution_status=CompanyResolutionStatus.NEEDS_REVIEW,
                            resolution_rule=CompanyResolutionRule.AMBIGUOUS_NAME_COUNTRY,
                            confidence=0.0,
                            review_notes=(
                                "Multiple exact normalized-name and country matches have conflicting strong identifiers."
                            ),
                        )
                    )
                continue

            member_records = [ordered_records[member] for member in members]
            resolution_rule = self._cluster_resolution_rule(cluster_rules.get(leader, set()), len(member_records))
            confidence = self._rule_confidence(resolution_rule)
            canonical_record = self._build_canonical_company_record(member_records)
            canonical_records.append(canonical_record)

            for member_record in member_records:
                crosswalks.append(
                    CompanyCrosswalk(
                        crosswalk_id=self._crosswalk_id(
                            source_key=member_record.source_key,
                            source_company_id=member_record.company_record.company_id,
                            canonical_company_id=canonical_record.company_id,
                        ),
                        source_key=member_record.source_key,
                        source_company_id=member_record.company_record.company_id,
                        canonical_company_id=canonical_record.company_id,
                        resolution_rule=resolution_rule,
                        confidence=confidence,
                    )
                )
                decisions.append(
                    CompanyResolutionDecision(
                        source_key=member_record.source_key,
                        source_company_id=member_record.company_record.company_id,
                        resolution_status=CompanyResolutionStatus.RESOLVED,
                        resolution_rule=resolution_rule,
                        confidence=confidence,
                        canonical_company_id=canonical_record.company_id,
                    )
                )

        return CompanyResolutionResult(
            canonical_company_records=tuple(canonical_records),
            crosswalks=tuple(crosswalks),
            decisions=tuple(decisions),
        )

    def _record_sort_key(self, source_record: SourceCompanyRecord) -> tuple[str, str]:
        return (source_record.source_key, str(source_record.company_record.company_id))

    def _union(
        self,
        *,
        parent: list[int],
        cluster_rules: dict[int, set[CompanyResolutionRule]],
        left_index: int,
        right_index: int,
        rule: CompanyResolutionRule,
    ) -> None:
        left_root = self._find(parent, left_index)
        right_root = self._find(parent, right_index)
        if left_root == right_root:
            cluster_rules[left_root].add(rule)
            return
        keep_root = min(left_root, right_root)
        merge_root = max(left_root, right_root)
        parent[merge_root] = keep_root
        merged_rules = cluster_rules[keep_root] | cluster_rules[merge_root]
        merged_rules.add(rule)
        cluster_rules[keep_root] = merged_rules
        cluster_rules.pop(merge_root, None)

    def _find(self, parent: list[int], index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def _clusters(self, parent: list[int]) -> dict[int, list[int]]:
        grouped: dict[int, list[int]] = defaultdict(list)
        for index in range(len(parent)):
            grouped[self._find(parent, index)].append(index)
        return {leader: sorted(members) for leader, members in grouped.items()}

    def _strong_identifier_keys(self, company_record: CompanyRecord) -> tuple[tuple[CompanyIdentifierType, str], ...]:
        keys: list[tuple[CompanyIdentifierType, str]] = []
        for identifier in company_record.identifiers:
            if identifier.identifier_type not in _STRONG_IDENTIFIER_TYPES:
                continue
            keys.append((identifier.identifier_type, identifier.value.strip().upper()))
        return tuple(keys)

    def _has_conflicting_strong_identifiers(
        self,
        *,
        leaders: list[int],
        clusters: dict[int, list[int]],
        records: tuple[SourceCompanyRecord, ...],
    ) -> bool:
        identifier_values_by_type: dict[CompanyIdentifierType, set[str]] = defaultdict(set)
        for leader in leaders:
            for member in clusters[leader]:
                for identifier_type, identifier_value in self._strong_identifier_keys(records[member].company_record):
                    identifier_values_by_type[identifier_type].add(identifier_value)
        return any(len(values) > 1 for values in identifier_values_by_type.values())

    def _cluster_resolution_rule(
        self,
        applied_rules: set[CompanyResolutionRule],
        cluster_size: int,
    ) -> CompanyResolutionRule:
        if CompanyResolutionRule.STRONG_IDENTIFIER in applied_rules:
            return CompanyResolutionRule.STRONG_IDENTIFIER
        if CompanyResolutionRule.EXACT_NAME_COUNTRY in applied_rules:
            return CompanyResolutionRule.EXACT_NAME_COUNTRY
        if cluster_size == 1:
            return CompanyResolutionRule.SINGLETON
        return CompanyResolutionRule.EXACT_NAME_COUNTRY

    def _rule_confidence(self, rule: CompanyResolutionRule) -> float:
        if rule == CompanyResolutionRule.EXACT_NAME_COUNTRY:
            return 0.9
        if rule == CompanyResolutionRule.AMBIGUOUS_NAME_COUNTRY:
            return 0.0
        return 1.0

    def _build_canonical_company_record(self, records: list[SourceCompanyRecord]) -> CompanyRecord:
        sorted_records = sorted(records, key=self._preferred_record_key)
        canonical_source = sorted_records[0].company_record
        canonical_company_id = self._canonical_company_id(sorted_records)

        all_names = self._merge_names(sorted_records)
        all_aliases = self._merge_aliases(sorted_records)
        all_identifiers = self._merge_identifiers(sorted_records)
        all_roles = self._merge_roles(sorted_records)

        observed_times = [record.company_record.observed_at for record in sorted_records]
        valid_from_candidates = [record.company_record.valid_from for record in sorted_records if record.company_record.valid_from]
        valid_to_candidates = [record.company_record.valid_to for record in sorted_records if record.company_record.valid_to]

        country_counter = Counter(record.company_record.hq_country_code for record in sorted_records)
        hq_country_code = sorted(country_counter.items(), key=lambda item: (-item[1], item[0]))[0][0]

        return CompanyRecord(
            company_id=canonical_company_id,
            canonical_name=canonical_source.canonical_name,
            entity_type=canonical_source.entity_type,
            hq_country_code=hq_country_code,
            record_status=RecordStatus.ACTIVE,
            observed_at=max(observed_times),
            valid_from=min(valid_from_candidates) if valid_from_candidates else None,
            valid_to=max(valid_to_candidates) if len(valid_to_candidates) == len(sorted_records) and valid_to_candidates else None,
            description=self._first_non_empty(record.company_record.description for record in sorted_records),
            website=self._first_non_empty(record.company_record.website for record in sorted_records),
            wikidata_id=self._first_non_empty(record.company_record.wikidata_id for record in sorted_records),
            lei=self._first_identifier_value(all_identifiers, CompanyIdentifierType.LEI),
            cik=self._first_identifier_value(all_identifiers, CompanyIdentifierType.CIK),
            dart_corp_code=self._first_identifier_value(all_identifiers, CompanyIdentifierType.DART_CORP_CODE),
            jurisdiction_code=self._first_non_empty(record.company_record.jurisdiction_code for record in sorted_records),
            names=all_names,
            aliases=all_aliases,
            identifiers=all_identifiers,
            roles=all_roles,
        )

    def _preferred_record_key(self, source_record: SourceCompanyRecord) -> tuple[int, int, str]:
        priority = _SOURCE_PRIORITY.get(source_record.source_key, 100)
        return (priority, -len(source_record.company_record.canonical_name), source_record.company_record.canonical_name.casefold())

    def _canonical_company_id(self, records: list[SourceCompanyRecord]) -> UUID:
        strong_identifiers: list[tuple[int, str, str]] = []
        for source_record in records:
            for identifier in source_record.company_record.identifiers:
                if identifier.identifier_type not in _STRONG_IDENTIFIER_TYPES:
                    continue
                strong_identifiers.append(
                    (
                        _IDENTIFIER_PRIORITY[identifier.identifier_type],
                        identifier.identifier_type.value,
                        identifier.value.strip().upper(),
                    )
                )
        if strong_identifiers:
            _, identifier_type, identifier_value = sorted(set(strong_identifiers))[0]
            return uuid5(_CANONICAL_COMPANY_NAMESPACE, f"{identifier_type}:{identifier_value}")

        anchor_record = sorted(records, key=self._preferred_record_key)[0].company_record
        normalized_name = normalize_company_name(anchor_record.canonical_name)
        return uuid5(_CANONICAL_COMPANY_NAMESPACE, f"{normalized_name}:{anchor_record.hq_country_code}")

    def _merge_names(self, records: list[SourceCompanyRecord]) -> tuple[CompanyName, ...]:
        names: list[CompanyName] = []
        seen: set[tuple[str, CompanyNameType]] = set()
        for source_record in sorted(records, key=self._preferred_record_key):
            name_type = CompanyNameType.LEGAL if source_record.source_key == "gleif" else CompanyNameType.CANONICAL
            for value in (source_record.company_record.canonical_name, *(name.value for name in source_record.company_record.names)):
                key = (value.casefold(), name_type)
                if key in seen:
                    continue
                seen.add(key)
                names.append(
                    CompanyName(
                        value=value,
                        name_type=name_type,
                        observed_at=source_record.company_record.observed_at,
                    )
                )
        return tuple(names)

    def _merge_aliases(self, records: list[SourceCompanyRecord]) -> tuple[CompanyAlias, ...]:
        aliases: list[CompanyAlias] = []
        seen: set[tuple[str, str]] = set()
        for source_record in sorted(records, key=self._preferred_record_key):
            for alias in source_record.company_record.aliases:
                key = (alias.value.casefold(), alias.alias_type.value)
                if key in seen:
                    continue
                seen.add(key)
                aliases.append(alias)
        return tuple(aliases)

    def _merge_identifiers(self, records: list[SourceCompanyRecord]) -> tuple[CompanyIdentifier, ...]:
        identifiers: list[CompanyIdentifier] = []
        seen: set[tuple[CompanyIdentifierType, str]] = set()
        for source_record in sorted(records, key=self._preferred_record_key):
            for identifier in source_record.company_record.identifiers:
                key = (identifier.identifier_type, identifier.value.strip().upper())
                if key in seen:
                    continue
                seen.add(key)
                identifiers.append(identifier)
        return tuple(
            sorted(
                identifiers,
                key=lambda identifier: (
                    _IDENTIFIER_PRIORITY.get(identifier.identifier_type, 100),
                    identifier.identifier_type.value,
                    identifier.value,
                ),
            )
        )

    def _merge_roles(self, records: list[SourceCompanyRecord]) -> tuple:
        roles: list = []
        seen: set[str] = set()
        for source_record in sorted(records, key=self._preferred_record_key):
            for role in source_record.company_record.roles:
                if role.role_code in seen:
                    continue
                seen.add(role.role_code)
                roles.append(role)
        return tuple(roles)

    def _crosswalk_id(
        self,
        *,
        source_key: str,
        source_company_id: UUID,
        canonical_company_id: UUID,
    ) -> UUID:
        return uuid5(
            _CROSSWALK_NAMESPACE,
            f"{source_key}:{source_company_id}:{canonical_company_id}",
        )

    def _first_identifier_value(
        self,
        identifiers: tuple[CompanyIdentifier, ...],
        identifier_type: CompanyIdentifierType,
    ) -> str | None:
        for identifier in identifiers:
            if identifier.identifier_type == identifier_type:
                return identifier.value
        return None

    def _first_non_empty(self, values) -> str | None:
        for value in values:
            if value is not None and value.strip():
                return value
        return None
