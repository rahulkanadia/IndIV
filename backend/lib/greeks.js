function N(x) {
  return 0.5 * (1 + Math.erf(x / Math.SQRT2))
}

export function greeks(F, K, T, sigma, isCall) {
  const d1 =
    (Math.log(F / K) + 0.5 * sigma * sigma * T) /
    (sigma * Math.sqrt(T))
  const nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI)

  return {
    delta: isCall ? N(d1) : N(d1) - 1,
    gamma: nd1 / (F * sigma * Math.sqrt(T)),
    vega: F * nd1 * Math.sqrt(T),
    theta: -0.5 * F * nd1 * sigma / Math.sqrt(T)
  }
}