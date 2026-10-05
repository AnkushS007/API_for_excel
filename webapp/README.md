# AM4 Command Center — foundation

This is the first AM4Tools-style web application layer for the AM4 Rapid Growth Assistant.

## Current behavior
- No manual airline forms.
- Imports the existing extension diagnostic snapshot.
- Keeps the imported state in local browser storage.
- Dashboard, aircraft, route, circuit, price and data views.
- Never invents missing airline values.
- Read-only: it does not purchase, sell, create routes, change prices or otherwise act on the AM4 account.

## Next engineering steps
1. Replace raw JSON heuristics with a versioned AM4 payload normalizer.
2. Add the aircraft/airport master datasets and formulas.
3. Add route profitability and aircraft ranking.
4. Add circuit search.
5. Change the extension from diagnostic capture to a continuous normalized-state connector.
6. Let the extension push state directly to this app so the dashboard opens essentially instantly.