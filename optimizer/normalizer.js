import { makeState } from "./schema.js";

const number = value => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const n = Number(value.replace(/[$, ]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const first = (obj, keys) => {
  for (const key of keys) if (obj && obj[key] != null) return obj[key];
  return null;
};
const walk = (x, fn, depth = 0, seen = new Set()) => {
  if (x == null || depth > 10 || typeof x !== "object" || seen.has(x)) return;
  seen.add(x); fn(x);
  if (Array.isArray(x)) x.slice(0, 1000).forEach(v => walk(v, fn, depth + 1, seen));
  else Object.values(x).slice(0, 1000).forEach(v => walk(v, fn, depth + 1, seen));
};

function parseRecords(records = []) {
  const out = [];
  for (const record of records) {
    try { out.push({ ...record, payload: JSON.parse(record.body) }); } catch {}
  }
  return out;
}

// Conservative mapper: it only promotes objects when recognizable fields exist.
export function normalizeSnapshot(snapshot = {}) {
  const records = parseRecords(snapshot.records || []);
  const state = makeState({ capturedAt: new Date().toISOString(), evidence: { source: "extension snapshot" } });
  for (const r of records) state.evidence.categories[r.category] = (state.evidence.categories[r.category] || 0) + 1;

  for (const r of records) {
    walk(r.payload, obj => {
      if (Array.isArray(obj)) return;
      const keys = Object.keys(obj).map(k => k.toLowerCase());
      const cashRaw = first(obj, ["cash", "balance", "money", "funds"]);
      const cash = number(cashRaw);
      if (cash != null && /(cash|finance|company)/i.test(r.category || "")) state.airline.cash = Math.max(state.airline.cash ?? 0, cash);
      const aircraftName = first(obj, ["name", "model", "aircraftName", "aircraft_name"]);
      const capacity = number(first(obj, ["capacity", "seats", "pax", "passengers"]));
      const speed = number(first(obj, ["speed", "speedKmh", "speed_kmh"]));
      const range = number(first(obj, ["range", "rangeKm", "range_km"]));
      if (r.category === "fleet" && aircraftName && (capacity != null || speed != null || range != null)) {
        const item = { name: String(aircraftName), capacity, speedKmh: speed, rangeKm: range, raw: obj };
        if (!state.fleet.some(x => x.name === item.name && x.speedKmh === item.speedKmh)) state.fleet.push(item);
      }
      const origin = first(obj, ["origin", "from", "departure", "departureAirport"]);
      const destination = first(obj, ["destination", "to", "arrival", "arrivalAirport"]);
      const distanceKm = number(first(obj, ["distance", "distanceKm", "distance_km"]));
      if (r.category === "routes" && origin && destination && distanceKm != null) {
        const item = { origin: String(origin), destination: String(destination), distanceKm, demand: number(first(obj, ["demand", "remainingDemand"])), raw: obj };
        if (!state.routes.some(x => x.origin === item.origin && x.destination === item.destination && x.distanceKm === item.distanceKm)) state.routes.push(item);
      }
    });
  }
  return state;
}
