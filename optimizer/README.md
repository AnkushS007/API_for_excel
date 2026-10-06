# AM4 Optimizer

CSV-driven route and fleet optimization layer for Airline Manager 4.

The optimizer consumes AM4Tools exports and produces advisory recommendations for route selection, seat configuration, aircraft matching, fleet replacement, and expansion.

Source cfg.y, cfg.j, and cfg.f values are preserved when recommendations are based directly on the CSV. Aircraft-aware calculations will be aligned with the abc8747/am4 reference implementation.

No AM4 credentials or automated game-changing actions are used.
