import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_CLEAN = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 40 }, 
};

// --- SYMMETRY HELPER ---
function getSymmetricRange(dataArr) {
    // Find the largest absolute value to ensure 0 is centered
    const maxVal = Math.max(...dataArr);
    const minVal = Math.min(...dataArr);
    const limit = Math.ceil(Math.max(Math.abs(maxVal), Math.abs(minVal)));
    
    // Add a small buffer (e.g. 0.5)
    return [-limit - 0.5, limit + 0.5];
}

function generateManualTicks(range) {
    // Generate ticks based on the symmetric range
    const start = range[0];
    const end = range[1];
    let vals = [];
    let text = [];
    
    for (let i = start; i <= end; i += 0.5) { // Step 0.5
        // Only show integer ticks or significant halves to avoid clutter
        if (i % 1 === 0 || i === 0) {
            const val = parseFloat(i.toFixed(1)); 
            vals.push(val);
            const sign = val > 0 ? '+' : (val === 0 ? ' ' : ''); 
            const str = `   ${sign}${val.toFixed(0)}`; // Show integers
            text.push(str);
        }
    }
    return { vals, text };
}

export function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    const ctr = document.getElementById('dynamicCenterControls');
    if(!leg || !inp || !ctr) return;

    ctr.innerHTML = ''; // Clear Center

    // LEGENDS
    leg.innerHTML = `
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box" style="border:none; background:#333; height:10px; width:10px; opacity:0.5"></div>Skew</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#00E676; border-top-style:solid"></div>Wk Call</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#FF5252; border-top-style:solid"></div>Wk Put</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#00E676; border-top-style:dotted"></div>Mo Call</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#FF5252; border-top-style:dotted"></div>Mo Put</div>
    `;

    // BUTTON (Default Monthly ON)
    const styleOn = `background: rgba(0, 230, 118, 0.2); color: #00E676; border: 1px solid rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255,82,82,0.3);`;
    
    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap: 8px; font-size: 10px; color: #888;">
            <button id="skew-toggle-btn" style="border:none; width:70px; height:24px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; outline:none; ${showMonthly ? styleOn : styleOff}">
                Monthly
            </button>
            <span>is ${showMonthly ? 'ON' : 'OFF'}</span>
        </div>
    `;
    document.getElementById('skew-toggle-btn').onclick = () => renderSkewChart('chart-skew', !showMonthly);
}

export function renderSkewChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    const traces = [
        // Skew Bar (Y2)
        { x: mockData.strikes, y: mockData.skew.spread, name: 'Skew', type: 'bar', marker: { color: '#222', opacity: 0.5 }, yaxis: 'y2', hoverinfo: 'y' },
        // Weekly Lines (Y1)
        { x: mockData.strikes, y: mockData.skew.call, name: 'Wk Call', line: { color: '#00E676', width: 2 }, type: 'scatter', mode: 'lines' },
        { x: mockData.strikes, y: mockData.skew.put, name: 'Wk Put', line: { color: '#FF5252', width: 2 }, type: 'scatter', mode: 'lines' }
    ];

    // Monthly Lines (Y1) - Only if True
    if (showMonthly) {
        traces.push(
            { x: mockData.strikes, y: mockData.skewMo.call, name: 'Mo Call', line: { color: '#00E676', dash:'dot', width: 2 }, type: 'scatter' },
            { x: mockData.strikes, y: mockData.skewMo.put, name: 'Mo Put', line: { color: '#FF5252', dash:'dot', width: 2 }, type: 'scatter' }
        );
    }

    const globalRange = getGlobalIVRange();
    
    // CALCULATE SYMMETRIC RANGE FOR Y2
    const y2Range = getSymmetricRange(mockData.skew.spread);
    const y2Ticks = generateManualTicks(y2Range);

    const layout = {
        ...LAYOUT_CLEAN,
        showlegend: false,
        xaxis: { showgrid: false, fixedrange: true, tickfont: { color: '#fff', size: 10 } },
        
        // RIGHT AXIS (Skew)
        yaxis2: { 
            side: 'right', showgrid: false, fixedrange: true, overlaying: null, 
            
            // Force Range to be Symmetric around 0
            range: y2Range, 
            autorange: false,
            
            tickmode: 'array', tickvals: y2Ticks.vals, ticktext: y2Ticks.text,
            tickfont: { color: '#fff', size: 9 }, automargin: true
        },

        // LEFT AXIS (IV)
        yaxis: { 
            // FAINT GRID
            gridcolor: '#1f1f1f', 
            fixedrange: true, 
            range: globalRange, autorange: false, dtick: 1.0,           
            overlaying: 'y2', side: 'left',
            ticks: 'outside', ticklen: 8, tickcolor: 'rgba(0,0,0,0)', tickfont: { color: '#fff', size: 10 }
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
