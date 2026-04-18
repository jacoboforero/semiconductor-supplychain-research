"""Common helpers for P0 source adapters."""

from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from uuid import NAMESPACE_URL, UUID, uuid5

from semisupply.sources.models import JsonValue


US_STATE_CODES = {
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    "DC",
}

US_STATE_NAMES = {
    "ALABAMA",
    "ALASKA",
    "ARIZONA",
    "ARKANSAS",
    "CALIFORNIA",
    "COLORADO",
    "CONNECTICUT",
    "DELAWARE",
    "FLORIDA",
    "GEORGIA",
    "HAWAII",
    "IDAHO",
    "ILLINOIS",
    "INDIANA",
    "IOWA",
    "KANSAS",
    "KENTUCKY",
    "LOUISIANA",
    "MAINE",
    "MARYLAND",
    "MASSACHUSETTS",
    "MICHIGAN",
    "MINNESOTA",
    "MISSISSIPPI",
    "MISSOURI",
    "MONTANA",
    "NEBRASKA",
    "NEVADA",
    "NEW HAMPSHIRE",
    "NEW JERSEY",
    "NEW MEXICO",
    "NEW YORK",
    "NORTH CAROLINA",
    "NORTH DAKOTA",
    "OHIO",
    "OKLAHOMA",
    "OREGON",
    "PENNSYLVANIA",
    "RHODE ISLAND",
    "SOUTH CAROLINA",
    "SOUTH DAKOTA",
    "TENNESSEE",
    "TEXAS",
    "UTAH",
    "VERMONT",
    "VIRGINIA",
    "WASHINGTON",
    "WEST VIRGINIA",
    "WISCONSIN",
    "WYOMING",
    "DISTRICT OF COLUMBIA",
}


def stable_company_id(*, source_key: str, identifier_type: str, identifier_value: str) -> UUID:
    """Create a deterministic company identifier from a source-scoped external identifier."""

    return uuid5(NAMESPACE_URL, f"semisupply:{source_key}:{identifier_type}:{identifier_value}")


def stable_facility_id(*, source_key: str, identifier_type: str, identifier_value: str) -> UUID:
    """Create a deterministic facility identifier from a source-scoped external identifier."""

    return uuid5(NAMESPACE_URL, f"semisupply:facility:{source_key}:{identifier_type}:{identifier_value}")


def normalize_cik(value: str | int) -> str:
    """Normalize CIK values into zero-padded SEC form."""

    cik = str(value).strip()
    if not cik:
        raise ValueError("cik must not be blank")
    if not cik.isdigit():
        raise ValueError("cik must contain only digits")
    return cik.zfill(10)


def parse_json_payload(payload: bytes | str | JsonValue) -> JsonValue:
    """Parse bytes or text payloads into JSON-compatible Python objects."""

    if isinstance(payload, bytes):
        return json.loads(payload.decode("utf-8"))
    if isinstance(payload, str):
        return json.loads(payload)
    return payload


def canonical_payload_bytes(payload: bytes | str | JsonValue) -> bytes:
    """Convert a payload to stable bytes for hashing."""

    if isinstance(payload, bytes):
        return payload
    if isinstance(payload, str):
        return payload.encode("utf-8")
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def sha256_hex(payload: bytes | str | JsonValue) -> str:
    """Compute a SHA-256 hash for a captured payload."""

    return hashlib.sha256(canonical_payload_bytes(payload)).hexdigest()


def parse_iso_datetime(value: str | None) -> datetime | None:
    """Parse an ISO-like datetime string into an aware datetime."""

    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    normalized = cleaned.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        return parsed.replace(tzinfo=UTC)
    return parsed


def infer_country_code(*, code: str | None, description: str | None = None) -> str | None:
    """Infer a two-letter country code, mapping U.S. states to US."""

    normalized_code = code.strip().upper() if code is not None and code.strip() else None
    normalized_description = description.strip().upper() if description is not None and description.strip() else None

    if normalized_description in US_STATE_NAMES:
        return "US"
    if normalized_code in US_STATE_CODES:
        return "US"
    if normalized_code is not None and len(normalized_code) == 2 and normalized_code.isalpha():
        return normalized_code
    return None
