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

// Generate Expiry Dates (Weekly & Monthly for next ~3 months)
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
        
        // Move to next week
        date.setDate(date.getDate() + 7);
    }
    // Ensure we return at least 3 monthlies for the view
    return { weeklies, monthlies: monthlies.slice(0, 3) };
}

// Generate Mock Surface Data (Z-values) fitting the expiry count
// Rows = Expiries, Cols = 5 (Moneyness/Delta points)
function generateSurfaceZ(rowCount) {
    const matrix = [];
    let baseIV = 14.0;
    for (let r = 0; r < rowCount; r++) {
        const row = [];
        // Create a "smile" shape across columns: Higher at edges, lower at center (ATM)
        row.push((baseIV + 1.5 + Math.random()).toFixed(2)); // Deep OTM Put / Low Delta
        row.push((baseIV + 0.5 + Math.random()).toFixed(2)); // OTM Put
        row.push((baseIV + Math.random()).toFixed(2));       // ATM
        row.push((baseIV + 0.8 + Math.random()).toFixed(2)); // OTM Call
        row.push((baseIV + 2.0 + Math.random()).toFixed(2)); // Deep OTM Call / High Delta
        matrix.push(row);
        baseIV += 0.2; // Contango: IV increases slightly with time
    }
    return matrix;
}

// Initialize Dynamic Data
const times = generateTimeArray();
const steps = times.length;
const expData = generateExpiries();

// =========================================
// 2. EXPORTED DATA OBJECT
// =========================================

export const mockData = {
    // HEADER DATA
    spot: 26150.00,
    spotVix: 13.8, // Used for Term Structure Reference Line

    // MARKET GRIDS
    gridWeekly: [
        { label: 'ATM CALL', value: '145.20', chg: '+12 (9%)', color: 'up' },
        { label: 'CALL IV', value: '12.4%', chg: '+2%', color: 'up' },
        { label: 'ATM PUT', value: '139.30', chg: '-18 (-11%)', color: 'down' },
        { label: 'PUT IV', value: '13.1%', chg: '-1%', color: 'down' },
        { label: 'STRADDLE', value: '284.50', chg: '-5 (-1%)', color: 'down' },
        { label: 'IV', value: '12.8%', chg: '+0.5%', color: 'up' },
        { label: 'RV (20D)', value: '10.5%', chg: '-', color: 'neutral' },
        { label: 'IVR', value: '45', chg: '', color: 'neutral' },
        { label: 'IVP', value: '60', chg: '', color: 'neutral' }
    ],
    gridMonthly: [
        { label: 'ATM CALL', value: '310.50', chg: '+15 (5%)', color: 'up' },
        { label: 'CALL IV', value: '14.2%', chg: '+1%', color: 'up' },
        { label: 'ATM PUT', value: '284.50', chg: '-12 (-4%)', color: 'down' },
        { label: 'PUT IV', value: '14.8%', chg: '-0.3%', color: 'down' },
        { label: 'STRADDLE', value: '595.00', chg: '+2 (0.4%)', color: 'up' },
        { label: 'IV', value: '14.5%', chg: '+0.8%', color: 'up' },
        { label: 'RV (20D)', value: '11.0%', chg: '-', color: 'neutral' },
        { label: 'IVR', value: '52', chg: '', color: 'neutral' },
        { label: 'IVP', value: '65', chg: '', color: 'neutral' }
    ],

    // CHART: INTRADAY IV & RV
    intraday: {
        time: times,
        wk: generatePath(12.4, steps, 0.2),    
        mo: generatePath(14.2, steps, 0.15),   
        wkRv: generatePath(10.5, steps, 0.1),  
        moRv: generatePath(11.0, steps, 0.1)   
    },

    // WIDGET: PCR
    pcr: {
        current: 0.85,
        time: times,
        history: generatePath(1.1, steps, 0.15).map(v => Math.max(0.5, Math.min(1.5, v)))
    },

    // WIDGET: SD TABLE
    sdTable: {
        levels: ["+2 SD", "+1 SD", "Mean", "-1 SD", "-2 SD"],
        call: ["26,750", "26,450", "26,150", "25,850", "25,550"],
        put: ["26,800", "26,500", "26,150", "25,900", "25,600"]
    },

    // CHART: TERM STRUCTURE
    term: {
        expiries: ['26 Dec', '02 Jan', '09 Jan', '16 Jan', '30 Jan', '27 Feb'],
        weekly: [12.8, 13.2, 13.5, 13.9, 14.5, 15.1],
        monthly: [13.1, 13.4, 13.8, 14.2, 14.8, 15.4]
    },

    // CHART: VOLATILITY SKEW
    skew: {
        strikes: [25500, 25750, 26000, 26250, 26500, 26750],
        weekly: [14.5, 13.8, 12.8, 12.5, 12.9, 13.5], 
        monthly: [15.2, 14.5, 13.5, 13.2, 13.6, 14.2]
        // Note: The "Spread" (Bars) and "Risk Reversal" are calculated dynamically 
        // in chart-skew.js using (Weekly IV - ATM IV).
    },

    // CHART: VOLATILITY SURFACE
    surface: {
        moneyness: ['-10%', '-5%', 'ATM', '+5%', '+10%'],
        // Delta labels from High to Low (ITM Call -> OTM Call)
        delta: ['90 (ITM)', '75', '50 (ATM)', '25', '10 (OTM)'],
        
        // Dynamic Dates
        expiriesWeekly: expData.weeklies,
        expiriesMonthly: expData.monthlies,

        // Dynamic Z-Data Matrices
        zWk: generateSurfaceZ(expData.weeklies.length),
        zMo: generateSurfaceZ(expData.monthlies.length)
    }
};

// Global Y-Axis Range for consistent scaling across charts
export function getGlobalIVRange() {
    return [10, 18]; 
}
