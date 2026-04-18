"""Refresh the checked-in prototype demo bundle from a generated ui_bundle.json file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def build_parser() -> argparse.ArgumentParser:
    repo_root = Path(__file__).resolve().parents[1]
    demo_dir = repo_root / "apps" / "ui-prototype" / "demo"

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "bundle_path",
        type=Path,
        help="Path to a generated ui_bundle.json file.",
    )
    parser.add_argument(
        "--demo-dir",
        type=Path,
        default=demo_dir,
        help="Target demo directory inside the prototype app.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    payload = json.loads(args.bundle_path.read_text(encoding="utf-8"))
    serialized = json.dumps(payload, indent=2, ensure_ascii=True)

    args.demo_dir.mkdir(parents=True, exist_ok=True)
    (args.demo_dir / "ui_bundle.json").write_text(serialized + "\n", encoding="utf-8")
    (args.demo_dir / "demo-bundle.js").write_text(
        f"window.__SEMISUPPLY_DEMO_BUNDLE__ = {serialized};\n",
        encoding="utf-8",
    )
    print(args.demo_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
