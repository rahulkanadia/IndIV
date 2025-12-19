import { bsPrice } from "./bs.js"

export function solveIV({ price, F, K, T, isCall }) {
  let lo = 0.0001
  let hi = 5.0

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const model = bsPrice(F, K, T, mid, isCall)

    if (Math.abs(model - price) <= 0.05) return mid
    model > price ? hi = mid : lo = mid
  }
  return null
}