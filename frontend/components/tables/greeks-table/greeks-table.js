// --- HEATMAP HELPER ---
function getBgColor(value, min, max, isCall) {
    if (min === max || value === undefined) return 'transparent';
    let pct = (Math.abs(value) - min) / (max - min);
    if (pct < 0) pct = 0; if (pct > 1) pct = 1;
    const opacity = 0.05 + (pct * 0.15);
    const color = isCall ? `0, 230, 118` : `255, 82, 82`;
    return `rgba(${color}, ${opacity.toFixed(3)})`;
}

// --- COLUMN RANGE CALCULATOR ---
function getColumnRanges(rows) {
    const ranges = { gamma: { min: Infinity, max: -Infinity }, delta: { min: Infinity, max: -Infinity } };
    rows.forEach(r => {
        ['gamma', 'delta'].forEach(key => {
            const valC = r.call && r.call[key] ? Math.abs(parseFloat(r.call[key])) : 0;
            const valP = r.put && r.put[key] ? Math.abs(parseFloat(r.put[key])) : 0;
            if(valC) { ranges[key].min = Math.min(ranges[key].min, valC); ranges[key].max = Math.max(ranges[key].max, valC); }
            if(valP) { ranges[key].min = Math.min(ranges[key].min, valP); ranges[key].max = Math.max(ranges[key].max, valP); }
        });
    });
    if(ranges.gamma.min === Infinity) ranges.gamma = { min:0, max:1 };
    if(ranges.delta.min === Infinity) ranges.delta = { min:0, max:1 };
    return ranges;
}

// --- RENDER COMBINED OI CELL ---
function renderCombinedOI(oi, chg) {
    const safeOI = oi || 0;
    const safeChg = chg || 0;
    const oiTxt = (safeOI / 100000).toFixed(1);
    const chgTxt = (safeChg > 0 ? '+' : '') + (safeChg / 100000).toFixed(1);
    const maxChg = 200000; 
    let width = (Math.abs(safeChg) / maxChg) * 100;
    if (width > 100) width = 100;
    const color = safeChg >= 0 ? '#00E676' : '#FF5252';

    return `
        <td class="col-oi-combined">
            <div class="oi-bar-bg" style="width:${width}%; background:${color};"></div>
            <span style="color:#bbb">${oiTxt}</span>
            <span style="color:${color}; font-size:9px;">(${chgTxt})</span>
        </td>
    `;
}

let majorStrikesOn = false; 

export function renderGreeksTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tableData = data.rows ? data : (data.greeks || { rows: [] });
    let rows = tableData.rows || [];
    const atmStrike = tableData.atmStrike || 0;

    if(rows.length === 0) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">No Greeks Data</div>';
        return;
    }

    // --- 1. FILTER LOGIC ---
    let displayRows = [...rows].sort((a,b) => a.strike - b.strike);

    if (majorStrikesOn) {
        // Rule: If ATM is Minor (ends in 50), show +/- 50 neighbors, then 100 steps.
        // If ATM is Major (ends in 00), show 100 steps.
        const isAtmMinor = atmStrike % 100 !== 0;

        displayRows = displayRows.filter(r => {
            // Always keep ATM
            if (r.strike === atmStrike) return true;
            
            // Major Strikes (Step 100) are always candidates
            if (r.strike % 100 === 0) return true;

            // Minor ATM Exception: Keep immediate neighbors (+/- 50)
            if (isAtmMinor && Math.abs(r.strike - atmStrike) === 50) return true;

            return false;
        });
    }

    // --- 2. SLICE LOGIC (Center ATM +/- 10) ---
    // Find closest match to ATM in the filtered list
    let atmIndex = -1;
    let minDiff = Infinity;
    
    displayRows.forEach((r, i) => {
        const diff = Math.abs(r.strike - atmStrike);
        if (diff < minDiff) {
            minDiff = diff;
            atmIndex = i;
        }
    });

    if (atmIndex !== -1) {
        const start = Math.max(0, atmIndex - 10);
        const end = Math.min(displayRows.length, atmIndex + 11); // +11 because slice end is exclusive
        displayRows = displayRows.slice(start, end);
    }

    // --- 3. RENDER ---
    const rng = getColumnRanges(displayRows);
    const activeClass = majorStrikesOn ? 'active' : '';
    const btnText = majorStrikesOn ? 'ALL STRIKES' : 'MAJOR STRIKES';
    
    const controlsHtml = `
        <div class="greeks-controls">
            <div class="expiry-tabs"><button class="expiry-btn active">Current Expiry</button></div>
            <div class="control-separator"></div>
            <span class="control-label">show</span>
            <div class="toggle-container">
                <button id="btn-major-strikes" class="major-strikes-btn ${activeClass}">${btnText}</button>
            </div>
        </div>
    `;

    const tableRows = displayRows.map(r => {
        const isATM = Math.abs(r.strike - atmStrike) < 1; // Tolerance check
        const rowClass = isATM ? 'row-atm' : '';
        const C = r.call || {}; 
        const P = r.put || {};
        const fmt = (v, f) => (v !== undefined && v !== null) ? v.toFixed(f) : '-';

        return `
            <tr class="${rowClass}">
                ${renderCombinedOI(C.oi, C.oiChg)}
                <td style="background:${getBgColor(C.greeks?.gamma, rng.gamma.min, rng.gamma.max, true)}">${fmt(C.greeks?.gamma, 4)}</td>
                <td>${fmt(C.greeks?.vega, 1)}</td>
                <td>${fmt(C.greeks?.theta, 1)}</td>
                <td style="background:${getBgColor(C.greeks?.delta, rng.delta.min, rng.delta.max, true)}">${fmt(C.greeks?.delta, 2)}</td>
                <td>${fmt(C.iv, 1)}</td>
                <td class="col-strike">${r.strike}</td>
                <td>${fmt(P.iv, 1)}</td>
                <td style="background:${getBgColor(P.greeks?.delta, rng.delta.min, rng.delta.max, false)}">${fmt(P.greeks?.delta, 2)}</td>
                <td>${fmt(P.greeks?.theta, 1)}</td>
                <td>${fmt(P.greeks?.vega, 1)}</td>
                <td style="background:${getBgColor(P.greeks?.gamma, rng.gamma.min, rng.gamma.max, false)}">${fmt(P.greeks?.gamma, 4)}</td>
                ${renderCombinedOI(P.oi, P.oiChg)}
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        ${controlsHtml}
        <div class="greeks-table-wrapper">
            <table class="greeks-table">
                <thead>
                    <tr>
                        <th colspan="6" style="border-bottom:2px solid #4CAF50; color:#4CAF50;">CALLS</th>
                        <th rowspan="2" style="background:#111; color:#fff; border-left:1px solid #333; border-right:1px solid #333;">Strike</th>
                        <th colspan="6" style="border-bottom:2px solid #A32727; color:#A32727;">PUTS</th>
                    </tr>
                    <tr>
                        <th>OI</th><th>Gamma</th><th>Vega</th><th>Theta</th><th>Delta</th><th>IV%</th>
                        <th>IV%</th><th>Delta</th><th>Theta</th><th>Vega</th><th>Gamma</th><th>OI</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    `;

    const btn = document.getElementById('btn-major-strikes');
    if(btn) btn.onclick = () => { majorStrikesOn = !majorStrikesOn; renderGreeksTable(containerId, data); };
}
