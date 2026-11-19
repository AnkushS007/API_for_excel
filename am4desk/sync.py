import json
from datetime import datetime, timezone
from pathlib import Path
from .client import AM4Client
from .config import ROOT, load_config
from .normalize import normalize_profile, write_csv
from .secrets import get_api_key


def main():
    cfg = load_config()
    client = AM4Client(get_api_key())
    payload = client.profile(cfg["company"])
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    raw_dir = ROOT / "data" / "api" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    (raw_dir / f"profile_{stamp}.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    fleet, routes = normalize_profile(payload)
    write_csv(ROOT / "data" / "api" / "fleet_live.csv", fleet, ["aircraft", "amount"])
    write_csv(ROOT / "data" / "api" / "routes_live.csv", routes, ["dep", "stop", "arrival", "distance", "arrived"])
    user = payload.get("user") or {}
    summary = {
        "company_requested": cfg["company"], "company_returned": user.get("company"),
        "level": user.get("level"), "game_mode": user.get("game_mode"),
        "fleet_count": user.get("fleet"), "route_count": user.get("routes"),
        "fleet_rows": len(fleet), "route_rows": len(routes),
        "requests_remaining": (payload.get("status") or {}).get("requests_remaining"),
        "synced_at_utc": stamp
    }
    (ROOT / "data" / "api" / "sync_status.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))
    print("\nLive API data saved under data/api/. Existing AM4Tools optimizer inputs were not overwritten.")

if __name__ == "__main__":
    main()
