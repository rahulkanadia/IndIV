import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 20 },
};

export function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    const ctr = document.getElementById('dynamicCenterControls');
    if(!leg || !inp || !ctr) return;

    ctr.innerHTML = ''; 

    // RIGHT LEGEND
    leg.innerHTML = `
        <div class="leg-item" style="display:flex; align-items:center; margin-right:15px"><span class="leg-dot" style="background:#FF9800; display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:4px;"></span>Weekly</div> 
        <div class="leg-item" style="display:flex; align-items:center"><span class="leg-dot" style="background:#42A5F5; display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:4px;"></span>Monthly</div>
    `;

    // LEFT BUTTON
    const styleOn = `background: rgba(0, 230, 118, 0.2); color: #00E676; border: 1px solid rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255,82,82,0.3);`;
    
    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap: 8px; font-size: 10px; color: #888;">
            <button id="term-toggle-btn" style="border:none; width:70px; height:24px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; outline:none; ${showMonthly ? styleOn : styleOff}">
                Monthly
            </button>
            <span>is ${showMonthly ? 'ON' : 'OFF'}</span>
        </div>
    `;

    document.getElementById('term-toggle-btn').onclick = () => {
        renderTermChart('chart-term', !showMonthly);
    };
}

export function renderTermChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    const traces = [
        { x: mockData.term.expiries, y: mockData.term.weekly, name: 'Wk', line: { color: '#FF9800' }, type: 'scatter' }
    ];
    if (showMonthly) {
        traces.push(
            { x: mockData.term.expiries, y: mockData.term.monthly, name: 'Mo', line: { color: '#42A5F5' }, type: 'scatter' }
        );
    }

    const globalRange = getGlobalIVRange();

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { showgrid: false, fixedrange: true, tickfont: { color: '#fff', size: 10 } },
        yaxis: { 
            // FAINT GRID
            gridcolor: '#1f1f1f', 
            fixedrange: true,
            range: globalRange, autorange: false, dtick: 1.0,           
            tickformat: '.1f', ticks: 'outside', ticklen: 8, tickcolor: 'rgba(0,0,0,0)', tickfont: { color: '#fff', size: 10 }
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
