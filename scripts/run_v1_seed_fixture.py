"""Run the current pipeline against the curated 200-company seed fixture."""

from __future__ import annotations

import argparse
from pathlib import Path

from semisupply.runs import P0PipelineRunner
from semisupply.sources.p0 import CuratedCompanySeedAdapter, EpaFacilityAdapter, KoreaPrtrFacilityAdapter


def build_parser() -> argparse.ArgumentParser:
    """Build the CLI parser for the larger seed-backed local run."""

    repo_root = Path(__file__).resolve().parents[1]
    default_fixture_dir = repo_root / "tests" / "fixtures" / "p0"

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--artifact-root",
        type=Path,
        default=repo_root / "artifacts",
        help="Root directory for local run outputs.",
    )
    parser.add_argument(
        "--company-fixture",
        type=Path,
        default=default_fixture_dir / "company_universe_seed.json",
        help="Path to the curated company seed JSON fixture.",
    )
    parser.add_argument(
        "--epa-fixture",
        type=Path,
        default=default_fixture_dir / "epa_facilities.json",
        help="Path to the EPA facility fixture.",
    )
    parser.add_argument(
        "--korea-prtr-fixture",
        type=Path,
        default=default_fixture_dir / "korea_prtr_facilities.json",
        help="Path to the Korea PRTR facility fixture.",
    )
    return parser


def main() -> int:
    """Execute the larger fixture-backed run and print the manifest path."""

    args = build_parser().parse_args()

    runner = P0PipelineRunner(
        adapters=(
            CuratedCompanySeedAdapter(
                payload_loader=lambda context: args.company_fixture.read_text(encoding="utf-8")
            ),
            EpaFacilityAdapter(
                payload_loader=lambda context: args.epa_fixture.read_text(encoding="utf-8")
            ),
            KoreaPrtrFacilityAdapter(
                payload_loader=lambda context: args.korea_prtr_fixture.read_text(encoding="utf-8")
            ),
        )
    )
    result = runner.run(artifact_root=args.artifact_root)
    print(result.manifest_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
