import { paybackDays } from "./economics.js";

export function recommend(state, { reserveRatio = 0.20, maxPaybackDays = 90 } = {}) {
  const cash = state?.airline?.cash;
  if (!Number.isFinite(cash)) return { status: "insufficient-data", actions: [], reason: "Cash evidence is missing." };
  const reserve = cash * reserveRatio;
  const actions = [];
  for (const aircraft of state.fleet) {
    if (Number.isFinite(aircraft.purchasePrice) && Number.isFinite(aircraft.incrementalDailyProfit)) {
      const payback = paybackDays(aircraft.purchasePrice, aircraft.incrementalDailyProfit);
      if (payback != null && payback <= maxPaybackDays && cash - aircraft.purchasePrice >= reserve) {
        actions.push({ type: "aircraft-purchase", aircraft, paybackDays: payback, priority: 100 - payback });
      }
    }
  }
  actions.sort((a, b) => b.priority - a.priority);
  return {
    status: actions.length ? "ready" : "no-qualified-action",
    reserve,
    actions,
    reason: actions.length ? "Best evidenced aircraft investment is within the configured payback and reserve limits." : "No candidate currently has enough normalized economics evidence."
  };
}
