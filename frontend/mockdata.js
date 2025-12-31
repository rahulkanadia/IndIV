// =========================================
// 1. HELPER FUNCTIONS (Generators)
// =========================================

// Generate 9:15 to 15:30 Time Array
function generateTimeArray() {
    const times = [];
    let h = 9, m = 15;
    while (h < 15 || (h === 15 && m <= 30)) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
        m += 15;
        if (m === 60) { m = 0; h++; }
    }
    return times;
}

// Generate Random Walk Data for Charts
function generatePath(start, steps, volatility) {
    const path = [start];
    for (let i = 1; i < steps; i++) {
        const change = (Math.random() - 0.5) * volatility;
        path.push(path[i - 1] + change);
    }
    return path;
}

// ... (Keep existing helper functions: generateTimeArray, generatePath) ...

// Helper: Generate Expiry Dates (Weekly & Monthly for next ~3 months)
function generateExpiries() {
    const weeklies = [];
    const monthlies = [];
    const today = new Date(); 
    let date = new Date(today);

    // Find first Thursday
    while (date.getDay() !== 4) { date.setDate(date.getDate() + 1); }

    // Generate for next 13 weeks (~3 months)
    for (let i = 0; i < 13; i++) {
        const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        weeklies.push(dateStr);

        // Simple check: if next week is a new month, treat this as monthly expiry
        const nextWeek = new Date(date);
        nextWeek.setDate(date.getDate() + 7);
        if (nextWeek.getMonth() !== date.getMonth()) {
            monthlies.push(dateStr);
        }
        
        date.setDate(date.getDate() + 7);
    }
    return { weeklies, monthlies: monthlies.slice(0, 3) };
}

// Helper: Generate Mock Surface Data (Z-values)
function generateSurfaceZ(rowCount, colCount) {
    const matrix = [];
    let baseIV = 14.0;
    for (let r = 0; r < rowCount; r++) {
        const row = [];
        for (let c = 0; c < colCount; c++) {
            // Random walk + structure to prevent blanks
            // Add variation based on column (smile shape)
            const smileFactor = Math.pow(c - 2, 2) * 0.5; 
            const val = (baseIV + smileFactor + Math.random()).toFixed(2);
            row.push(parseFloat(val));
        }
        matrix.push(row);
        baseIV += 0.2; 
    }
    return matrix;
}

// NEW HELPER: Generate Signals (Buy/Sell/Null)
function generateSurfaceSignals(rowCount, colCount) {
    const matrix = [];
    for (let r = 0; r < rowCount; r++) {
        const row = [];
        for (let c = 0; c < colCount; c++) {
            const rand = Math.random();
            // 5% chance of Buy, 5% chance of Sell, rest Null
            if (rand > 0.95) row.push('sell');
            else if (rand < 0.05) row.push('buy');
            else row.push(null);
        }
        matrix.push(row);
    }
    return matrix;
}

const times = generateTimeArray();
const expData = generateExpiries();
const colsMoneyness = 5;
const colsDelta = 5;

export const mockData = {
    spot: 26150.00,
    spotVix: 13.8,

    // ... (Keep grids, intraday, pcr, sdTable, term, skew as is) ...
    gridWeekly: [ /*... same as before ...*/ ],
    gridMonthly: [ /*... same as before ...*/ ],
    intraday: { 
        time: times,
        wk: generatePath(12.4, times.length, 0.2),    
        mo: generatePath(14.2, times.length, 0.15),   
        wkRv: generatePath(10.5, times.length, 0.1),  
        moRv: generatePath(11.0, times.length, 0.1)   
    },
    pcr: {
        current: 0.85,
        time: times,
        history: generatePath(1.1, times.length, 0.15).map(v => Math.max(0.5, Math.min(1.5, v)))
    },
    sdTable: {
        levels: ["+2 SD", "+1 SD", "Mean", "-1 SD", "-2 SD"],
        call: ["26,750", "26,450", "26,150", "25,850", "25,550"],
        put: ["26,800", "26,500", "26,150", "25,900", "25,600"]
    },
    term: {
        expiries: ['26 Dec', '02 Jan', '09 Jan', '16 Jan', '30 Jan', '27 Feb'],
        weekly: [12.8, 13.2, 13.5, 13.9, 14.5, 15.1],
        monthly: [13.1, 13.4, 13.8, 14.2, 14.8, 15.4]
    },
    skew: {
        strikes: [25500, 25750, 26000, 26250, 26500, 26750],
        weekly: [14.5, 13.8, 12.8, 12.5, 12.9, 13.5], 
        monthly: [15.2, 14.5, 13.5, 13.2, 13.6, 14.2]
    },

    // UPDATED SURFACE DATA
    surface: {
        moneyness: ['-10%', '-5%', 'ATM', '+5%', '+10%'],
        delta: ['90 (ITM)', '75', '50 (ATM)', '25', '10 (OTM)'],
        
        expiriesWeekly: expData.weeklies,
        expiriesMonthly: expData.monthlies,

        // Data Matrices
        zWk: generateSurfaceZ(expData.weeklies.length, colsMoneyness),
        zMo: generateSurfaceZ(expData.monthlies.length, colsMoneyness),
        
        // Signal Matrices (Parallel to Z data)
        sigWk: generateSurfaceSignals(expData.weeklies.length, colsMoneyness),
        sigMo: generateSurfaceSignals(expData.monthlies.length, colsMoneyness)
    }
};

export function getGlobalIVRange() {
    return [10, 18]; 
}
