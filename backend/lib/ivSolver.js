import { bsPrice } from "./bs.js"

export function solveIV({ price, F, K, T, isCall }) {
  let low = 0.0001
  let high = 5.0

  for (let i = 0; i < 100; i++) {
    let mid = (low + high) / 2
    let model = bsPrice(F, K, T, mid, isCall)

    if (Math.abs(model - price) <= 0.05) return mid
    if (model > price) high = mid
    else low = mid
  }

  return null
}