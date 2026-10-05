# AM4 Command Center local connector

This is intentionally a local-only authenticated connector. It does not require a Chrome extension.

## Run

1. Install Node.js 20+.
2. From this directory: `npm install`
3. Install Playwright Chromium: `npx playwright install chromium`
4. Run: `npm start`
5. Open http://localhost:3000

Credentials are submitted to the local process and discarded immediately after authentication. They are not written to the repository, localStorage, or the optimizer state.

The connector is read-only: it retrieves the authenticated AM4 page state and does not buy, sell, create routes, or otherwise mutate the game.
