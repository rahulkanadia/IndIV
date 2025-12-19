function N(x) {
  return 0.5 * (1 + Math.erf(x / Math.SQRT2))
}

export function bsPrice(F, K, T, sigma, isCall) {
  const d1 =
    (Math.log(F / K) + 0.5 * sigma * sigma * T) /
    (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)

  return isCall
    ? F * N(d1) - K * N(d2)
    : K * N(-d2) - F * N(-d1)
}