// lib/symbols.js
// TradingView option symbol constructor
// NIFTY only (for now)
// Format: NIFTY YYMMDD C/P STRIKE
// Example: NIFTY251216C26000

function pad2(n) {
  return String(n).padStart(2, "0")
}

function formatExpiryYYMMDD(date) {
  let yy = String(date.getFullYear()).slice(-2)
  let mm = pad2(date.getMonth() + 1)
  let dd = pad2(date.getDate())
  return `${yy}${mm}${dd}`
}

// =======================================================
// Public API
// =======================================================

export function tvOptionSymbols(asset, expiry, strike) {
  if (asset !== "NIFTY") {
    throw `Option symbols not implemented for ${asset}`
  }

  if (!expiry || !strike) {
    throw "Missing expiry or strike"
  }

  let exp = formatExpiryYYMMDD(expiry)

  // IMPORTANT:
  // Strike must be used as-is (no rounding, no scaling)
  let strikeStr = String(strike)

  return {
    ce: `NIFTY${exp}C${strikeStr}`,
    pe: `NIFTY${exp}P${strikeStr}`
  }
}