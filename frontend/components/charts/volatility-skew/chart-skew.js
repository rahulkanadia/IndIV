import { mockData } from '../../../mockdata.js';

const LAYOUT_CLEAN = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    dragmode: false
};

// --- NEW HELPER: Generates Manual Ticks & Strings ---
function generateManualTicks(dataArr, step) {
    const min = Math.floor(Math.min(...dataArr));
    const max = Math.ceil(Math.max(...dataArr));
    
    let vals = [];
    let text = [];
    
    // Generate ticks from min to max by step (e.g., 0.5)
    for (let i = min; i <= max; i += step) {
        // Fix float precision issues (e.g. 0.3000004)
        const val = parseFloat(i.toFixed(1)); 
        vals.push(val);
        
        // Format: Sign + 1 Decimal + Leading Spaces for Padding
        // Example: "   +1.0" or "   -0.5"
        const sign = val > 0 ? '+' : (val === 0 ? ' ' : ''); // Align 0 with +
        const str = `   ${sign}${val.toFixed(1)}`; 
        text.push(str);
    }
    return { vals, text };
}

function getSmartRange(dataArrays) {
    let all = [];
    dataArrays.forEach(arr => all.push(...arr));
    const minV = Math.min(...all);
    const maxV = Math.max(...all);
    return [minV - 1.0, maxV + 1.0];
}

export function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    // Reset Layout
    inp.style.display = 'flex'; 
    leg.style.width = 'auto';
    leg.style.flex = 'initial';

    leg.innerHTML = `
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box" style="border:none; background:#333; height:10px; width:10px; opacity:0.5"></div>Skew</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#00E676; border-top-style:solid"></div>Weekly ATM Call</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#FF5252; border-top-style:solid"></div>Weekly ATM Put</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#00E676; border-top-style:dotted"></div>Monthly ATM Call</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#FF5252; border-top-style:dotted"></div>Monthly ATM Put</div>
    `;
    inp.innerHTML = '';
    const lbl = document.createElement('label');
    lbl.style.display = 'flex'; lbl.style.alignItems = 'center'; lbl.style.gap = '4px'; lbl.style.cursor = 'pointer';
    lbl.innerHTML = `<input type="checkbox" ${showMonthly ? 'checked' : ''}> Show Monthly`;
    lbl.querySelector('input').onchange = (e) => renderSkewChart('chart-skew', e.target.checked);
    inp.appendChild(lbl);
}

export function renderSkewChart(containerId, showMonthly) {
    const traces = [
        { 
            x: mockData.strikes, 
            y: mockData.skew.spread, 
            name: 'Skew', 
            type: 'bar', 
            marker: { color: '#222', opacity: 0.5 }, 
            yaxis: 'y2', 
            hoverinfo: 'y' 
        },
        { x: mockData.strikes, y: mockData.skew.call, name: 'Wk Call', line: { color: '#00E676', width: 2 }, type: 'scatter', mode: 'lines' },
        { x: mockData.strikes, y: mockData.skew.put, name: 'Wk Put', line: { color: '#FF5252', width: 2 }, type: 'scatter', mode: 'lines' }
    ];

    if (showMonthly) {
        traces.push(
            { x: mockData.strikes, y: mockData.skewMo.call, name: 'Mo Call', line: { color: '#00E676', dash:'dot', width: 2 }, type: 'scatter' },
            { x: mockData.strikes, y: mockData.skewMo.put, name: 'Mo Put', line: { color: '#FF5252', dash:'dot', width: 2 }, type: 'scatter' }
        );
    }

    const range = getSmartRange([mockData.skew.call, mockData.skew.put, mockData.skewMo.call]);

    // --- GENERATE MANUAL TICKS FOR Y2 ---
    // Step 0.5 ensures we get -1.0, -0.5, 0.0, +0.5, etc.
    const y2Ticks = generateManualTicks(mockData.skew.spread, 0.5);

    const layout = {
        ...LAYOUT_CLEAN,
        showlegend: false,
        margin: { t: 20, b: 30, l: 40, r: 40 }, 
        
        xaxis: { 
            showgrid: false, 
            fixedrange: true, 
            tickfont: { color: '#fff', size: 10 } 
        },
        
        // --- RIGHT AXIS (MANUAL OVERRIDE) ---
        yaxis2: { 
            side: 'right', 
            showgrid: false, 
            fixedrange: true,
            overlaying: null, 
            
            // 1. FORCE MANUAL TICKS
            tickmode: 'array',
            tickvals: y2Ticks.vals,  // e.g. [0.5, 1.0]
            ticktext: y2Ticks.text,  // e.g. ["   +0.5", "   +1.0"] (Includes Spacing!)
            
            tickfont: { color: '#888', size: 9 },
            automargin: true
        },
        
        // --- LEFT AXIS ---
        yaxis: { 
            gridcolor: '#222', 
            fixedrange: true, 
            range: range,
            overlaying: 'y2', 
            side: 'left',
            standoff: 10,
            tickfont: { color: '#666', size: 10 }
        }
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
