import { HOLIDAYS } from "./holidays.js"

// --- Helper: Date Math ---
const isHoliday = (d) => HOLIDAYS.includes(d.toISOString().slice(0, 10))
const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6

function getNextThursday(date) {
    let d = new Date(date)
    // If today is Thursday and past 3:30 PM (approx), move to next
    if (d.getDay() === 4 && d.getHours() >= 15 && d.getMinutes() >= 30) {
        d.setDate(d.getDate() + 1);
    }
    while (d.getDay() !== 4 || isHoliday(d)) {
        d.setDate(d.getDate() + 1)
    }
    return d
}

function getLastThursdayOfMonth(year, month) {
    let d = new Date(year, month + 1, 0) // Last day of month
    while (d.getDay() !== 4 || isHoliday(d)) {
        d.setDate(d.getDate() - 1)
    }
    // If it falls in previous month (rare holiday case), handle if needed
    return d
}

// --- Main Resolver ---
export function resolveExpiries(assetConfig, count = 6) {
    // For Indices (NIFTY/BANKNIFTY), we usually want the next 'count' Thursdays
    // This is a simplified logic focusing on weekly Thursdays for Term Structure
    
    const now = new Date();
    const expiries = [];
    let d = new Date(now);

    // 1. Find next valid expiry (Weekly)
    let nextExp = getNextThursday(d);
    
    // 2. Generate Sequence
    for (let i = 0; i < count; i++) {
        expiries.push(new Date(nextExp));
        nextExp.setDate(nextExp.getDate() + 7);
        
        // Adjust for holidays for the new date
        while(isHoliday(nextExp)) {
             nextExp.setDate(nextExp.getDate() - 1); // Usually moves to Wed
        }
    }

    // 3. Identify "Monthly" (Last Thursday of current or next month)
    // This helps classify the "Monthly" tab in UI
    const currentMonth = now.getMonth();
    let monthlyExp = getLastThursdayOfMonth(now.getFullYear(), currentMonth);
    
    // If monthly is passed, get next month
    if (monthlyExp < now) {
        monthlyExp = getLastThursdayOfMonth(now.getFullYear(), currentMonth + 1);
    }

    return {
        list: expiries,     // [Date, Date, Date...] for Term Structure
        weekly: expiries[0], // The immediate next expiry
        monthly: monthlyExp  // The immediate next monthly expiry
    };
}
