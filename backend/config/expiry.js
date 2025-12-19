import { NSE_HOLIDAYS } from "./holidays.js"

const CUTOFF_MINUTES = 13 * 60   // 13:00 IST

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

function adjustForHoliday(date) {
  let d = new Date(date)
  while (isWeekend(d) || isHoliday(d)) {
    d.setDate(d.getDate() - 1)
  }
  return d
}

// Last Tuesday of month (monthly)
function lastTuesday(year, month) {
  let d = new Date(year, month + 1, 0)
  while (d.getDay() !== 2) d.setDate(d.getDate() - 1)
  return adjustForHoliday(d)
}

// Next Tuesday (weekly)
function nextTuesday(from) {
  let d = new Date(from)
  let diff = (2 - d.getDay() + 7) % 7
  if (diff === 0) diff = 7
  d.setDate(d.getDate() + diff)
  return adjustForHoliday(d)
}

export function resolveExpiry(type, now = new Date()) {
  let expiry =
    type === "W"
      ? nextTuesday(now)
      : lastTuesday(now.getFullYear(), now.getMonth())

  let minutesNow = now.getHours() * 60 + now.getMinutes()

  if (toISO(now) === toISO(expiry) && minutesNow >= CUTOFF_MINUTES) {
    expiry =
      type === "W"
        ? adjustForHoliday(new Date(expiry.getTime() + 7 * 864e5))
        : lastTuesday(expiry.getFullYear(), expiry.getMonth() + 1)
  }

  return expiry
}