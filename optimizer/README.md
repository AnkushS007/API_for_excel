# Optimizer

The optimizer consumes the existing AM4Tools route dataset and can now publish a separate official-API fleet snapshot after a successful profile sync.

## Inputs
- Route economics: `data/routes/am4tools_routes.csv` (AM4Tools-provided values; not recalculated here).
- Existing fleet snapshot: `data/fleet/fleet.csv`.
- Optional live fleet: `data/api/fleet_live.csv`, created by `py -m am4desk.sync`.

## Outputs
- `data/routes/ranked_routes.csv`: routes filtered to configured hubs and ranked by AM4Tools `contrib_pt` / `profit_pt`.
- `data/optimizer/live_state.json`: official API fleet and sync metadata, if available.

The official API profile returns route endpoints as airport names, whereas AM4Tools routes use IATA/ICAO fields. The integration intentionally does not guess airport mappings or blend those records into profitability calculations. A verified code mapping and aircraft-to-route assignment feed are needed before live API state can safely influence route-level recommendations.

Planned next outputs: aircraft purchase, route assignment, move/replace, hub expansion, cash reserve/reinvestment threshold, incremental daily profit and payback.
