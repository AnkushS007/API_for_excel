import csv
from pathlib import Path


def write_csv(path, rows, fields):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def normalize_profile(payload):
    fleet = payload.get("fleet") or []
    routes = payload.get("routes") or []
    fleet_rows = []
    for item in fleet:
        if isinstance(item, dict) and item.get("aircraft"):
            fleet_rows.append({"aircraft": str(item["aircraft"]), "amount": int(item.get("amount") or 0)})
    route_rows = []
    for item in routes:
        if isinstance(item, dict):
            route_rows.append({
                "dep": item.get("dep", ""), "stop": item.get("stop") or "",
                "arrival": item.get("arrival", ""), "distance": item.get("distance", ""),
                "arrived": item.get("arrived", "")
            })
    return fleet_rows, route_rows
