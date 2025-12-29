import { mockData, getGlobalIVRange } from '../../../mockdata.js';

// ... (Constants and Helper Functions remain the same) ...
const LAYOUT_CLEAN = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 40 }, 
};

function generateManualTicks(dataArr, step) {
    const min = Math.floor(Math.min(...dataArr));
    const max = Math.ceil(Math.max(...dataArr));
    let vals = [];
    let text = [];
    for (let i = min; i <= max; i += step) {
        const val = parseFloat(i.toFixed(1)); 
        vals.push(val);
        const sign = val > 0 ? '+' : (val === 0 ? ' ' : ''); 
        const str = `   ${sign}${val.toFixed(1)}`; 
        text.push(str);
    }
    return { vals, text };
}

export function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    const ctr = document.getElementById('dynamicCenterControls');
    if(!leg || !inp || !ctr) return;

    // Clear Center (Used by Surface only)
    ctr.innerHTML = '';

    // 1. LEGENDS (Always Show All)
    leg.innerHTML = `
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box" style="border:none; background:#333; height:10px; width:10px; opacity:0.5"></div>Skew</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#00E676; border-top-style:solid"></div>Wk Call</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#FF5252; border-top-style:solid"></div>Wk Put</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#00E676; border-top-style:dotted"></div>Mo Call</div>
        <div class="leg-item" style="display:flex; align-items:center"><div class="line-box l-thick" style="border-color:#FF5252; border-top-style:dotted"></div>Mo Put</div>
    `;

    // 2. INPUTS (Monthly Toggle)
    const styleOn = `background: rgba(0, 230, 118, 0.2); color: #00E676; border: 1px solid rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255,82,82,0.3);`;
    
    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap: 8px; font-size: 10px; color: #888;">
            <span>Click to toggle</span>
            <button id="skew-toggle-btn" style="border:none; width:70px; height:24px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; outline:none; ${showMonthly ? styleOn : styleOff}">
                Monthly
            </button>
        </div>
    `;

    document.getElementById('skew-toggle-btn').onclick = () => renderSkewChart('chart-skew', !showMonthly);
}

export function renderSkewChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    const traces = [
        { x: mockData.strikes, y: mockData.skew.spread, name: 'Skew', type: 'bar', marker: { color: '#222', opacity: 0.5 }, yaxis: 'y2', hoverinfo: 'y' },
        { x: mockData.strikes, y: mockData.skew.call, name: 'Wk Call', line: { color: '#00E676', width: 2 }, type: 'scatter', mode: 'lines' },
        { x: mockData.strikes, y: mockData.skew.put, name: 'Wk Put', line: { color: '#FF5252', width: 2 }, type: 'scatter', mode: 'lines' }
    ];

    if (showMonthly) {
        traces.push(
            { x: mockData.strikes, y: mockData.skewMo.call, name: 'Mo Call', line: { color: '#00E676', dash:'dot', width: 2 }, type: 'scatter' },
            { x: mockData.strikes, y: mockData.skewMo.put, name: 'Mo Put', line: { color: '#FF5252', dash:'dot', width: 2 }, type: 'scatter' }
        );
    }

    const globalRange = getGlobalIVRange();
    const y2Ticks = generateManualTicks(mockData.skew.spread, 0.5);

    const layout = {
        ...LAYOUT_CLEAN,
        showlegend: false,
        xaxis: { showgrid: false, fixedrange: true, tickfont: { color: '#fff', size: 10 } },
        yaxis2: { 
            side: 'right', showgrid: false, fixedrange: true, overlaying: null, 
            tickmode: 'array', tickvals: y2Ticks.vals, ticktext: y2Ticks.text,
            tickfont: { color: '#fff', size: 9 }, automargin: true
        },
        yaxis: { 
            gridcolor: '#222', fixedrange: true, 
            range: globalRange, autorange: false, dtick: 1.0,           
            overlaying: 'y2', side: 'left',
            ticks: 'outside', ticklen: 8, tickcolor: 'rgba(0,0,0,0)', tickfont: { color: '#fff', size: 10 }
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
