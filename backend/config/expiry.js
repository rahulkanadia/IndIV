import { HOLIDAYS } from "./holidays.js"

const isHoliday = d =>
  HOLIDAYS.includes(d.toISOString().slice(0,10))

const isWeekend = d =>
  d.getDay() === 0 || d.getDay() === 6

export function resolveWeeklyExpiry(now) {
  let d = new Date(now)
  while (d.getDay() !== 2 || isHoliday(d)) {
    d.setDate(d.getDate() + 1)
  }

  if (
    now.getDay() === 2 &&
    (now.getHours() > 12 ||
     (now.getHours() === 12 && now.getMinutes() >= 30))
  ) {
    d.setDate(d.getDate() + 7)
  }

  return d
}

export function resolveMonthlyExpiry(now) {
  let d = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  while (isWeekend(d) || isHoliday(d)) {
    d.setDate(d.getDate() - 1)
  }
  return d
}