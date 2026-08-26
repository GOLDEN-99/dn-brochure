/**
 * Money helpers — every amount in Other Income is Thai baht, quantized to satang (2dp).
 *
 * Two distinct jobs:
 *
 * - `floorSatang` — for anything that acts as a **ceiling** the user must be able to type.
 *   Flooring keeps the quantized value at or below the raw one, so a number we render is
 *   always accepted by our own validators and by the server. Rounding half-up would not:
 *   a remaining of 0.257 renders as 0.26, and 0.26 > 0.257 gets rejected. (The one case
 *   where the result can sit a hair above the input is float noise being cleaned up —
 *   0.3 - 0.1 becomes 0.2 — which is the intended reading of that value anyway.)
 * - `roundSatang` — for values leaving the app (request payloads) and for plain totals,
 *   where nearest-satang is the honest answer.
 *
 * Both strip binary-float noise before quantizing, via a round-trip through `toFixed`.
 * That matters most for `floorSatang`: 0.3 - 0.1 is 0.19999999999999998, which a naive
 * floor would drop to 0.19 — losing a satang on every subtraction.
 */

const SATANG = 100

/** Scale to satang and discard float noise well below the satang, keeping the sign. */
const toSatang = (amount: number): number => Number((amount * SATANG).toFixed(6))

/** Quantize down to satang. Use for user-facing ceilings (remaining / open amounts). */
export function floorSatang(amount: number): number {
  return Math.floor(toSatang(amount)) / SATANG
}

/** Quantize to nearest satang. Use for request payloads and displayed totals. */
export function roundSatang(amount: number): number {
  return Math.round(toSatang(amount)) / SATANG
}
