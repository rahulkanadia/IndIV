// Helper: Calculate background tint based on value intensity
function getBgColor(value, min, max, isCall) {
    if (min === max) return 'transparent';
    
    // Normalize value (0 to 1)
    let pct = (Math.abs(value) - min) / (max - min);
    if (pct < 0) pct = 0;
    if (pct > 1) pct = 1;

    // Cap opacity to keep it subtle (0.05 to 0.25)
    const opacity = 0.05 + (pct * 0.20);

    // Green for Calls, Red for Puts
    const color = isCall ? `0, 230, 118` : `255, 82, 82`;
    
    return `rgba(${color}, ${opacity.toFixed(3)})`;
}

// Helper: Finds min/max for each column to normalize the heatmap
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
            // Check both Call and Put values
            const valC = Math.abs(parseFloat(r.call[key]));
            const valP = Math.abs(parseFloat(r.put[key]));
            
            ranges[key].min = Math.min(ranges[key].min, valC, valP);
            ranges[key].max = Math.max(ranges[key].max, valC, valP);
        });
    });
    return ranges;
}

export function renderGreeksTable(containerId, mockData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. GENERATE DUMMY DATA (Since mockData usually doesn't have 20 rows of greeks)
    // In production, this data would come directly from the API.
    const centerStrike = 26150;
    const rows = [];
    for (let i = -10; i <= 10; i++) {
        const strike = centerStrike + (i * 50);
        // Simulate Greeks curve
        const dist = Math.abs(i);
        const gamma = (0.0035 - (dist * 0.0002)).toFixed(4); // Peaks at ATM
        const vega = (15.0 - (dist * 0.5)).toFixed(1);       // Peaks at ATM
        const theta = (-14.2 + (dist * 0.5)).toFixed(1);     // Peaks (negative) at ATM
        
        // Delta: Calls 0.5 -> 0, Puts -0.5 -> 0
        const deltaC = (0.5 - (i * 0.04)).toFixed(2);
        const deltaP = (-0.5 - (i * 0.04)).toFixed(2);

        rows.push({
            strike: strike,
            call: { gamma, vega, theta, delta: deltaC, iv: (12.4 + dist*0.1).toFixed(1) },
            put:  { gamma, vega, theta, delta: deltaP, iv: (12.9 + dist*0.1).toFixed(1) }
        });
    }

    // 2. Calculate Ranges for Heatmap
    const rng = getColumnRanges(rows);

    // 3. Build HTML
    // Note: We use inline styles for the background colors
    let tableRows = rows.map(r => {
        const isATM = r.strike === centerStrike || r.strike === 26200; // Simulating ATM zone
        const rowClass = isATM ? 'row-atm' : '';

        // Generate Cells with Tint
        // LEFT (CALLS) - Green Tint
        const cG = `<td style="background:${getBgColor(r.call.gamma, rng.gamma.min, rng.gamma.max, true)}">${r.call.gamma}</td>`;
        const cV = `<td style="background:${getBgColor(r.call.vega, rng.vega.min, rng.vega.max, true)}">${r.call.vega}</td>`;
        const cT = `<td style="background:${getBgColor(r.call.theta, rng.theta.min, rng.theta.max, true)}">${r.call.theta}</td>`;
        const cD = `<td style="background:${getBgColor(r.call.delta, rng.delta.min, rng.delta.max, true)}">${r.call.delta}</td>`;
        const cI = `<td style="background:${getBgColor(r.call.iv, rng.iv.min, rng.iv.max, true)}">${r.call.iv}</td>`;

        // RIGHT (PUTS) - Red Tint
        const pI = `<td style="background:${getBgColor(r.put.iv, rng.iv.min, rng.iv.max, false)}">${r.put.iv}</td>`;
        const pD = `<td style="background:${getBgColor(r.put.delta, rng.delta.min, rng.delta.max, false)}">${r.put.delta}</td>`;
        const pT = `<td style="background:${getBgColor(r.put.theta, rng.theta.min, rng.theta.max, false)}">${r.put.theta}</td>`;
        const pV = `<td style="background:${getBgColor(r.put.vega, rng.vega.min, rng.vega.max, false)}">${r.put.vega}</td>`;
        const pG = `<td style="background:${getBgColor(r.put.gamma, rng.gamma.min, rng.gamma.max, false)}">${r.put.gamma}</td>`;

        return `
            <tr class="${rowClass}">
                ${cG} ${cV} ${cT} ${cD} ${cI}
                <td class="col-strike">${r.strike}</td>
                ${pI} ${pD} ${pT} ${pV} ${pG}
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="greeks-table-wrapper">
            <table class="greeks-table">
                <thead>
                    <tr>
                        <th colspan="5" style="border-bottom:2px solid #00E676; color:#00E676;">CALLS</th>
                        <th style="background:#000;"></th>
                        <th colspan="5" style="border-bottom:2px solid #FF5252; color:#FF5252;">PUTS</th>
                    </tr>
                    <tr>
                        <th>Gamma</th> <th>Vega</th> <th>Theta</th> <th>Delta</th> <th>IV%</th>
                        <th style="color:#fff; border-left:1px solid #333; border-right:1px solid #333;">Strike</th>
                        <th>IV%</th> <th>Delta</th> <th>Theta</th> <th>Vega</th> <th>Gamma</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}
