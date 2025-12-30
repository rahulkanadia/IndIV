// --- HEATMAP HELPER ---
function getBgColor(value, min, max, isCall) {
    if (min === max || value === undefined) return 'transparent';
    
    let pct = (Math.abs(value) - min) / (max - min);
    if (pct < 0) pct = 0; if (pct > 1) pct = 1;

    // Opacity range
    const opacity = 0.05 + (pct * 0.30);
    const color = isCall ? `0, 230, 118` : `255, 82, 82`;
    return `rgba(${color}, ${opacity.toFixed(3)})`;
}

// --- COLUMN RANGE CALCULATOR ---
function getColumnRanges(rows) {
    const ranges = {
        gamma: { min: Infinity, max: -Infinity },
        delta: { min: Infinity, max: -Infinity }
        // We only calculate ranges for columns that need heatmap
    };

    rows.forEach(r => {
        ['gamma', 'delta'].forEach(key => {
            const valC = Math.abs(parseFloat(r.call[key]));
            const valP = Math.abs(parseFloat(r.put[key]));
            if(!isNaN(valC)) {
                ranges[key].min = Math.min(ranges[key].min, valC);
                ranges[key].max = Math.max(ranges[key].max, valC);
            }
            if(!isNaN(valP)) {
                ranges[key].min = Math.min(ranges[key].min, valP);
                ranges[key].max = Math.max(ranges[key].max, valP);
            }
        });
    });
    return ranges;
}

// --- RENDER COMBINED OI CELL ---
function renderCombinedOI(oi, chg) {
    const oiTxt = (oi / 100000).toFixed(1);
    const chgTxt = (chg > 0 ? '+' : '') + (chg / 100000).toFixed(1);
    const maxChg = 200000; 
    let width = (Math.abs(chg) / maxChg) * 100;
    if (width > 100) width = 100;
    const color = chg >= 0 ? '#00E676' : '#FF5252';

    return `
        <td class="col-oi-combined">
            <div class="oi-bar-bg" style="width:${width}%; background:${color};"></div>
            <span style="color:#bbb">${oiTxt}</span>
            <span style="color:${color}; font-size:9px;">(${chgTxt})</span>
        </td>
    `;
}

// --- STRIKE CALCULATOR ---
function calculateStrike(atm, index, isMajor) {
    // STANDARD MODE (Step 50)
    if (!isMajor) {
        return atm + (index * 50);
    }

    // MAJOR MODE
    // Case A: ATM ends in 00 (e.g., 26100) -> Step 100
    if (atm % 100 === 0) {
        return atm + (index * 100);
    }
    
    // Case B: ATM ends in 50 (e.g., 26150)
    // Index 0: 26150
    // Index +1: 26200 (+50)
    // Index +2: 26300 (+100 from prev)
    // Index -1: 26100 (-50)
    // Index -2: 26000 (-100 from prev)
    if (index === 0) return atm;
    if (index > 0) {
        return (atm + 50) + ((index - 1) * 100);
    }
    if (index < 0) {
        return (atm - 50) + ((index + 1) * 100);
    }
}

// --- STATE MANAGEMENT ---
let majorStrikesOn = false; 
let activeExpiryIndex = 0; 

export function renderGreeksTable(containerId, mockData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. GENERATE DUMMY DATA
    const centerStrike = 26150; // Ends in 50, perfect for testing your logic
    const rows = [];
    
    // We maintain fixed 21 rows (-10 to 10) regardless of mode
    for (let i = -10; i <= 10; i++) {
        
        // Use new helper to determine strike based on mode
        const strike = calculateStrike(centerStrike, i, majorStrikesOn);
        
        // Calculate distance from center for curve simulation
        // (Approximation: purely visual)
        const dist = Math.abs((strike - centerStrike) / 50); 
        
        // Simulating curve
        const gamma = Math.max(0.0005, (0.0035 - (dist * 0.0001))).toFixed(4);
        const vega = Math.max(10, (15.0 - (dist * 0.2))).toFixed(1);
        const theta = Math.min(-5, (-14.2 + (dist * 0.2))).toFixed(1);
        const deltaC = Math.max(0.05, Math.min(0.95, (0.5 - (i * (majorStrikesOn ? 0.08 : 0.04))))).toFixed(2);
        const deltaP = Math.max(-0.95, Math.min(-0.05, (-0.5 - (i * (majorStrikesOn ? 0.08 : 0.04))))).toFixed(2);
        const ivC = (12.4 + (dist * 0.05)).toFixed(1);
        const ivP = (12.9 + (dist * 0.05)).toFixed(1);

        const baseOI = 3000000 + (Math.random() * 2000000);
        const callOI = Math.floor(baseOI); 
        const putOI = Math.floor(baseOI * 0.9);
        const callChg = Math.floor((Math.random() * 250000) - 50000);
        const putChg = Math.floor((Math.random() * 250000) - 50000);

        rows.push({
            strike: strike,
            call: { gamma, vega, theta, delta: deltaC, iv: ivC, oi: callOI, oiChg: callChg },
            put:  { gamma, vega, theta, delta: deltaP, iv: ivP, oi: putOI, oiChg: putChg }
        });
    }

    // 2. CALCULATE RANGES (Only Delta/Gamma now)
    const rng = getColumnRanges(rows);

    // 3. BUILD CONTROLS HTML
    const styleOn = `background: rgba(0, 230, 118, 0.2); color: #00E676; border: 1px solid rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255,82,82,0.3);`;
    const currentBtnStyle = majorStrikesOn ? styleOn : styleOff;

    // 9 Expiry Buttons (Reverted to Wk/Mo)
    const expiries = [
        '26 Dec (Wk)', '02 Jan (Wk)', '09 Jan (Wk)', 
        '16 Jan (Wk)', '23 Jan (Wk)', '30 Jan (Mo)',
        '06 Feb (Wk)', '13 Feb (Wk)', '27 Feb (Mo)'
    ];

    const tabsHtml = expiries.map((exp, idx) => {
        const isActive = idx === activeExpiryIndex ? 'active' : '';
        return `<button class="expiry-btn ${isActive}" data-index="${idx}">${exp}</button>`;
    }).join('');

    const controlsHtml = `
        <div class="greeks-controls">
            <div class="expiry-tabs">
                ${tabsHtml}
            </div>
            
            <div class="control-separator"></div>

            <div class="toggle-container">
                <button id="btn-major-strikes" class="major-strikes-btn" style="${currentBtnStyle}">
                    MAJOR STRIKES
                </button>
            </div>
        </div>
    `;

    // 4. BUILD TABLE ROWS
    // Heatmap applied ONLY to Delta and Gamma
    let tableRows = rows.map(r => {
        const isATM = r.strike === centerStrike || r.strike === 26150; // 26150 is our centerStrike
        const rowClass = isATM ? 'row-atm' : '';

        // CALL SIDE
        const cOI = renderCombinedOI(r.call.oi, r.call.oiChg);
        // Heatmap ON
        const cG = `<td style="background:${getBgColor(r.call.gamma, rng.gamma.min, rng.gamma.max, true)}">${r.call.gamma}</td>`;
        // Heatmap OFF
        const cV = `<td>${r.call.vega}</td>`;
        const cT = `<td>${r.call.theta}</td>`;
        // Heatmap ON
        const cD = `<td style="background:${getBgColor(r.call.delta, rng.delta.min, rng.delta.max, true)}">${r.call.delta}</td>`;
        // Heatmap OFF
        const cI = `<td>${r.call.iv}</td>`;

        // PUT SIDE
        const pI = `<td>${r.put.iv}</td>`;
        // Heatmap ON
        const pD = `<td style="background:${getBgColor(r.put.delta, rng.delta.min, rng.delta.max, false)}">${r.put.delta}</td>`;
        // Heatmap OFF
        const pT = `<td>${r.put.theta}</td>`;
        const pV = `<td>${r.put.vega}</td>`;
        // Heatmap ON
        const pG = `<td style="background:${getBgColor(r.put.gamma, rng.gamma.min, rng.gamma.max, false)}">${r.put.gamma}</td>`;
        const pOI = renderCombinedOI(r.put.oi, r.put.oiChg);

        return `
            <tr class="${rowClass}">
                ${cOI} ${cG} ${cV} ${cT} ${cD} ${cI}
                <td class="col-strike">${r.strike}</td>
                ${pI} ${pD} ${pT} ${pV} ${pG} ${pOI}
            </tr>
        `;
    }).join('');

    // 5. INJECT HTML
    container.innerHTML = `
        ${controlsHtml}
        <div class="greeks-table-wrapper">
            <table class="greeks-table">
                <thead>
                    <tr>
                        <th colspan="6" style="border-bottom:2px solid #00E676; color:#00E676;">CALLS</th>
                        <th style="background:#000;"></th>
                        <th colspan="6" style="border-bottom:2px solid #FF5252; color:#FF5252;">PUTS</th>
                    </tr>
                    <tr>
                        <th>OI (Lakhs)</th> <th>Gamma</th> <th>Vega</th> <th>Theta</th> <th>Delta</th> <th>IV%</th>
                        <th style="color:#fff; border-left:1px solid #333; border-right:1px solid #333;">Strike</th>
                        <th>IV%</th> <th>Delta</th> <th>Theta</th> <th>Vega</th> <th>Gamma</th> <th>OI (Lakhs)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;

    // 6. ATTACH EVENT LISTENERS
    
    // Major Strikes Toggle
    const btn = document.getElementById('btn-major-strikes');
    if(btn) {
        btn.onclick = () => {
            majorStrikesOn = !majorStrikesOn;
            renderGreeksTable(containerId, mockData); 
        };
    }

    // Expiry Buttons
    const expiryBtns = container.querySelectorAll('.expiry-btn');
    expiryBtns.forEach(b => {
        b.onclick = (e) => {
            activeExpiryIndex = parseInt(e.target.getAttribute('data-index'));
            renderGreeksTable(containerId, mockData); 
        };
    });
}
