export function straddleVariance(callPrice, putPrice, F, T) {
  // Correction: Use Brenner-Subrahmanyam approximation logic
  // Returns Variance (sigma^2)
  
  if (T <= 0 || F <= 0) return 0

  // Approx Sigma = (StraddlePrice / F) * sqrt(pi / (2 * T))
  // We use 1.2533 as approx for sqrt(pi/2)
  const approxSigma = ((callPrice + putPrice) / (F * Math.sqrt(T))) * 1.2533

  return approxSigma * approxSigma
}
