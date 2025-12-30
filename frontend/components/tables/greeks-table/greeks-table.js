// --- HEATMAP HELPER ---
function getBgColor(value, min, max, isCall) {
    if (min === max || value === undefined) return 'transparent';
    
    let pct = (Math.abs(value) - min) / (max - min);
    if (pct < 0) pct = 0; if (pct > 1) pct = 1;

    const opacity = 0.05 + (pct * 0.30);
    const color = isCall ? `0, 230, 118` : `255, 82, 82`;
    return `rgba(${color}, ${opacity.toFixed(3)})`;
}

// --- COLUMN RANGE CALCULATOR ---
function getColumnRanges(rows) {
    const ranges = {
        gamma: { min: Infinity, max: -Infinity },
        vega:  { min: Infinity, max: -Infinity },
        theta: { min: Infinity, max: -Infinity },
        delta: { min: Infinity, max: -Infinity },
        iv:    { min: Infinity, max: -Infinity }
    };

    rows.forEach(r => {
        ['gamma', 'vega', 'theta', 'delta', 'iv'].forEach(key => {
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

// --- RENDER COMBINED OI CELL (No 'L') ---
function renderCombinedOI(oi, chg) {
    // Format: 45.2 (+1.5)
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

// --- STATE MANAGEMENT ---
let majorStrikesOn = false; // Default OFF
let activeExpiryIndex = 0;  // Default first tab

export function renderGreeksTable(containerId, mockData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. GENERATE DUMMY DATA
    const centerStrike = 26150;
    const rows = [];
    for (let i = -10; i <= 10; i++) {
        const strike = centerStrike + (i * 50);
        const dist = Math.abs(i);
        
        // Simulating curve
        const gamma = (0.0035 - (dist * 0.0002)).toFixed(4);
        const vega = (15.0 - (dist * 0.5)).toFixed(1);
        const theta = (-14.2 + (dist * 0.5)).toFixed(1);
        const deltaC = (0.5 - (i * 0.04)).toFixed(2);
        const deltaP = (-0.5 - (i * 0.04)).toFixed(2);
        const ivC = (12.4 + (dist * 0.1)).toFixed(1);
        const ivP = (12.9 + (dist * 0.1)).toFixed(1);

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

    // 2. CALCULATE RANGES
    const rng = getColumnRanges(rows);

    // 3. BUILD CONTROLS HTML
    // Exact styles from chart-term.js
    const styleOn = `background: rgba(0, 230, 118, 0.2); color: #00E676; border: 1px solid rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255,82,82,0.3);`;
    
    // Determine button style based on state
    const currentBtnStyle = majorStrikesOn ? styleOn : styleOff;
    const btnText = majorStrikesOn ? 'MAJOR ON' : 'MAJOR OFF';

    // Expiry Tabs
    const expiries = ['26 Dec (Wk)', '02 Jan (Wk)', '09 Jan (Wk)', '16 Jan (Wk)', '30 Jan (Mo)'];
    const tabsHtml = expiries.map((exp, idx) => {
        const isActive = idx === activeExpiryIndex ? 'active' : '';
        // Add data-index to handle clicks
        return `<button class="expiry-btn ${isActive}" data-index="${idx}">${exp}</button>`;
    }).join('');

    const controlsHtml = `
        <div class="greeks-controls">
            <div class="expiry-tabs">
                ${tabsHtml}
            </div>
            <div class="toggle-container" style="display:flex; align-items:center; gap:8px;">
                <button id="btn-major-strikes" class="major-strikes-btn" style="${currentBtnStyle}">
                    ${btnText}
                </button>
            </div>
        </div>
    `;

    // 4. BUILD TABLE ROWS
    let tableRows = rows.map(r => {
        const isATM = r.strike === centerStrike || r.strike === 26200;
        const rowClass = isATM ? 'row-atm' : '';

        // CALL SIDE
        const cOI = renderCombinedOI(r.call.oi, r.call.oiChg);
        const cG = `<td style="background:${getBgColor(r.call.gamma, rng.gamma.min, rng.gamma.max, true)}">${r.call.gamma}</td>`;
        const cV = `<td style="background:${getBgColor(r.call.vega, rng.vega.min, rng.vega.max, true)}">${r.call.vega}</td>`;
        const cT = `<td style="background:${getBgColor(r.call.theta, rng.theta.min, rng.theta.max, true)}">${r.call.theta}</td>`;
        const cD = `<td style="background:${getBgColor(r.call.delta, rng.delta.min, rng.delta.max, true)}">${r.call.delta}</td>`;
        const cI = `<td style="background:${getBgColor(r.call.iv, rng.iv.min, rng.iv.max, true)}">${r.call.iv}</td>`;

        // PUT SIDE
        const pI = `<td style="background:${getBgColor(r.put.iv, rng.iv.min, rng.iv.max, false)}">${r.put.iv}</td>`;
        const pD = `<td style="background:${getBgColor(r.put.delta, rng.delta.min, rng.delta.max, false)}">${r.put.delta}</td>`;
        const pT = `<td style="background:${getBgColor(r.put.theta, rng.theta.min, rng.theta.max, false)}">${r.put.theta}</td>`;
        const pV = `<td style="background:${getBgColor(r.put.vega, rng.vega.min, rng.vega.max, false)}">${r.put.vega}</td>`;
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
    
    // A. Major Strikes Button Toggle
    const btn = document.getElementById('btn-major-strikes');
    if(btn) {
        btn.onclick = () => {
            majorStrikesOn = !majorStrikesOn;
            renderGreeksTable(containerId, mockData); // Re-render to update style
        };
    }

    // B. Expiry Buttons Selection
    const expiryBtns = container.querySelectorAll('.expiry-btn');
    expiryBtns.forEach(b => {
        b.onclick = (e) => {
            activeExpiryIndex = parseInt(e.target.getAttribute('data-index'));
            renderGreeksTable(containerId, mockData); // Re-render to update active tab
        };
    });
}
