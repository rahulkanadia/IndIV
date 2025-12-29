import { mockData } from '../../../mockdata.js';

const LAYOUT_CLEAN = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    dragmode: false
};

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

    const range = getSmartRange([mockData.skew.call, mockData.skew.put, mockData.skewMo.call]);

    const layout = {
        ...LAYOUT_CLEAN,
        showlegend: false,
        margin: { t: 20, b: 30, l: 40, r: 40 },
        xaxis: { 
            showgrid: false, 
            fixedrange: true, 
            tickfont: { color: '#fff', size: 10 } 
        },
        yaxis2: { 
            side: 'right', 
            showgrid: false, 
            fixedrange: true,
            overlaying: null, 
            
            // --- ALIGNMENT FIX ---
            tickformat: '+.1f',  // Crucial: Makes positive numbers same width as negative numbers
            
            // --- SPACING FIX ---
            ticks: 'outside',    // Activates spacing calculation
            ticklen: 0,          // Hides the tick mark line
            standoff: 10,        // Pushes text 10px away
            
            tickfont: { color: '#888', size: 9 },
            automargin: true
        },
        yaxis: { 
            gridcolor: '#222', 
            fixedrange: true, 
            range: range,
            overlaying: 'y2', 
            side: 'left',
            
            // --- SPACING FIX (Left Side) ---
            ticks: 'outside',
            ticklen: 0,
            standoff: 10
        }
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
