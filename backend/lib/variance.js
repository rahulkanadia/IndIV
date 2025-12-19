export function straddleVariance(callPrice, putPrice, F, T) {
  return (callPrice + putPrice) / (F * F * T)
}