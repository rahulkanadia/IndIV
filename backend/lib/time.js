import { NSE_HOLIDAYS } from "./holidays.js"
import { MARKETS } from "./markets.js"

function toISO(d) {
  return d.toISOString().slice(0, 10)
}

function isWeekend(d) {
  let day = d.getDay()
  return day === 0 || day === 6
}

function isHoliday(d) {
  return NSE_HOLIDAYS.includes(toISO(d))
}

function isTradingDay(d) {
  return !isWeekend(d) && !isHoliday(d)
}

// Remaining trading hours until expiry (CLAMPED)
export function tradingHoursToExpiry(now, expiry, marketKey) {
  const mkt = MARKETS[marketKey]
  if (!mkt) throw "Unknown market"

  let hours = 0
  let d = new Date(now)

  // ---------- Today ----------
  if (isTradingDay(d)) {
    let nowH = d.getHours() + d.getMinutes() / 60
    if (nowH < mkt.close) {
      hours += Math.max(
        0,
        mkt.close - Math.max(nowH, mkt.open)
      )
    }
  }

  // ---------- Full days between ----------
  d.setDate(d.getDate() + 1)
  d.setHours(0, 0, 0, 0)

  while (d < expiry) {
    if (isTradingDay(d)) {
      hours += mkt.hoursPerDay
    }
    d.setDate(d.getDate() + 1)
  }

  // ---------- SAFETY CLAMP ----------
  // Max ~1.5 months of trading time
  // Prevents runaway T → IV collapse
  const MAX_HOURS = 200

  return Math.min(
    Math.max(hours, mkt.hoursPerDay / 2),
    MAX_HOURS
  )
}