function erf_approx(x) {
  var sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  var a1 = 0.254829592;
  var a2 = -0.284496736;
  var a3 = 1.421413741;
  var a4 = -1.453152027;
  var a5 = 1.061405429;
  var p = 0.3275911;

  var t = 1.0 / (1.0 + p * x);
  var y =
    1.0 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}

function N(x) {
  return 0.5 * (1 + erf_approx(x / Math.SQRT2))
}

export function greeks(F, K, T, sigma, isCall) {
  const d1 =
    (Math.log(F / K) + 0.5 * sigma * sigma * T) /
    (sigma * Math.sqrt(T))
  const nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI)

  return {
    delta: isCall ? N(d1) : N(d1) - 1,
    gamma: nd1 / (F * sigma * Math.sqrt(T)),
    vega: F * nd1 * Math.sqrt(T), // Returns Vega as a raw value
    theta: -0.5 * F * nd1 * sigma / Math.sqrt(T)
  }
}