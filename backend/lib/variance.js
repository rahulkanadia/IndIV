export function straddleVariance(callPrice, putPrice, F, T) {
  // Uses Brenner-Subrahmanyam approximation
  if (T <= 0 || F <= 0) return 0

  // Formula: Sigma approx = (StraddlePrice / F) * sqrt(pi / (2 * T))
  // 1.2533 is approx sqrt(pi/2)
  const approxSigma = ((callPrice + putPrice) / (F * Math.sqrt(T))) * 1.2533

  return approxSigma * approxSigma
}
