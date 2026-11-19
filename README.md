# AM4 Rapid Growth Assistant

Read-only Windows integration and optimizer for Airline Manager 4 (AM4).

## Principles
- User logs into AM4 normally; this integration uses the official AM4 Developer API.
- API credentials stay on the user's Windows machine in Windows Credential Manager (via Python keyring).
- No automated purchases, sales, route creation, price changes, dispatch, or other game-changing actions.
- Official API profile data is stored locally under `data/api/` and excluded from Git.
- Existing AM4Tools route economics remain the source for route profitability rankings.

## Official API setup (Windows)
1. Install Python 3.10 or newer from python.org and select **Add Python to PATH**.
2. Open PowerShell in the repository folder.
3. Create a virtual environment and install dependencies:
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   py -m pip install -r requirements.txt
   ```
4. Copy `config/api.example.json` to `config/api.json`. The company is prefilled as `A7 Airlines`; confirm the exact in-game company name.
5. Request your personal API key from `am4@xombat.dk`. The official API documentation states a limit of 500 requests per 24 hours and requires checking `status.request == "success"`.
6. Store the key privately (the input is hidden):
   ```powershell
   py -m am4desk.set_api_key
   ```
7. Sync your profile:
   ```powershell
   py -m am4desk.sync
   ```
8. Run the existing AM4Tools route ranking:
   ```powershell
   py optimizer/build_routes.py
   ```

## Data flow
- Official API: `data/api/raw/profile_*.json`, `fleet_live.csv`, `routes_live.csv`, and `sync_status.json`.
- Existing optimizer inputs: `data/routes/am4tools_routes.csv`, `data/fleet/fleet.csv`, and `config/am4tools.json`.
- Ranked route output: `data/routes/ranked_routes.csv`.
- API route records use airport names, while the AM4Tools CSV uses IATA/ICAO fields. They are deliberately kept separate until a verified airport-code mapping is available; do not join them by guessed names.

## Current integration boundary
The official profile API provides company profile, aircraft counts and route records. The published docs also describe demand and route-research queries. The API key is personal and must not be committed. The public documentation does not document game-control write endpoints, so this project remains read-only.

## Tests
```powershell
py -m unittest discover -s tests -v
```
