// --- HEATMAP HELPER ---
function getBgColor(value, min, max, isCall) {
    if (min === max || value === undefined) return 'transparent';
    
    // Normalize value (0 to 1)
    let pct = (Math.abs(value) - min) / (max - min);
    if (pct < 0) pct = 0;
    if (pct > 1) pct = 1;

    // Opacity range: 0.05 (min) to 0.35 (max) - slightly boosted for visibility
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
        // OI is not heatmapped, it uses bars
    };

    rows.forEach(r => {
        ['gamma', 'vega', 'theta', 'delta'].forEach(key => {
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
    // Format: 45.2L (+1.5L)
    const oiTxt = (oi / 100000).toFixed(1) + 'L';
    const chgTxt = (chg > 0 ? '+' : '') + (chg / 100000).toFixed(1) + 'L';
    
    // Bar Logic (Based on Change)
    const maxChg = 200000; // Cap for visual width
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
        
        // OI Data
        const baseOI = 3000000 + (Math.random() * 2000000);
        const callOI = Math.floor(baseOI); 
        const putOI = Math.floor(baseOI * 0.9);
        const callChg = Math.floor((Math.random() * 250000) - 50000);
        const putChg = Math.floor((Math.random() * 250000) - 50000);

        rows.push({
            strike: strike,
            call: { gamma, vega, theta, delta: deltaC, oi: callOI, oiChg: callChg },
            put:  { gamma, vega, theta, delta: deltaP, oi: putOI, oiChg: putChg }
        });
    }

    // 2. CALCULATE RANGES (Restored)
    const rng = getColumnRanges(rows);

    // 3. BUILD CONTROLS HTML
    const controlsHtml = `
        <div class="greeks-controls">
            <div class="expiry-tabs">
                <button class="expiry-btn active">26 Dec (Wk)</button>
                <button class="expiry-btn">02 Jan (Wk)</button>
                <button class="expiry-btn">09 Jan (Wk)</button>
                <button class="expiry-btn">16 Jan (Wk)</button>
                <button class="expiry-btn">30 Jan (Mo)</button>
            </div>
            <div class="toggle-container">
                <span>Major Strikes</span>
                <label class="toggle-switch">
                    <input type="checkbox">
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    `;

    // 4. BUILD TABLE ROWS
    // Columns: [OI(Chg) Gamma Vega Theta Delta] [STRIKE] [Delta Theta Vega Gamma OI(Chg)]
    let tableRows = rows.map(r => {
        const isATM = r.strike === centerStrike || r.strike === 26200;
        const rowClass = isATM ? 'row-atm' : '';

        // CALL SIDE
        const cOI = renderCombinedOI(r.call.oi, r.call.oiChg);
        const cG = `<td style="background:${getBgColor(r.call.gamma, rng.gamma.min, rng.gamma.max, true)}">${r.call.gamma}</td>`;
        const cV = `<td style="background:${getBgColor(r.call.vega, rng.vega.min, rng.vega.max, true)}">${r.call.vega}</td>`;
        const cT = `<td style="background:${getBgColor(r.call.theta, rng.theta.min, rng.theta.max, true)}">${r.call.theta}</td>`;
        const cD = `<td style="background:${getBgColor(r.call.delta, rng.delta.min, rng.delta.max, true)}">${r.call.delta}</td>`;

        // PUT SIDE
        const pD = `<td style="background:${getBgColor(r.put.delta, rng.delta.min, rng.delta.max, false)}">${r.put.delta}</td>`;
        const pT = `<td style="background:${getBgColor(r.put.theta, rng.theta.min, rng.theta.max, false)}">${r.put.theta}</td>`;
        const pV = `<td style="background:${getBgColor(r.put.vega, rng.vega.min, rng.vega.max, false)}">${r.put.vega}</td>`;
        const pG = `<td style="background:${getBgColor(r.put.gamma, rng.gamma.min, rng.gamma.max, false)}">${r.put.gamma}</td>`;
        const pOI = renderCombinedOI(r.put.oi, r.put.oiChg);

        return `
            <tr class="${rowClass}">
                ${cOI} ${cG} ${cV} ${cT} ${cD}
                <td class="col-strike">${r.strike}</td>
                ${pD} ${pT} ${pV} ${pG} ${pOI}
            </tr>
        `;
    }).join('');

    // 5. FINAL HTML INJECTION
    container.innerHTML = `
        ${controlsHtml}
        <div class="greeks-table-wrapper">
            <table class="greeks-table">
                <thead>
                    <tr>
                        <th colspan="5" style="border-bottom:2px solid #00E676; color:#00E676;">CALLS</th>
                        <th style="background:#000;"></th>
                        <th colspan="5" style="border-bottom:2px solid #FF5252; color:#FF5252;">PUTS</th>
                    </tr>
                    <tr>
                        <th>OI (Chg)</th> <th>Gamma</th> <th>Vega</th> <th>Theta</th> <th>Delta</th>
                        <th style="color:#fff; border-left:1px solid #333; border-right:1px solid #333;">Strike</th>
                        <th>Delta</th> <th>Theta</th> <th>Vega</th> <th>Gamma</th> <th>OI (Chg)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}
