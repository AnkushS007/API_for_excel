// Normalized AM4 state contract. No values are invented here.
export const EMPTY_AIRLINE_STATE = Object.freeze({
  schemaVersion: 1,
  capturedAt: null,
  airline: { name: null, cash: null },
  fleet: [],
  routes: [],
  hubs: [],
  resources: { fuelPrice: null, co2Price: null },
  evidence: { categories: {}, source: "" }
});

export function makeState(partial = {}) {
  return {
    ...EMPTY_AIRLINE_STATE,
    ...partial,
    airline: { ...EMPTY_AIRLINE_STATE.airline, ...(partial.airline || {}) },
    resources: { ...EMPTY_AIRLINE_STATE.resources, ...(partial.resources || {}) },
    evidence: { ...EMPTY_AIRLINE_STATE.evidence, ...(partial.evidence || {}) },
    fleet: Array.isArray(partial.fleet) ? partial.fleet : [],
    routes: Array.isArray(partial.routes) ? partial.routes : [],
    hubs: Array.isArray(partial.hubs) ? partial.hubs : []
  };
}
