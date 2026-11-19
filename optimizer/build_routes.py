#!/usr/bin/env python3
"""Rank AM4Tools routes and publish a separate live-API fleet snapshot.

AM4Tools remains the source of route economics. Official API route names are
not joined to IATA-based AM4Tools rows without a verified airport mapping.
"""
from pathlib import Path
import csv
import json

ROOT = Path(__file__).resolve().parents[1]
CFG = json.loads((ROOT / "config" / "am4tools.json").read_text(encoding="utf-8"))
ROUTES = ROOT / CFG["route_source"]
OUT = ROOT / "data" / "routes" / "ranked_routes.csv"
LIVE_FLEET = ROOT / "data" / "api" / "fleet_live.csv"
LIVE_STATUS = ROOT / "data" / "api" / "sync_status.json"

with ROUTES.open(newline="", encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))

hubs = set(CFG["hubs"])
rows = [r for r in rows if r.get("orig.iata") in hubs]
rows.sort(key=lambda r: float(r.get("contrib_pt") or r.get("profit_pt") or 0), reverse=True)

OUT.parent.mkdir(parents=True, exist_ok=True)
fields = list(rows[0].keys()) if rows else []
with OUT.open("w", newline="", encoding="utf-8") as f:
    if fields:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

# Keep API-derived fleet state separate from route-economics ranking.
live_state = {"official_api_fleet_available": LIVE_FLEET.exists(),
              "official_api_sync_available": LIVE_STATUS.exists(),
              "api_fleet": []}
if LIVE_FLEET.exists():
    with LIVE_FLEET.open(newline="", encoding="utf-8-sig") as f:
        live_state["api_fleet"] = list(csv.DictReader(f))
if LIVE_STATUS.exists():
    live_state["api_sync"] = json.loads(LIVE_STATUS.read_text(encoding="utf-8"))
state_out = ROOT / "data" / "optimizer" / "live_state.json"
state_out.parent.mkdir(parents=True, exist_ok=True)
state_out.write_text(json.dumps(live_state, indent=2), encoding="utf-8")

print(f"Ranked AM4Tools routes: {len(rows)}")
print(f"Live official API fleet loaded: {len(live_state['api_fleet'])} aircraft types")
print(f"Output: {OUT}")
print(f"Live state: {state_out}")
