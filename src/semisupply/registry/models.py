"""Typed models for the canonical company and facility registry."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID


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


def _validate_country_code(country_code: str) -> str:
    normalized = _strip_required(country_code, field_name="country_code").upper()
    if len(normalized) != 2 or not normalized.isalpha():
        raise ValueError("country_code must be a two-letter ISO-style code")
    return normalized


def _validate_aware_datetime(value: datetime, *, field_name: str) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware")
    return value


def _validate_optional_date_range(
    *,
    observed_at: datetime,
    valid_from: datetime | None,
    valid_to: datetime | None,
) -> None:
    _validate_aware_datetime(observed_at, field_name="observed_at")
    if valid_from is not None:
        _validate_aware_datetime(valid_from, field_name="valid_from")
    if valid_to is not None:
        _validate_aware_datetime(valid_to, field_name="valid_to")
    if valid_from is not None and valid_to is not None and valid_from > valid_to:
        raise ValueError("valid_from must be earlier than or equal to valid_to")


def _validate_role_code(role_code: str) -> str:
    normalized = _strip_required(role_code, field_name="role_code").upper()
    if not normalized.startswith("ROLE."):
        raise ValueError("role_code must start with 'ROLE.'")
    return normalized


def _validate_facility_type_code(facility_type_code: str) -> str:
    normalized = _strip_required(facility_type_code, field_name="facility_type_code").upper()
    if not normalized.startswith("FAC."):
        raise ValueError("facility_type_code must start with 'FAC.'")
    return normalized


def _validate_stage_code(stage_code: str) -> str:
    normalized = _strip_required(stage_code, field_name="stage_code").upper()
    if not normalized.startswith("STAGE."):
        raise ValueError("stage_code must start with 'STAGE.'")
    return normalized


def _validate_latitude(latitude: float | None) -> float | None:
    if latitude is None:
        return None
    if not -90.0 <= latitude <= 90.0:
        raise ValueError("latitude must be between -90.0 and 90.0")
    return latitude


def _validate_longitude(longitude: float | None) -> float | None:
    if longitude is None:
        return None
    if not -180.0 <= longitude <= 180.0:
        raise ValueError("longitude must be between -180.0 and 180.0")
    return longitude


class EntityType(StrEnum):
    """Supported canonical entity types for registry records."""

    COMPANY = "company"
    GOVERNMENT_AGENCY = "government_agency"
    ACADEMIC_ORG = "academic_org"
    INDUSTRY_BODY = "industry_body"
    OTHER = "other"


class RecordStatus(StrEnum):
    """Record lifecycle states for normalized entities."""

    ACTIVE = "active"
    PENDING_REVIEW = "pending_review"
    MERGED = "merged"
    INACTIVE = "inactive"


class CompanyNameType(StrEnum):
    """Supported canonical or legal name types."""

    CANONICAL = "canonical"
    LEGAL = "legal"
    LOCAL_LEGAL = "local_legal"
    ENGLISH = "english"


class CompanyAliasType(StrEnum):
    """Supported alias categories."""

    SHORT_NAME = "short_name"
    FORMER_NAME = "former_name"
    TRANSLITERATED = "transliterated"
    ABBREVIATION = "abbreviation"
    TRADING_NAME = "trading_name"
    OTHER = "other"


class CompanyIdentifierType(StrEnum):
    """Supported external identifier types."""

    LEI = "lei"
    CIK = "cik"
    DART_CORP_CODE = "dart_corp_code"
    TICKER = "ticker"
    WIKIDATA = "wikidata"
    REGISTRY_NUMBER = "registry_number"
    ISIN = "isin"
    OTHER = "other"


class FacilityStatus(StrEnum):
    """Operational states for selectively modeled facilities."""

    OPERATING = "operating"
    IDLE = "idle"
    ANNOUNCED = "announced"
    UNDER_CONSTRUCTION = "under_construction"
    CLOSED = "closed"
    UNKNOWN = "unknown"


class FacilityIdentifierType(StrEnum):
    """Supported external identifier types for facility records."""

    EPA_ECHO_ID = "epa_echo_id"
    EPA_FRS_ID = "epa_frs_id"
    PRTR_ID = "prtr_id"
    LEI = "lei"
    REGISTRY_NUMBER = "registry_number"
    OTHER = "other"


@dataclass(frozen=True, slots=True)
class CompanyName:
    """A canonical or legal name associated with a company record."""

    value: str
    name_type: CompanyNameType
    language: str | None = None
    script: str | None = None
    observed_at: datetime | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "value", _strip_required(self.value, field_name="value"))
        object.__setattr__(self, "language", _strip_optional(self.language))
        object.__setattr__(self, "script", _strip_optional(self.script))
        if self.observed_at is not None:
            _validate_aware_datetime(self.observed_at, field_name="observed_at")


@dataclass(frozen=True, slots=True)
class CompanyAlias:
    """An alternate company name used for matching or display."""

    value: str
    alias_type: CompanyAliasType
    language: str | None = None
    script: str | None = None
    observed_at: datetime | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "value", _strip_required(self.value, field_name="value"))
        object.__setattr__(self, "language", _strip_optional(self.language))
        object.__setattr__(self, "script", _strip_optional(self.script))
        if self.observed_at is not None:
            _validate_aware_datetime(self.observed_at, field_name="observed_at")


@dataclass(frozen=True, slots=True)
class CompanyIdentifier:
    """A stable external identifier for a canonical company record."""

    identifier_type: CompanyIdentifierType
    value: str
    issuer: str | None = None
    observed_at: datetime | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "value", _strip_required(self.value, field_name="value"))
        object.__setattr__(self, "issuer", _strip_optional(self.issuer))
        if self.observed_at is not None:
            _validate_aware_datetime(self.observed_at, field_name="observed_at")
        if self.valid_from is not None:
            _validate_aware_datetime(self.valid_from, field_name="valid_from")
        if self.valid_to is not None:
            _validate_aware_datetime(self.valid_to, field_name="valid_to")
        if self.valid_from is not None and self.valid_to is not None and self.valid_from > self.valid_to:
            raise ValueError("valid_from must be earlier than or equal to valid_to")


@dataclass(frozen=True, slots=True)
class CompanyRoleAssignment:
    """A role assignment for a company with timing metadata."""

    role_code: str
    confidence: float | None = None
    observed_at: datetime | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    source_evidence_id: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "role_code", _validate_role_code(self.role_code))
        object.__setattr__(self, "source_evidence_id", _strip_optional(self.source_evidence_id))
        if self.confidence is not None and not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")
        if self.observed_at is not None:
            _validate_aware_datetime(self.observed_at, field_name="observed_at")
        if self.valid_from is not None:
            _validate_aware_datetime(self.valid_from, field_name="valid_from")
        if self.valid_to is not None:
            _validate_aware_datetime(self.valid_to, field_name="valid_to")
        if self.valid_from is not None and self.valid_to is not None and self.valid_from > self.valid_to:
            raise ValueError("valid_from must be earlier than or equal to valid_to")


@dataclass(frozen=True, slots=True)
class CompanyRecord:
    """The canonical normalized company record used by the pipeline."""

    company_id: UUID
    canonical_name: str
    entity_type: EntityType
    hq_country_code: str
    record_status: RecordStatus
    observed_at: datetime
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    description: str | None = None
    website: str | None = None
    wikidata_id: str | None = None
    lei: str | None = None
    cik: str | None = None
    dart_corp_code: str | None = None
    jurisdiction_code: str | None = None
    names: tuple[CompanyName, ...] = ()
    aliases: tuple[CompanyAlias, ...] = ()
    identifiers: tuple[CompanyIdentifier, ...] = ()
    roles: tuple[CompanyRoleAssignment, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "canonical_name",
            _strip_required(self.canonical_name, field_name="canonical_name"),
        )
        object.__setattr__(self, "hq_country_code", _validate_country_code(self.hq_country_code))
        _validate_optional_date_range(
            observed_at=self.observed_at,
            valid_from=self.valid_from,
            valid_to=self.valid_to,
        )

        object.__setattr__(self, "description", _strip_optional(self.description))
        object.__setattr__(self, "website", _strip_optional(self.website))
        object.__setattr__(self, "wikidata_id", _strip_optional(self.wikidata_id))
        object.__setattr__(self, "lei", _strip_optional(self.lei))
        object.__setattr__(self, "cik", _strip_optional(self.cik))
        object.__setattr__(self, "dart_corp_code", _strip_optional(self.dart_corp_code))
        object.__setattr__(self, "jurisdiction_code", _strip_optional(self.jurisdiction_code))

        object.__setattr__(self, "names", tuple(self.names))
        object.__setattr__(self, "aliases", tuple(self.aliases))
        object.__setattr__(self, "identifiers", tuple(self.identifiers))
        object.__setattr__(self, "roles", tuple(self.roles))

        if self.website is not None and "://" not in self.website:
            raise ValueError("website must include a URL scheme")
        if self.lei is not None and len(self.lei) != 20:
            raise ValueError("lei must be 20 characters when provided")

    @property
    def all_known_names(self) -> tuple[str, ...]:
        """Return a deduplicated tuple of names useful for matching and display."""

        ordered_names = [self.canonical_name]
        ordered_names.extend(name.value for name in self.names)
        ordered_names.extend(alias.value for alias in self.aliases)

        deduplicated: list[str] = []
        seen: set[str] = set()
        for candidate in ordered_names:
            normalized = candidate.casefold()
            if normalized in seen:
                continue
            seen.add(normalized)
            deduplicated.append(candidate)
        return tuple(deduplicated)

    def has_role(self, role_code: str) -> bool:
        """Return whether the record currently includes a given normalized role code."""

        normalized = _validate_role_code(role_code)
        return any(role.role_code == normalized for role in self.roles)

    def primary_identifier(self, identifier_type: CompanyIdentifierType) -> CompanyIdentifier | None:
        """Return the first identifier for the requested type, if present."""

        for identifier in self.identifiers:
            if identifier.identifier_type == identifier_type:
                return identifier
        return None


@dataclass(frozen=True, slots=True)
class FacilityIdentifier:
    """A stable external identifier for a canonical facility record."""

    identifier_type: FacilityIdentifierType
    value: str
    issuer: str | None = None
    observed_at: datetime | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "value", _strip_required(self.value, field_name="value"))
        object.__setattr__(self, "issuer", _strip_optional(self.issuer))
        if self.observed_at is not None:
            _validate_aware_datetime(self.observed_at, field_name="observed_at")
        if self.valid_from is not None:
            _validate_aware_datetime(self.valid_from, field_name="valid_from")
        if self.valid_to is not None:
            _validate_aware_datetime(self.valid_to, field_name="valid_to")
        if self.valid_from is not None and self.valid_to is not None and self.valid_from > self.valid_to:
            raise ValueError("valid_from must be earlier than or equal to valid_to")


@dataclass(frozen=True, slots=True)
class FacilityRecord:
    """The canonical selectively modeled facility record used by the pipeline."""

    facility_id: UUID
    facility_name: str
    facility_type_code: str
    country_code: str
    operator_company_id: UUID
    record_status: RecordStatus
    observed_at: datetime
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    owner_company_id: UUID | None = None
    facility_status: FacilityStatus = FacilityStatus.UNKNOWN
    address_text: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    jurisdiction_code: str | None = None
    stage_codes: tuple[str, ...] = ()
    identifiers: tuple[FacilityIdentifier, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "facility_name", _strip_required(self.facility_name, field_name="facility_name"))
        object.__setattr__(self, "facility_type_code", _validate_facility_type_code(self.facility_type_code))
        object.__setattr__(self, "country_code", _validate_country_code(self.country_code))
        _validate_optional_date_range(
            observed_at=self.observed_at,
            valid_from=self.valid_from,
            valid_to=self.valid_to,
        )

        object.__setattr__(self, "address_text", _strip_optional(self.address_text))
        object.__setattr__(self, "jurisdiction_code", _strip_optional(self.jurisdiction_code))
        object.__setattr__(self, "latitude", _validate_latitude(self.latitude))
        object.__setattr__(self, "longitude", _validate_longitude(self.longitude))
        object.__setattr__(self, "stage_codes", tuple(_validate_stage_code(code) for code in self.stage_codes))
        object.__setattr__(self, "identifiers", tuple(self.identifiers))

        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must either both be set or both be omitted")

    def has_stage(self, stage_code: str) -> bool:
        """Return whether the record currently includes a given normalized stage code."""

        normalized = _validate_stage_code(stage_code)
        return normalized in self.stage_codes

    def primary_identifier(self, identifier_type: FacilityIdentifierType) -> FacilityIdentifier | None:
        """Return the first identifier for the requested type, if present."""

        for identifier in self.identifiers:
            if identifier.identifier_type == identifier_type:
                return identifier
        return None
