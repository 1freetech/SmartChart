"""Keep SmartChart's single-file offline catalog in sync with atlas/catalog.json.

Run: python scripts/sync_catalog.py
CI:  python scripts/sync_catalog.py --check
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "atlas" / "catalog.json"
PROGRAM = ROOT / "desktop" / "smartchart.py"
BEGIN = "# BEGIN GENERATED EMBEDDED ATLAS (regenerate: python scripts/sync_catalog.py)"
END = "# END GENERATED EMBEDDED ATLAS"


def generated_block():
    original = SOURCE.read_text(encoding="utf-8")
    catalog = json.loads(original)
    charts = catalog.get("charts", [])
    if len(charts) != 40 or len({chart["id"] for chart in charts}) != 40:
        raise ValueError("Source atlas must have 40 unique chart types")
    return (BEGIN + "\n"
            + "# Full source-grounded atlas included so a copied smartchart.py runs offline.\n"
            + "EMBEDDED_CATALOG_JSON = " + repr(original) + "\n"
            + END)


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--check", action="store_true", help="Fail if embedded atlas differs from JSON")
    args = cli.parse_args()
    source = PROGRAM.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(BEGIN) + r"[\s\S]*?" + re.escape(END))
    matches = list(pattern.finditer(source))
    if len(matches) != 1:
        raise ValueError("Could not uniquely find embedded catalog region")
    generated = generated_block()
    current = matches[0].group()
    # Compare parsed JSON so an existing differently quoted Python literal is valid.
    import ast
    old_assignment = next(line for line in current.splitlines()
                          if line.startswith("EMBEDDED_CATALOG_JSON = "))
    old = ast.literal_eval(old_assignment.split(" = ", 1)[1])
    expected = SOURCE.read_text(encoding="utf-8")
    if args.check:
        if json.loads(old) != json.loads(expected):
            raise SystemExit("Embedded atlas is outdated: run python scripts/sync_catalog.py")
        print("Embedded 40-chart atlas is synchronized.")
    else:
        PROGRAM.write_text(source[:matches[0].start()] + generated
                           + source[matches[0].end():], encoding="utf-8")
        print("Regenerated complete embedded chart atlas.")


if __name__ == "__main__":
    main()
