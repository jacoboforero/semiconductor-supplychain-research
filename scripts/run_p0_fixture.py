"""Run the current P0 pipeline slice against checked-in fixtures."""

from __future__ import annotations

import argparse
from pathlib import Path

from semisupply.runs import P0PipelineRunner
from semisupply.sources.p0 import EdgarIssuerAdapter, GleifCompanyAdapter


def build_parser() -> argparse.ArgumentParser:
    """Build the CLI parser for fixture-backed local runs."""

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
        "--gleif-fixture",
        type=Path,
        default=default_fixture_dir / "gleif_company.json",
        help="Path to the GLEIF JSON fixture.",
    )
    parser.add_argument(
        "--edgar-fixture",
        type=Path,
        default=default_fixture_dir / "edgar_company.json",
        help="Path to the EDGAR JSON fixture.",
    )
    return parser


def main() -> int:
    """Execute the fixture-backed P0 run and print the manifest path."""

    args = build_parser().parse_args()

    runner = P0PipelineRunner(
        adapters=(
            GleifCompanyAdapter(payload_loader=lambda context: args.gleif_fixture.read_text(encoding="utf-8")),
            EdgarIssuerAdapter(payload_loader=lambda context: args.edgar_fixture.read_text(encoding="utf-8")),
        )
    )
    result = runner.run(artifact_root=args.artifact_root)
    print(result.manifest_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
