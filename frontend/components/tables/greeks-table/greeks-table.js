// Helper: Calculate background tint (Existing)
function getBgColor(value, min, max, isCall) {
    if (min === max) return 'transparent';
    let pct = (Math.abs(value) - min) / (max - min);
    if (pct < 0) pct = 0; if (pct > 1) pct = 1;
    const opacity = 0.05 + (pct * 0.20);
    const color = isCall ? `0, 230, 118` : `255, 82, 82`;
    return `rgba(${color}, ${opacity.toFixed(3)})`;
}

// Helper: Render Chg OI Cell with visual bar
function renderChgOICell(val) {
    const absVal = Math.abs(val);
    const maxVal = 200000; // Cap for bar width
    let width = (absVal / maxVal) * 100;
    if (width > 100) width = 100;
    
    // Green for positive (writing), Red for negative (unwinding)
    const color = val >= 0 ? '#00E676' : '#FF5252';
    
    // Format text: 1.5L or -0.5L
    const text = (val / 100000).toFixed(2) + 'L';
    
    return `
        <td class="col-oi-chg">
            <div class="oi-bar-bg" style="width:${width}%; background:${color}; opacity:0.6;"></div>
            <span style="color:${color}">${text}</span>
        </td>
    `;
}

// Helper: Format OI (Total)
function renderOICell(val) {
    // 4500000 -> 45.0L
    return `<td class="col-oi">${(val/100000).toFixed(1)}L</td>`;
}

export function renderGreeksTable(containerId, mockData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. GENERATE DUMMY DATA (Now with OI)
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
        
        // Simulating OI (Random logic)
        // High OI near ATM and round numbers
        const baseOI = 3000000 + (Math.random() * 2000000);
        const callOI = Math.floor(baseOI); 
        const putOI = Math.floor(baseOI * 0.9);
        
        // Chg OI: Pos/Neg
        const callChg = Math.floor((Math.random() * 250000) - 50000);
        const putChg = Math.floor((Math.random() * 250000) - 50000);

        rows.push({
            strike: strike,
            call: { gamma, vega, theta, delta: deltaC, oi: callOI, oiChg: callChg },
            put:  { gamma, vega, theta, delta: deltaP, oi: putOI, oiChg: putChg }
        });
    }

    // Ranges for Heatmap (Delta/Theta/Vega) - ignoring OI for heatmap tint
    // (You can implement getColumnRanges here like before if you want the tint on Greeks)
    
    // 2. Build HTML
    // Columns: [OI | ChgOI | Delta | Theta | Vega] [STRIKE] [Vega | Theta | Delta | ChgOI | OI]
    // Note: Gamma removed to save space, or you can add it back if width allows.

    let tableRows = rows.map(r => {
        const isATM = r.strike === centerStrike || r.strike === 26200;
        const rowClass = isATM ? 'row-atm' : '';

        // CALL SIDE
        const cOI = renderOICell(r.call.oi);
        const cChg = renderChgOICell(r.call.oiChg);
        // We skip tint logic here for brevity, but you can wrap these in getBgColor like before
        const cD = `<td>${r.call.delta}</td>`;
        const cT = `<td>${r.call.theta}</td>`;
        const cV = `<td>${r.call.vega}</td>`;

        // PUT SIDE
        const pV = `<td>${r.put.vega}</td>`;
        const pT = `<td>${r.put.theta}</td>`;
        const pD = `<td>${r.put.delta}</td>`;
        const pChg = renderChgOICell(r.put.oiChg);
        const pOI = renderOICell(r.put.oi);

        return `
            <tr class="${rowClass}">
                ${cOI} ${cChg} ${cD} ${cT} ${cV}
                <td class="col-strike">${r.strike}</td>
                ${pV} ${pT} ${pD} ${pChg} ${pOI}
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
                        <th title="Open Interest">OI</th> 
                        <th title="Change in OI">Chg</th> 
                        <th>Delta</th> <th>Theta</th> <th>Vega</th>
                        <th style="color:#fff; border-left:1px solid #333; border-right:1px solid #333;">Strike</th>
                        <th>Vega</th> <th>Theta</th> <th>Delta</th> 
                        <th title="Change in OI">Chg</th> 
                        <th title="Open Interest">OI</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}
