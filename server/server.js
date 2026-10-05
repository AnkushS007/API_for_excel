import express from "express";
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../webapp")));

let browser = null;
let context = null;
let page = null;
let credentials = null;

const wait = ms => new Promise(r => setTimeout(r, ms));

async function ensureBrowser() {
  if (browser) return;
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
}

async function login(email, password) {
  await ensureBrowser();
  credentials = null;
  await page.goto("https://www.airlinemanager.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  // AM4 has historically exposed these login controls; selectors remain fallback-based.
  const emailInput = page.locator("#lEmail").first();
  const passwordInput = page.locator("#lPass").first();
  if (await emailInput.count() && await passwordInput.count()) {
    await emailInput.fill(email);
    await passwordInput.fill(password);
    const loginButton = page.locator("#btnLogin").first();
    if (await loginButton.count()) await loginButton.click();
    else await passwordInput.press("Enter");
  } else {
    throw new Error("AM4 login form was not found. The game UI may have changed.");
  }

  await page.waitForTimeout(2500);
  const body = await page.locator("body").innerText().catch(() => "");
  const authenticated = /company|fleet|finance|maintenance|fuel/i.test(body);
  if (!authenticated) throw new Error("AM4 login could not be verified.");

  // Credentials are deliberately discarded after authentication.
  credentials = null;
  return collectState();
}

async function collectState() {
  if (!page) throw new Error("Not connected.");
  const result = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    text: document.body?.innerText || "",
    htmlLength: document.documentElement?.outerHTML?.length || 0
  }));
  return { capturedAt: new Date().toISOString(), ...result };
}

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
    const state = await login(String(email), String(password));
    res.json({ ok: true, state });
  } catch (error) {
    credentials = null;
    res.status(401).json({ ok: false, error: error.message });
  }
});

app.get("/api/state", async (_req, res) => {
  try {
    res.json({ ok: true, state: await collectState() });
  } catch (error) {
    res.status(401).json({ ok: false, error: error.message });
  }
});

app.post("/api/logout", async (_req, res) => {
  try {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  } finally {
    browser = context = page = credentials = null;
  }
  res.json({ ok: true });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "../webapp/index.html")));
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log("AM4 Command Center: http://localhost:" + port));
