"""Versioned taxonomy models for internal category codes."""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import StrEnum

_PREDICATE_PATTERN = re.compile(r"^[A-Z][A-Z0-9_]*(?:_[A-Z0-9_]+)*$")
_PREFIX_BY_KIND: dict["TaxonomyKind", str | None] = {}


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


class TaxonomyKind(StrEnum):
    """Top-level classes for internal taxonomy entries."""

    SEGMENT = "segment"
    ROLE = "role"
    CHIP_OUTPUT = "chip_output"
    FACILITY_TYPE = "facility_type"
    PROCESS_STAGE = "process_stage"
    ITEM_CLASS = "item_class"
    SERVICE = "service"
    GOOD = "good"
    TOOL = "tool"
    SOFTWARE = "software"
    IP = "ip"
    PREDICATE = "predicate"


_PREFIX_BY_KIND = {
    TaxonomyKind.SEGMENT: "SEG.",
    TaxonomyKind.ROLE: "ROLE.",
    TaxonomyKind.CHIP_OUTPUT: "CHIP.",
    TaxonomyKind.FACILITY_TYPE: "FAC.",
    TaxonomyKind.PROCESS_STAGE: "STAGE.",
    TaxonomyKind.ITEM_CLASS: "ITEM.",
    TaxonomyKind.SERVICE: "SERVICE.",
    TaxonomyKind.GOOD: "GOOD.",
    TaxonomyKind.TOOL: "TOOL.",
    TaxonomyKind.SOFTWARE: "SW.",
    TaxonomyKind.IP: "IP.",
    TaxonomyKind.PREDICATE: None,
}


def _validate_code(code: str, *, kind: TaxonomyKind) -> str:
    normalized = _strip_required(code, field_name="code").upper()
    expected_prefix = _PREFIX_BY_KIND[kind]
    if expected_prefix is None:
        if _PREDICATE_PATTERN.fullmatch(normalized) is None:
            raise ValueError("predicate codes must use uppercase underscore-separated tokens")
        return normalized
    if not normalized.startswith(expected_prefix):
        raise ValueError(f"code must start with '{expected_prefix}' for kind '{kind.value}'")
    return normalized


@dataclass(frozen=True, slots=True)
class TaxonomyEntry:
    """One versioned taxonomy code with a human-readable label."""

    code: str
    kind: TaxonomyKind
    label: str
    description: str | None = None
    parent_code: str | None = None
    aliases: tuple[str, ...] = ()
    is_active: bool = True

    def __post_init__(self) -> None:
        object.__setattr__(self, "code", _validate_code(self.code, kind=self.kind))
        object.__setattr__(self, "label", _strip_required(self.label, field_name="label"))
        object.__setattr__(self, "description", _strip_optional(self.description))
        parent_code = _strip_optional(self.parent_code)
        if parent_code is not None:
            parent_code = parent_code.upper()
        object.__setattr__(self, "parent_code", parent_code)
        object.__setattr__(self, "aliases", tuple(_strip_required(alias, field_name="aliases") for alias in self.aliases))


@dataclass(frozen=True, slots=True)
class TaxonomyCatalog:
    """A versioned set of internal taxonomy entries."""

    version: str
    entries: tuple[TaxonomyEntry, ...]

    def __post_init__(self) -> None:
        object.__setattr__(self, "version", _strip_required(self.version, field_name="version"))
        object.__setattr__(self, "entries", tuple(self.entries))
        codes = [entry.code for entry in self.entries]
        if len(set(codes)) != len(codes):
            raise ValueError("taxonomy entry codes must be unique within one catalog version")

    def get(self, code: str) -> TaxonomyEntry | None:
        """Return one taxonomy entry by code, if present."""

        normalized = _strip_required(code, field_name="code").upper()
        for entry in self.entries:
            if entry.code == normalized:
                return entry
        return None

    def require(self, code: str) -> TaxonomyEntry:
        """Return one taxonomy entry by code or raise if missing."""

        entry = self.get(code)
        if entry is None:
            raise KeyError(f"unknown taxonomy code: {code}")
        return entry

    def codes_for_kind(self, kind: TaxonomyKind) -> tuple[str, ...]:
        """Return the codes for one taxonomy kind in catalog order."""

        return tuple(entry.code for entry in self.entries if entry.kind == kind)

    def has(self, code: str) -> bool:
        """Return whether a code exists in the catalog."""

        return self.get(code) is not None
