import { HOLIDAYS } from "../config/holidays.js"

export function tradingTimeToExpiry(now, expiry) {
  let hours = 0
  let d = new Date(now)

  while (d < expiry) {
    const iso = d.toISOString().slice(0,10)
    if (
      d.getDay() !== 0 &&
      d.getDay() !== 6 &&
      !HOLIDAYS.includes(iso)
    ) {
      hours += 6.25
    }
    d.setDate(d.getDate() + 1)
  }

  return hours / (252 * 6.25)
}