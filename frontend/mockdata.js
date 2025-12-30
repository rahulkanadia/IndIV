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

export const mockData = {
    spot: 26150.00,
    
    // 1. GRID DATA
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

    // 2. INTRADAY IV & RV DATA
    intraday: {
        time: times,
        wk: generatePath(12.4, steps, 0.2),    // Weekly IV
        mo: generatePath(14.2, steps, 0.15),   // Monthly IV
        wkRv: generatePath(10.5, steps, 0.1),  // Weekly RV
        moRv: generatePath(11.0, steps, 0.1)   // Monthly RV
    },

    // 3. PCR DATA (Sparkline)
    pcr: {
        current: 0.85,
        time: times,
        history: generatePath(1.1, steps, 0.15).map(v => Math.max(0.5, Math.min(1.5, v)))
    },

    // 4. SD TABLE DATA
    sdTable: {
        levels: ["+2 SD", "+1 SD", "Mean", "-1 SD", "-2 SD"],
        call: ["26,750", "26,450", "26,150", "25,850", "25,550"],
        put: ["26,800", "26,500", "26,150", "25,900", "25,600"]
    },

    // 5. TERM STRUCTURE CHART
    term: {
        expiries: ['26 Dec', '02 Jan', '09 Jan', '16 Jan', '30 Jan', '27 Feb'],
        weekly: [12.8, 13.2, 13.5, 13.9, 14.5, 15.1],
        monthly: [13.1, 13.4, 13.8, 14.2, 14.8, 15.4]
    },

    // 6. SKEW CHART
    skew: {
        strikes: [25500, 25750, 26000, 26250, 26500, 26750],
        weekly: [14.5, 13.8, 12.8, 12.5, 12.9, 13.5], // Smile curve
        monthly: [15.2, 14.5, 13.5, 13.2, 13.6, 14.2]
    },

    // 7. SURFACE CHART (3D Mock)
    surface: {
        strikes: [25500, 26000, 26500],
        expiries: ['26 Dec', '30 Jan', '27 Feb'],
        z: [
            [14, 13, 14], // Expiry 1
            [15, 14, 15], // Expiry 2
            [16, 15, 16]  // Expiry 3
        ]
    }
};

// EXPORT HELPER FUNCTION (Critical for Chart Scaling)
export function getGlobalIVRange() {
    // Returns a fixed range for Y-axis consistency
    return [10, 18]; 
}
