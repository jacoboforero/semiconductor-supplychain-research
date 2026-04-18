"""Conservative seeded mappings from company records into taxonomy codes."""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from semisupply.normalize import normalize_company_name
from semisupply.registry import CompanyIdentifierType, CompanyRecord

from .catalog import DEFAULT_TAXONOMY
from .models import TaxonomyCatalog


PROJECT_ROOT = Path(__file__).resolve().parents[3]
COMPANY_UNIVERSE_CONTRACT_PATH = PROJECT_ROOT / "contracts" / "v1" / "company_universe.v1.json"
COMPANY_TAXONOMY_CONTRACT_PATH = PROJECT_ROOT / "contracts" / "v1" / "company_taxonomy.v1.json"


def _strip_required(value: str, *, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


def _normalize_codes(values: tuple[str, ...], *, field_name: str) -> tuple[str, ...]:
    normalized = tuple(_strip_required(value, field_name=field_name).upper() for value in values)
    if len(set(normalized)) != len(normalized):
        raise ValueError(f"{field_name} must not contain duplicates")
    return normalized


def _load_json_contract(path: Path) -> dict[str, object]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError(f"contract payload must be a JSON object: {path}")
    return payload


def _merge_match_names(display_name: str, extra_names: tuple[str, ...]) -> tuple[str, ...]:
    merged: list[str] = []
    seen: set[str] = set()

    for raw_name in (display_name, *extra_names):
        cleaned = _strip_required(raw_name, field_name="match_names")
        normalized = normalize_company_name(cleaned)
        if normalized in seen:
            continue
        seen.add(normalized)
        merged.append(cleaned)

    return tuple(merged)


def _load_match_identifiers(raw_entries: object) -> tuple[tuple[CompanyIdentifierType, str], ...]:
    if raw_entries is None:
        return ()
    if not isinstance(raw_entries, list):
        raise ValueError("match_identifiers must be a list when present")

    match_identifiers: list[tuple[CompanyIdentifierType, str]] = []
    for entry in raw_entries:
        if not isinstance(entry, dict):
            raise ValueError("match_identifiers entries must be objects")
        identifier_type = CompanyIdentifierType(_strip_required(str(entry["identifier_type"]), field_name="identifier_type"))
        value = _strip_required(str(entry["value"]), field_name="value")
        match_identifiers.append((identifier_type, value))
    return tuple(match_identifiers)


@dataclass(frozen=True, slots=True)
class CompanyTaxonomySeed:
    """Curated mapping seed for a known company or company family."""

    seed_id: str
    match_names: tuple[str, ...] = ()
    match_identifiers: tuple[tuple[CompanyIdentifierType, str], ...] = ()
    role_codes: tuple[str, ...] = ()
    segment_codes: tuple[str, ...] = ()
    chip_codes: tuple[str, ...] = ()
    notes: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "seed_id", _strip_required(self.seed_id, field_name="seed_id"))
        object.__setattr__(
            self,
            "match_names",
            tuple(normalize_company_name(name) for name in self.match_names),
        )
        object.__setattr__(
            self,
            "match_identifiers",
            tuple((identifier_type, _strip_required(value, field_name="match_identifiers").upper()) for identifier_type, value in self.match_identifiers),
        )
        object.__setattr__(self, "role_codes", _normalize_codes(self.role_codes, field_name="role_codes"))
        object.__setattr__(self, "segment_codes", _normalize_codes(self.segment_codes, field_name="segment_codes"))
        object.__setattr__(self, "chip_codes", _normalize_codes(self.chip_codes, field_name="chip_codes"))

        if not self.match_names and not self.match_identifiers:
            raise ValueError("company taxonomy seeds must match by name or identifier")
        if not self.role_codes and not self.segment_codes and not self.chip_codes:
            raise ValueError("company taxonomy seeds must emit at least one taxonomy code")


@dataclass(frozen=True, slots=True)
class CompanyTaxonomyMapping:
    """Mapped taxonomy codes for one canonical company."""

    company_id: str
    matched_seed_id: str
    role_codes: tuple[str, ...]
    segment_codes: tuple[str, ...]
    chip_codes: tuple[str, ...]
    confidence: float
    notes: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "company_id", _strip_required(self.company_id, field_name="company_id"))
        object.__setattr__(self, "matched_seed_id", _strip_required(self.matched_seed_id, field_name="matched_seed_id"))
        object.__setattr__(self, "role_codes", _normalize_codes(self.role_codes, field_name="role_codes"))
        object.__setattr__(self, "segment_codes", _normalize_codes(self.segment_codes, field_name="segment_codes"))
        object.__setattr__(self, "chip_codes", _normalize_codes(self.chip_codes, field_name="chip_codes"))
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")


class SeedCompanyTaxonomyMapper:
    """Map known companies into internal taxonomy codes using curated seeds only."""

    def __init__(
        self,
        *,
        taxonomy: TaxonomyCatalog = DEFAULT_TAXONOMY,
        seeds: tuple[CompanyTaxonomySeed, ...] = (),
    ) -> None:
        self.taxonomy = taxonomy
        self.seeds = tuple(seeds)
        for seed in self.seeds:
            for code in (*seed.role_codes, *seed.segment_codes, *seed.chip_codes):
                self.taxonomy.require(code)

    def map_company(self, company: CompanyRecord) -> CompanyTaxonomyMapping | None:
        """Return taxonomy codes for a company when a curated seed matches."""

        normalized_names = {normalize_company_name(name) for name in company.all_known_names}
        normalized_identifiers = {
            (identifier.identifier_type, identifier.value.strip().upper())
            for identifier in company.identifiers
        }

        for seed in self.seeds:
            if set(seed.match_names) & normalized_names:
                return CompanyTaxonomyMapping(
                    company_id=str(company.company_id),
                    matched_seed_id=seed.seed_id,
                    role_codes=seed.role_codes,
                    segment_codes=seed.segment_codes,
                    chip_codes=seed.chip_codes,
                    confidence=1.0,
                    notes=seed.notes,
                )
            if set(seed.match_identifiers) & normalized_identifiers:
                return CompanyTaxonomyMapping(
                    company_id=str(company.company_id),
                    matched_seed_id=seed.seed_id,
                    role_codes=seed.role_codes,
                    segment_codes=seed.segment_codes,
                    chip_codes=seed.chip_codes,
                    confidence=1.0,
                    notes=seed.notes,
                )
        return None


@lru_cache(maxsize=1)
def load_default_company_taxonomy_seeds() -> tuple[CompanyTaxonomySeed, ...]:
    """Load the curated V1 taxonomy seeds from the repo-managed contracts."""

    universe_payload = _load_json_contract(COMPANY_UNIVERSE_CONTRACT_PATH)
    taxonomy_payload = _load_json_contract(COMPANY_TAXONOMY_CONTRACT_PATH)

    raw_companies = universe_payload.get("companies")
    if not isinstance(raw_companies, list):
        raise ValueError("company universe contract must contain a companies list")

    universe_companies: list[dict[str, object]] = []
    universe_by_slug: dict[str, dict[str, object]] = {}
    for company in raw_companies:
        if not isinstance(company, dict):
            raise ValueError("company universe entries must be objects")
        slug = _strip_required(str(company["company_slug"]), field_name="company_slug")
        if slug in universe_by_slug:
            raise ValueError(f"company universe slug must be unique: {slug}")
        universe_companies.append(company)
        universe_by_slug[slug] = company

    raw_bucket_defaults = taxonomy_payload.get("bucket_defaults")
    if not isinstance(raw_bucket_defaults, dict):
        raise ValueError("company taxonomy contract must contain bucket_defaults")

    bucket_defaults: dict[str, dict[str, tuple[str, ...]]] = {}
    for bucket, spec in raw_bucket_defaults.items():
        bucket_code = _strip_required(str(bucket), field_name="bucket_defaults")
        if not isinstance(spec, dict):
            raise ValueError("bucket_defaults entries must be objects")
        bucket_defaults[bucket_code] = {
            "role_codes": tuple(spec.get("role_codes", ())),
            "segment_codes": tuple(spec.get("segment_codes", ())),
            "chip_codes": tuple(spec.get("chip_codes", ())),
        }

    raw_overrides = taxonomy_payload.get("company_overrides", [])
    if not isinstance(raw_overrides, list):
        raise ValueError("company_overrides must be a list when present")

    overrides_by_slug: dict[str, dict[str, object]] = {}
    for override in raw_overrides:
        if not isinstance(override, dict):
            raise ValueError("company override entries must be objects")
        slug = _strip_required(str(override["company_slug"]), field_name="company_slug")
        if slug not in universe_by_slug:
            raise ValueError(f"company override references unknown slug: {slug}")
        if slug in overrides_by_slug:
            raise ValueError(f"company override slug must be unique: {slug}")
        overrides_by_slug[slug] = override

    seeds: list[CompanyTaxonomySeed] = []
    for company in universe_companies:
        slug = _strip_required(str(company["company_slug"]), field_name="company_slug")
        display_name = _strip_required(str(company["display_name"]), field_name="display_name")
        primary_bucket = _strip_required(str(company["primary_bucket"]), field_name="primary_bucket")
        if primary_bucket not in bucket_defaults:
            raise ValueError(f"missing bucket default for company universe bucket: {primary_bucket}")

        default_spec = bucket_defaults[primary_bucket]
        override = overrides_by_slug.get(slug, {})

        role_codes = tuple(override.get("role_codes", default_spec["role_codes"]))
        segment_codes = tuple(override.get("segment_codes", default_spec["segment_codes"]))
        chip_codes = tuple(override.get("chip_codes", default_spec["chip_codes"]))
        match_names = _merge_match_names(display_name, tuple(override.get("match_names", ())))
        match_identifiers = _load_match_identifiers(override.get("match_identifiers"))
        notes = override.get("notes")
        if notes is not None:
            notes = _strip_required(str(notes), field_name="notes")

        seeds.append(
            CompanyTaxonomySeed(
                seed_id=slug,
                match_names=match_names,
                match_identifiers=match_identifiers,
                role_codes=role_codes,
                segment_codes=segment_codes,
                chip_codes=chip_codes,
                notes=notes,
            )
        )

    return tuple(seeds)


def default_company_taxonomy_mapper() -> SeedCompanyTaxonomyMapper:
    """Return the default curated company taxonomy mapper for v1."""

    return SeedCompanyTaxonomyMapper(seeds=load_default_company_taxonomy_seeds())
