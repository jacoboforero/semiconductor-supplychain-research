"""Build the curated 200-company seed fixture used by larger local prototype runs."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
UNIVERSE_PATH = PROJECT_ROOT / "contracts" / "v1" / "company_universe.v1.json"
TAXONOMY_PATH = PROJECT_ROOT / "contracts" / "v1" / "company_taxonomy.v1.json"
DEFAULT_OUTPUT_PATH = PROJECT_ROOT / "tests" / "fixtures" / "p0" / "company_universe_seed.json"

COUNTRY_BY_SLUG = {
    "synopsys": "US",
    "cadence-design-systems": "US",
    "siemens-eda": "US",
    "arm-holdings": "GB",
    "rambus": "US",
    "ceva": "US",
    "imagination-technologies": "GB",
    "alphawave-ip-group": "GB",
    "verisilicon": "CN",
    "ememory-technology": "TW",
    "faraday-technology": "TW",
    "m31-technology": "TW",
    "empyrean-technology": "CN",
    "silvaco-group": "US",
    "arteris": "US",
    "apple": "US",
    "nvidia": "US",
    "amd": "US",
    "qualcomm": "US",
    "broadcom": "US",
    "mediatek": "TW",
    "marvell-technology": "US",
    "novatek-microelectronics": "TW",
    "realtek-semiconductor": "TW",
    "unisoc": "CN",
    "monolithic-power-systems": "US",
    "cirrus-logic": "US",
    "lattice-semiconductor": "US",
    "ambarella": "US",
    "silicon-motion": "TW",
    "phison-electronics": "TW",
    "himax-technologies": "TW",
    "focaltech-systems": "CN",
    "elan-microelectronics": "TW",
    "parade-technologies": "US",
    "espressif-systems": "CN",
    "maxlinear": "US",
    "credo-technology-group": "US",
    "astera-labs": "US",
    "raydium-semiconductor": "TW",
    "galaxycore": "CN",
    "goodix-technology": "CN",
    "gigadevice-semiconductor": "CN",
    "airoha-technology": "TW",
    "sanechips-technology": "CN",
    "intel": "US",
    "samsung-electronics": "KR",
    "sk-hynix": "KR",
    "micron-technology": "US",
    "texas-instruments": "US",
    "infineon-technologies": "DE",
    "stmicroelectronics": "CH",
    "nxp-semiconductors": "NL",
    "renesas-electronics": "JP",
    "onsemi": "US",
    "analog-devices": "US",
    "microchip-technology": "US",
    "rohm": "JP",
    "kioxia-holdings": "JP",
    "winbond-electronics": "TW",
    "nanya-technology": "TW",
    "macronix-international": "TW",
    "yangtze-memory-technologies": "CN",
    "changxin-memory-technologies": "CN",
    "vishay-intertechnology": "US",
    "diodes-incorporated": "US",
    "toshiba-electronic-devices-and-storage": "JP",
    "bosch": "DE",
    "mitsubishi-electric": "JP",
    "fuji-electric": "JP",
    "taiwan-semiconductor-manufacturing-company": "TW",
    "globalfoundries": "US",
    "united-microelectronics-corporation": "TW",
    "semiconductor-manufacturing-international-corporation": "CN",
    "hua-hong-semiconductor": "CN",
    "tower-semiconductor": "IL",
    "vanguard-international-semiconductor": "TW",
    "powerchip-semiconductor-manufacturing-corporation": "TW",
    "db-hitek": "KR",
    "x-fab-silicon-foundries": "LU",
    "nexchip-semiconductor": "CN",
    "silterra-malaysia": "MY",
    "win-semiconductors": "TW",
    "advanced-wireless-semiconductor-company": "TW",
    "sanan-semiconductor": "CN",
    "ase-technology-holding": "TW",
    "amkor-technology": "US",
    "jcet-group": "CN",
    "tongfu-microelectronics": "CN",
    "powertech-technology": "TW",
    "chipmos-technologies": "TW",
    "king-yuan-electronics": "TW",
    "huatian-technology": "CN",
    "unisem": "MY",
    "utac-holdings": "SG",
    "carsem": "MY",
    "nepes": "KR",
    "lingsen-precision-industries": "TW",
    "chipbond-technology": "TW",
    "formosa-advanced-technologies": "TW",
    "wuxi-chipown-micro-electronics": "CN",
    "walton-advanced-engineering": "TW",
    "hana-micron": "KR",
    "sfa-semicon": "KR",
    "lb-semicon": "KR",
    "asml": "NL",
    "applied-materials": "US",
    "lam-research": "US",
    "kla": "US",
    "tokyo-electron": "JP",
    "screen-holdings": "JP",
    "asm-international": "NL",
    "asmpt": "HK",
    "hitachi-high-tech": "JP",
    "disco": "JP",
    "canon": "JP",
    "nikon": "JP",
    "veeco-instruments": "US",
    "onto-innovation": "US",
    "kulicke-and-soffa-industries": "SG",
    "be-semiconductor-industries": "NL",
    "nordson": "US",
    "acm-research": "US",
    "naura-technology-group": "CN",
    "advanced-micro-fabrication-equipment-china": "CN",
    "piotech": "CN",
    "tokyo-seimitsu": "JP",
    "shibaura-mechatronics": "JP",
    "eugene-technology": "KR",
    "jusung-engineering": "KR",
    "wonik-ips": "KR",
    "semes": "KR",
    "suss-microtec": "DE",
    "ev-group": "AT",
    "kokusai-electric": "JP",
    "ulvac": "JP",
    "mks-instruments": "US",
    "ultra-clean-holdings": "US",
    "ichor-holdings": "US",
    "vat-group": "CH",
    "shin-etsu-chemical": "JP",
    "sumco": "JP",
    "globalwafers": "TW",
    "siltronic": "DE",
    "soitec": "FR",
    "sk-siltron": "KR",
    "wafer-works": "TW",
    "resonac-holdings": "JP",
    "jsr": "JP",
    "tokyo-ohka-kogyo": "JP",
    "merck-kgaa": "DE",
    "entegris": "US",
    "dupont": "US",
    "air-liquide": "FR",
    "linde": "IE",
    "taiyo-nippon-sanso": "JP",
    "fujifilm-holdings": "JP",
    "mitsubishi-gas-chemical": "JP",
    "ube-corporation": "JP",
    "kanto-chemical": "JP",
    "soulbrain": "KR",
    "dongjin-semichem": "KR",
    "sk-materials": "KR",
    "up-chemical": "KR",
    "dongwoo-fine-chem": "KR",
    "hansol-chemical": "KR",
    "oci-holdings": "KR",
    "mitsui-chemicals": "JP",
    "adeka": "JP",
    "tokuyama-corporation": "JP",
    "air-products-and-chemicals": "US",
    "stella-chemifa": "JP",
    "fujimi-incorporated": "JP",
    "ferrotec-holdings": "JP",
    "mitsubishi-chemical-group": "JP",
    "advantest": "JP",
    "teradyne": "US",
    "formfactor": "US",
    "cohu": "US",
    "aehr-test-systems": "US",
    "nova-ltd": "IL",
    "camtek": "IL",
    "lasertec": "JP",
    "toppan": "JP",
    "dai-nippon-printing": "JP",
    "hoya": "JP",
    "photronics": "US",
    "taiwan-mask-corporation": "TW",
    "sk-electronics": "JP",
    "ibiden": "JP",
    "shinko-electric-industries": "JP",
    "unimicron-technology": "TW",
    "nan-ya-printed-circuit-board": "TW",
    "kinsus-interconnect-technology": "TW",
    "at-and-s": "AT",
    "ttm-technologies": "US",
    "compeq-manufacturing": "TW",
    "simmtech": "KR",
    "daeduck-electronics": "KR",
    "samsung-electro-mechanics": "KR",
}


def load_json(path: Path) -> dict[str, object]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"expected JSON object at {path}")
    return payload


def build_payload() -> dict[str, object]:
    universe_payload = load_json(UNIVERSE_PATH)
    taxonomy_payload = load_json(TAXONOMY_PATH)

    raw_companies = universe_payload.get("companies")
    if not isinstance(raw_companies, list):
        raise ValueError("company universe contract must include a companies list")

    raw_overrides = taxonomy_payload.get("company_overrides", [])
    if not isinstance(raw_overrides, list):
        raise ValueError("company taxonomy contract must include a company_overrides list")

    aliases_by_slug = {
        override["company_slug"]: tuple(alias for alias in override.get("match_names", []) if isinstance(alias, str))
        for override in raw_overrides
        if isinstance(override, dict) and isinstance(override.get("company_slug"), str)
    }

    slugs = []
    records = []
    for company in raw_companies:
        if not isinstance(company, dict):
            raise ValueError("company universe entries must be objects")
        slug = str(company["company_slug"])
        slugs.append(slug)
        if slug not in COUNTRY_BY_SLUG:
            raise ValueError(f"missing country code for {slug}")

        display_name = str(company["display_name"])
        source_names = aliases_by_slug.get(slug, ())
        if source_names:
            name = source_names[0]
            aliases = [display_name, *source_names[1:]]
        else:
            name = display_name
            aliases = []

        deduped_aliases: list[str] = []
        seen_aliases: set[str] = {name.casefold()}
        for alias in aliases:
            normalized = alias.casefold()
            if normalized in seen_aliases:
                continue
            seen_aliases.add(normalized)
            deduped_aliases.append(alias)
        records.append(
            {
                "company_slug": slug,
                "name": name,
                "country_code": COUNTRY_BY_SLUG[slug],
                "primary_bucket": str(company["primary_bucket"]),
                "aliases": deduped_aliases,
            }
        )

    extra_country_slugs = sorted(set(COUNTRY_BY_SLUG) - set(slugs))
    if extra_country_slugs:
        raise ValueError(f"country map contains unknown slugs: {extra_country_slugs}")

    return {
        "contract_version": "v1",
        "created_at": "2026-04-17",
        "source_key": "curated_seed",
        "data": records,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_PATH,
        help="Where to write the generated seed fixture JSON.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    payload = build_payload()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
