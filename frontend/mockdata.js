// HELPER: Generates consistent time slots for the day
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

const times = generateTimeArray();
const steps = times.length; // ~26 steps

// HELPER: Generate Random Data Path
function generatePath(start, steps, volatility) {
    const path = [start];
    for (let i = 1; i < steps; i++) {
        const change = (Math.random() - 0.5) * volatility;
        path.push(path[i - 1] + change);
    }
    return path;
}

// ... (Keep existing generateTimeArray and generatePath) ...

export const mockData = {
    // ... (Keep spot, gridWeekly, gridMonthly, intraday, pcr, sdTable, term, skew) ...
    spot: 26150.00,
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
    intraday: {
        time: generateTimeArray(), // Ensure this function is defined as before
        wk: generatePath(12.4, 26, 0.2),    
        mo: generatePath(14.2, 26, 0.15),   
        wkRv: generatePath(10.5, 26, 0.1),  
        moRv: generatePath(11.0, 26, 0.1)   
    },
    pcr: {
        current: 0.85,
        time: generateTimeArray(),
        history: generatePath(1.1, 26, 0.15).map(v => Math.max(0.5, Math.min(1.5, v)))
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

    // RESTRUCTURED SURFACE DATA
    surface: {
        // Axis Data
        moneyness: ['-10%', '-5%', 'ATM', '+5%', '+10%'],
        delta: ['10', '25', '50', '75', '90'],
        
        // Expiries
        expiriesWeekly: ['26 Dec', '02 Jan', '09 Jan'],
        expiriesMonthly: ['26 Dec', '30 Jan', '27 Feb'],

        // Z-Data (Rows=Expiry, Cols=Strike/Delta)
        // Weekly Data (3 Expiries x 5 Points)
        zWk: [
            [14.5, 13.2, 12.4, 12.8, 13.5], // Exp 1
            [14.8, 13.5, 12.7, 13.1, 13.8], // Exp 2
            [15.1, 13.8, 13.0, 13.4, 14.1]  // Exp 3
        ],
        // Monthly Data (3 Expiries x 5 Points)
        zMo: [
            [15.0, 13.8, 12.9, 13.3, 14.0],
            [15.5, 14.2, 13.4, 13.8, 14.5],
            [16.0, 14.8, 14.0, 14.4, 15.2]
        ]
    }
};

export function getGlobalIVRange() {
    return [10, 18]; 
}
