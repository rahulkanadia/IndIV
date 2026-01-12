import { HOLIDAYS } from "./holidays.js"

// --- 1. UTILITIES ---

const isHoliday = (d) => {
    const iso = d.toISOString().slice(0, 10);
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
    while (isHoliday(d)) { 
        d.setDate(d.getDate() - 1);
    }
    return d;
}

// --- 2. COMMODITY RULES ---

function getCommodityFuturesExpiry(now, type) {
    let targetMonth = now.getMonth();
    let targetYear = now.getFullYear();
    
    // Check if current month expiry is passed (Simplified > 25th check)
    if (now.getDate() > 25) {
        targetMonth++;
    }
    
    if (type === "MCX_GOLD") {
        let d = new Date(targetYear, targetMonth, 5);
        if (isHoliday(d)) d = addBusinessDays(d, 1); 
        return d;
    } 
    return getLastDayOfMonth(targetYear, targetMonth);
}

function getCommodityOptionExpiry(futuresDate, type) {
    switch (type) {
        case "MCX_CRUDE":
        case "MCX_NATGAS":
            return addBusinessDays(futuresDate, -2);
        case "MCX_GOLD":
        case "MCX_SILVER":
            return addBusinessDays(futuresDate, -4);
        case "MCX_BASE": 
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
        let d = new Date(now);
        for(let i=0; i<3; i++) {
            let futExp = getCommodityFuturesExpiry(d, assetConfig.type);
            let optExp = getCommodityOptionExpiry(futExp, assetConfig.type);
            if(optExp > now) expiries.push(optExp);
            d.setMonth(d.getMonth() + 1);
        }
        return {
            list: expiries,
            weekly: expiries[0], 
            monthly: expiries[0]
        };
    }

    // B. INDICES
    const MAPPING = { "INDEX_TUE": 2, "INDEX_THU": 4 };
    const targetDay = MAPPING[assetConfig.type] || 4;
    
    let nextExp = getNextWeekday(now, targetDay);

    for (let i = 0; i < count; i++) {
        expiries.push(new Date(nextExp));
        nextExp.setDate(nextExp.getDate() + 7);
        while(isHoliday(nextExp)) {
            nextExp.setDate(nextExp.getDate() - 1);
        }
    }

    // Identify Monthly (Last Target Day of Month)
    let monthlyExp = expiries.find(d => {
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
