import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 20 },
};

function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    const styleOn = `background: rgba(0, 230, 118, 0.15); color: #00E676; border-color: rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.15); color: #FF5252; border-color: rgba(255,82,82,0.3);`;

    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
            <button id="skew-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
                MONTHLY
            </button>
            <span style="color:#666; font-size:10px;">${showMonthly ? 'ON' : 'OFF'}</span>
        </div>
    `;

    leg.innerHTML = `
        <div style="display:flex; gap:15px;">
            <div class="leg-item"><span style="background:#FF9800; width:8px; height:8px; border-radius:50%; margin-right:6px;"></span>Weekly Curve</div>
            <div class="leg-item" style="opacity:${showMonthly ? 1 : 0.5}">
                <span style="background:#42A5F5; width:8px; height:8px; border-radius:50%; margin-right:6px;"></span>Monthly Curve
            </div>
        </div>
    `;

    document.getElementById('skew-toggle-btn').onclick = () => {
        renderSkewChart('chart-canvas', !showMonthly);
    };
}

export function renderSkewChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    const traces = [
        { 
            x: mockData.skew.strikes, y: mockData.skew.weekly, 
            mode: 'lines+markers', name: 'Wk', line: { color: '#FF9800', width: 2, shape: 'spline' } 
        }
    ];

    if (showMonthly) {
        traces.push({ 
            x: mockData.skew.strikes, y: mockData.skew.monthly, 
            mode: 'lines+markers', name: 'Mo', line: { color: '#42A5F5', width: 2, shape: 'spline' } 
        });
    }

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { 
            title: 'Strike Price', titlefont: {size:10, color:'#666'},
            showgrid: false, gridcolor: '#222', 
            tickfont: { color: '#888' }
        },
        yaxis: { 
            gridcolor: '#1f1f1f', 
            range: getGlobalIVRange(),
            tickfont: { color: '#888' }
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
