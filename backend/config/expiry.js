import { HOLIDAYS } from "./holidays.js"

// --- 1. UTILITIES ---

const isHoliday = (d) => {
    const iso = d.toISOString().slice(0, 10);
    // Basic check + Weekends
    return HOLIDAYS.includes(iso) || d.getDay() === 0 || d.getDay() === 6;
};

// Add/Subtract Business Days
function addBusinessDays(date, days) {
    let d = new Date(date);
    let count = 0;
    const step = days > 0 ? 1 : -1;
    while (count !== days) {
        d.setDate(d.getDate() + step);
        if (!isHoliday(d)) {
            count += step;
        }
    }
    return d;
}

// Find specific weekday (0=Sun, 1=Mon, ..., 6=Sat)
function getNextWeekday(date, dayIndex) {
    let d = new Date(date);
    // If today is the day and it's late (4 PM), skip to next week
    if (d.getDay() === dayIndex && d.getHours() >= 16) {
        d.setDate(d.getDate() + 1);
    }
    while (d.getDay() !== dayIndex || isHoliday(d)) {
        d.setDate(d.getDate() + 1);
    }
    return d;
}

function getLastDayOfMonth(year, month) {
    let d = new Date(year, month + 1, 0); // Last calendar day
    while (isHoliday(d)) { // Move back if weekend/holiday
        d.setDate(d.getDate() - 1);
    }
    return d;
}

// --- 2. COMMODITY RULES ---

// Helper: Get Futures Expiry based on type
function getCommodityFuturesExpiry(now, type) {
    // Default: Last Business Day of Month (Base Metals, Energy, etc.)
    // Exception: GOLD (5th of month)
    
    let targetMonth = now.getMonth();
    let targetYear = now.getFullYear();
    
    // Check if current month expiry is passed
    // (Simplified: if today > 25th, look at next month for safety)
    if (now.getDate() > 25) {
        targetMonth++;
    }
    
    if (type === "MCX_GOLD") {
        // Rule: 5th day of contract expiry month
        // (If 5th is holiday, previous day? Usually rules vary, assuming simple business day logic)
        let d = new Date(targetYear, targetMonth, 5);
        if (isHoliday(d)) d = addBusinessDays(d, 1); // Move forward or back? Usually forward for fixed dates
        return d;
    } 
    
    // Default: Last Calendar Day (Adjusted for holiday)
    return getLastDayOfMonth(targetYear, targetMonth);
}

// Helper: Get Option Expiry relative to Futures
function getCommodityOptionExpiry(futuresDate, type) {
    // Based on your Sample Data differences
    switch (type) {
        case "MCX_CRUDE":
        case "MCX_NATGAS":
            // Rule: ~2 business days prior
            return addBusinessDays(futuresDate, -2);
            
        case "MCX_GOLD":
        case "MCX_SILVER":
            // Rule: 3 biz days prior to tender (Tender ~5 days before Fut) -> Approx -5 to -8 days
            // Sample: Fut 05-Jan, Opt 31-Dec (~3 biz days gap)
            return addBusinessDays(futuresDate, -4);
            
        case "MCX_BASE": // Copper, Zinc
            // Sample: Fut 31-Dec, Opt 23-Dec (~6 biz days gap)
            return addBusinessDays(futuresDate, -6);
            
        default:
            return addBusinessDays(futuresDate, -3);
    }
}


// --- 3. MAIN RESOLVER ---

export function resolveExpiries(assetConfig, count = 6) {
    const now = new Date();
    const expiries = [];
    
    // A. COMMODITIES
    if (assetConfig.type.startsWith("MCX")) {
        // Commodities usually only have Monthly contracts liquid
        // We will return the next 3 months
        let d = new Date(now);
        for(let i=0; i<3; i++) {
            // Calculate Fut Expiry for Month i
            // (Rough approximation for simulation)
            let futExp = getCommodityFuturesExpiry(d, assetConfig.type);
            let optExp = getCommodityOptionExpiry(futExp, assetConfig.type);
            
            // If calculated date is in past, skip
            if(optExp > now) expiries.push(optExp);
            
            // Move to next month
            d.setMonth(d.getMonth() + 1);
        }
        
        return {
            list: expiries,
            weekly: expiries[0], // Commodities don't strictly have "weekly", treat nearest as main
            monthly: expiries[0]
        };
    }

    // B. INDICES (NSE=Tue, BSE=Thu)
    const MAPPING = { "INDEX_TUE": 2, "INDEX_THU": 4 };
    const targetDay = MAPPING[assetConfig.type] || 4;
    
    let nextExp = getNextWeekday(now, targetDay);

    for (let i = 0; i < count; i++) {
        expiries.push(new Date(nextExp));
        
        // Move to next week
        nextExp.setDate(nextExp.getDate() + 7);
        // Adjust for holidays (e.g., if Tue is holiday, move to Mon/Wed)
        // NSE/BSE rule: usually PREVIOUS business day
        while(isHoliday(nextExp)) {
            nextExp.setDate(nextExp.getDate() - 1);
        }
    }

    // Identify Monthly (Last Target Day of Month)
    // We just find the one in the list that is near end of month
    let monthlyExp = expiries.find(d => {
        // Simple check: is next week a different month?
        const nextWk = new Date(d);
        nextWk.setDate(d.getDate() + 7);
        return nextWk.getMonth() !== d.getMonth();
    });

    if(!monthlyExp) monthlyExp = expiries[expiries.length-1];

    return {
        list: expiries,
        weekly: expiries[0],
        monthly: monthlyExp
    };
}
