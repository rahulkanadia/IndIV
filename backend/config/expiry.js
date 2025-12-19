import { HOLIDAYS } from "./holidays.js"

// --- Helper: Date Math ---
const isHoliday = (d) => HOLIDAYS.includes(d.toISOString().slice(0, 10))
const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6

function addBusinessDays(date, days) {
  let d = new Date(date)
  let count = 0
  const step = days > 0 ? 1 : -1
  while (count !== days) {
    d.setDate(d.getDate() + step)
    if (!isWeekend(d) && !isHoliday(d)) {
      count += step
    }
  }
  return d
}

function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0)
}

function getNextDayOfWeek(date, dayIndex) {
  let d = new Date(date)
  // If already past 12:30 PM on the expiry day, move to next week
  if (d.getDay() === dayIndex && d.getHours() >= 13) {
      d.setDate(d.getDate() + 1)
  }
  
  while (d.getDay() !== dayIndex || isHoliday(d)) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

function getLastDayOfWeekInMonth(year, month, dayIndex) {
  let d = getLastDayOfMonth(year, month)
  while (d.getDay() !== dayIndex || isHoliday(d)) {
    d.setDate(d.getDate() - 1)
  }
  // Handle edge case: if "Last Thursday" falls in previous month due to holidays? 
  // Unlikely, but logic holds.
  return d
}

// --- Specific Resolvers ---

// 1. INDICES (Weekly/Monthly)
function resolveIndexExpiry(now, type) {
  const targetDay = type === "INDEX_THU" ? 4 : 2 // 4=Thu, 2=Tue
  
  // Weekly: Simply the next valid target day
  const weekly = getNextDayOfWeek(now, targetDay)
  
  // Monthly: Last target day of current month
  let monthly = getLastDayOfWeekInMonth(now.getFullYear(), now.getMonth(), targetDay)
  
  // If monthly is in the past, get next month's
  if (monthly < now) {
      monthly = getLastDayOfWeekInMonth(now.getFullYear(), now.getMonth() + 1, targetDay)
  }

  return { weekly, monthly }
}

// 2. COMMODITIES (Monthly Only)
// Logic approximates CSV 2 rules:
// Metals: Futures = Last calendar day, Options = ~4 biz days prior
// Energy: Futures = ~Last biz day, Options = ~2 biz days prior
function resolveCommodityExpiry(now, type) {
  // Strategy: Find the End of Current Month
  let eom = getLastDayOfMonth(now.getFullYear(), now.getMonth())
  
  // Adjust for Weekends/Holidays for Futures Expiry
  while (isWeekend(eom) || isHoliday(eom)) {
    eom.setDate(eom.getDate() - 1)
  }

  // If EOM is in past, move to Next Month
  if (eom < now) {
    eom = getLastDayOfMonth(now.getFullYear(), now.getMonth() + 1)
    while (isWeekend(eom) || isHoliday(eom)) {
      eom.setDate(eom.getDate() - 1)
    }
  }

  const futuresExp = new Date(eom)
  let optionsExp = new Date(eom)

  if (type === "MCX_ENERGY") {
     // Rule: Options expire ~2-3 biz days before Futures
     // (Matches Sample: Fut 26-Dec, Opt 23-Dec)
     optionsExp = addBusinessDays(futuresExp, -3) 
  } else if (type === "MCX_METAL") {
     // Rule: Options expire ~4-5 biz days before Futures
     // (Matches Sample: Fut 31-Dec, Opt 23-Dec)
     optionsExp = addBusinessDays(futuresExp, -5)
  } else {
     // Bullion/Default
     optionsExp = addBusinessDays(futuresExp, -3)
  }

  return { weekly: optionsExp, monthly: futuresExp } 
  // NOTE: For commodities, we treat 'weekly' slot as Options Expiry 
  // and 'monthly' slot as Futures Expiry for the API display.
}


// --- Main Export ---
export function resolveExpiry(assetConfig, now = new Date()) {
  if (assetConfig.type.startsWith("INDEX")) {
    return resolveIndexExpiry(now, assetConfig.type)
  } else {
    return resolveCommodityExpiry(now, assetConfig.type)
  }
}
