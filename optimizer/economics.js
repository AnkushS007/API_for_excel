// AM4 economics helpers based on the formulas documented in the project research.
// Inputs must already be normalized; missing evidence returns null rather than guessing.
export const AM4 = Object.freeze({
  boardingHours: 1,
  fuelUsdPerLb: 0.70,
  co2UsdPerQuota: 0.13,
  easySpeedMultiplier: 1.5,
  realismSpeedMultiplier: 1.0
});

export function flightLengthHours(distanceKm, speedKmh, mode = "easy") {
  if (![distanceKm, speedKmh].every(Number.isFinite) || distanceKm < 0 || speedKmh <= 0) return null;
  const multiplier = mode === "realism" ? AM4.realismSpeedMultiplier : AM4.easySpeedMultiplier;
  return ((distanceKm / (speedKmh * multiplier)) + AM4.boardingHours) * 2;
}

export function roundTripFuelCost({ distanceKm, fuelLbPerKm }) {
  if (![distanceKm, fuelLbPerKm].every(Number.isFinite)) return null;
  return distanceKm * 2 * fuelLbPerKm * AM4.fuelUsdPerLb;
}

export function co2Cost({ distanceKm, passengers, quotasPerPassengerKm }) {
  if (![distanceKm, passengers, quotasPerPassengerKm].every(Number.isFinite)) return null;
  return distanceKm * 2 * passengers * quotasPerPassengerKm * AM4.co2UsdPerQuota;
}

export function paybackDays(purchasePrice, incrementalDailyProfit) {
  if (!Number.isFinite(purchasePrice) || !Number.isFinite(incrementalDailyProfit) || incrementalDailyProfit <= 0) return null;
  return purchasePrice / incrementalDailyProfit;
}
