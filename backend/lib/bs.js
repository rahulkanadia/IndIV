// Polyfill for Error Function (Abramowitz and Stegun)
function erf(x) {
  var m = 1.0,
    s = 1.0,
    sum = x * 1.0;
  for (var i = 1; i < 50; i++) {
    m *= i;
    s *= -1;
    sum += (s * Math.pow(x, 2 * i + 1)) / (m * (2 * i + 1));
  }
  return (2 / Math.sqrt(Math.PI)) * sum;
}

// Or a faster approximation for large inputs to avoid loops:
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

export function bsPrice(F, K, T, sigma, isCall) {
  const d1 =
    (Math.log(F / K) + 0.5 * sigma * sigma * T) /
    (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)

  return isCall
    ? F * N(d1) - K * N(d2)
    : K * N(-d2) - F * N(-d1)
}
