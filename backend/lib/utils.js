import { HOLIDAYS } from "../config/holidays.js"

export function tradingTimeToExpiry(now, expiry) {
  let totalHours = 0
  let d = new Date(now)

  while (d < expiry) {
    let iso = d.toISOString().slice(0,10)
    if (d.getDay() !== 0 && d.getDay() !== 6 && !HOLIDAYS.includes(iso)) {
      totalHours += 6.25
    }
    d.setDate(d.getDate() + 1)
  }

  return totalHours / (252 * 6.25)
}