import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_CLEAN = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false
};

// --- HELPER: Generates Manual Ticks for Right Axis ---
function generateManualTicks(dataArr, step) {
    const min = Math.floor(Math.min(...dataArr));
    const max = Math.ceil(Math.max(...dataArr));

    let vals = [];
    let text = [];

    for (let i = min; i <= max; i += step) {
        const val = parseFloat(i.toFixed(1)); 
        vals.push(val);
        // Align 0 with + and add spacing
        const sign = val > 0 ? '+' : (val === 0 ? ' ' : ''); 
        const str = `   ${sign}${val.toFixed(1)}`; 
        text.push(str);
    }
    return { vals, text };
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
        // 1. BAR TRACE (Assigned to y2)
        { 
            x: mockData.strikes, 
            y: mockData.skew.spread, 
            name: 'Skew', 
            type: 'bar', 
            marker: { color: '#222', opacity: 0.5 }, 
            yaxis: 'y2', 
            hoverinfo: 'y' 
        },
        // 2. LINE TRACES (Assigned to y - Primary)
        { x: mockData.strikes, y: mockData.skew.call, name: 'Wk Call', line: { color: '#00E676', width: 2 }, type: 'scatter', mode: 'lines' },
        { x: mockData.strikes, y: mockData.skew.put, name: 'Wk Put', line: { color: '#FF5252', width: 2 }, type: 'scatter', mode: 'lines' }
    ];

    if (showMonthly) {
        traces.push(
            { x: mockData.strikes, y: mockData.skewMo.call, name: 'Mo Call', line: { color: '#00E676', dash:'dot', width: 2 }, type: 'scatter' },
            { x: mockData.strikes, y: mockData.skewMo.put, name: 'Mo Put', line: { color: '#FF5252', dash:'dot', width: 2 }, type: 'scatter' }
        );
    }

    // 1. GET GLOBAL RANGE (Ensures Min/Max match Term Chart)
    const globalRange = getGlobalIVRange();

    // 2. GENERATE MANUAL TICKS FOR Y2
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
            tickmode: 'array',
            tickvals: y2Ticks.vals,
            ticktext: y2Ticks.text,
            tickfont: { color: '#fff', size: 9 },
            automargin: true
        },

        // --- LEFT AXIS (SYNCED) ---
        yaxis: { 
            gridcolor: '#222', 
            fixedrange: true, 
            
            // 3. STRICT SCALING
            range: globalRange,
            autorange: false,
            dtick: 1.0,           // Forces 1.0 step size (Matches Term Chart)
            
            overlaying: 'y2', 
            side: 'left',
            
            // 4. VISUAL ALIGNMENT
            ticks: 'outside',
            ticklen: 8,
            tickcolor: 'rgba(0,0,0,0)', // Invisible padding
            tickfont: { color: '#fff', size: 10 }
        }
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
