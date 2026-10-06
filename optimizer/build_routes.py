#!/usr/bin/env python3
"""Build AM4 optimizer inputs from an AM4Tools route CSV and fleet snapshot.

This intentionally does not reimplement AM4 economics. It preserves the
AM4Tools-produced cfg/trips/cost/profit fields and filters/ranks them against
the user's configured hubs and fleet.
"""

from pathlib import Path
import csv, json

ROOT = Path(__file__).resolve().parents[1]
CFG = json.loads((ROOT / "config" / "am4tools.json").read_text())
ROUTES = ROOT / CFG["route_source"]
FLEET = ROOT / CFG["fleet_source"]
OUT = ROOT / "data" / "routes" / "ranked_routes.csv"

with ROUTES.open(newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

hubs = set(CFG["hubs"])
rows = [r for r in rows if r.get("orig.iata") in hubs]
rows.sort(key=lambda r: float(r.get("contrib_pt") or r.get("profit_pt") or 0), reverse=True)

OUT.parent.mkdir(parents=True, exist_ok=True)
fields = list(rows[0].keys()) if rows else []
with OUT.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(rows)

print(f"Input routes: {len(rows)}")
print(f"Output: {OUT}")
