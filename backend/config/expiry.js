import { HOLIDAYS } from "./holidays.js"

function isHoliday(d) {
  return HOLIDAYS.includes(d.toISOString().slice(0,10))
}

function isWeekend(d) {
  return d.getDay() === 0 || d.getDay() === 6
}

export function nextTuesday(from) {
  let d = new Date(from)
  while (d.getDay() !== 2 || isHoliday(d)) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

export function resolveWeeklyExpiry(now) {
  let expiry = nextTuesday(now)
  if (
    now.getDay() === 2 &&
    (now.getHours() > 12 || (now.getHours() === 12 && now.getMinutes() >= 30))
  ) {
    expiry = nextTuesday(new Date(now.getTime() + 86400000))
  }
  return expiry
}

export function resolveMonthlyExpiry(now) {
  let d = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  while (isWeekend(d) || isHoliday(d)) d.setDate(d.getDate() - 1)
  return d
}