import { mockData } from '../../../mockdata.js';

const LAYOUT_CLEAN = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    xaxis: { showgrid: false, fixedrange: true },
    yaxis: { gridcolor: '#222', fixedrange: true },
    dragmode: false
};

function getSmartRange(dataArrays) {
    let all = [];
    dataArrays.forEach(arr => all.push(...arr));
    const minV = Math.min(...all);
    const maxV = Math.max(...all);
    const pad = (maxV - minV) * 0.1; 
    return [minV - (pad||1.0), maxV + (pad||1.0)];
}

export function renderSkewChart(containerId, showMonthly) {
    const traces = [
        // 1. BAR TRACE FIRST (Bottom Layer)
        { 
            x: mockData.strikes, 
            y: mockData.skew.spread, 
            name: 'Skew', 
            type: 'bar', 
            marker: { color: '#222', opacity: 0.5 }, 
            yaxis: 'y2', 
            hoverinfo: 'y' 
        },
        // 2. LINE TRACES AFTER (Top Layer)
        { 
            x: mockData.strikes, 
            y: mockData.skew.call, 
            name: 'Wk Call', 
            line: { color: '#00E676', width: 2 }, 
            type: 'scatter', mode: 'lines' 
        },
        { 
            x: mockData.strikes, 
            y: mockData.skew.put, 
            name: 'Wk Put', 
            line: { color: '#FF5252', width: 2 }, 
            type: 'scatter', mode: 'lines' 
        }
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
        margin: { t: 10, b: 20, l: 30, r: 40 },
        yaxis: { ...LAYOUT_CLEAN.yaxis, range: range },
        yaxis2: { overlaying: 'y', side: 'right', showgrid: false, fixedrange: true } 
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });

    // Update Legends via DOM (Injects into the shared control bar)
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    
    // Only update if the 'skew' tab is active to avoid overwriting other tabs
    if(leg && inp && document.querySelector('[data-target="skew"].active')) {
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
        lbl.querySelector('input').onchange = (e) => renderSkewChart(containerId, e.target.checked);
        inp.appendChild(lbl);
    }
}
