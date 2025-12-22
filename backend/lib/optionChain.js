export function buildOptionSymbols(prefix, expiry, atm, step, count) {
  // Format Date to YYMMDD (e.g., 2025-12-23 -> "251223")
  const yy = expiry.getFullYear().toString().slice(-2)
  const mm = (expiry.getMonth() + 1).toString().padStart(2, '0')
  const dd = expiry.getDate().toString().padStart(2, '0')
  const dateStr = `${yy}${mm}${dd}`

  const strikes = []
  
  // Generate ATM, then strikes above and below
  for (let i = -count; i <= count; i++) {
    strikes.push(atm + (i * step))
  }

  // Map to TradingView Symbols
  // Format: PREFIX + YYMMDD + C/P + STRIKE
  return strikes.map(k => ({
    strike: k,
    call: `${prefix}${dateStr}C${k}`,
    put: `${prefix}${dateStr}P${k}`
  }))
}
