import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    // UNIFORM MARGINS
    margin: { t: 20, b: 30, l: 40, r: 40 },
};

function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    const styleOn = `background: rgba(0, 230, 118, 0.15); color: #00E676; border-color: rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.15); color: #FF5252; border-color: rgba(255,82,82,0.3);`;
    
    inp.innerHTML = `
        <button id="term-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            MONTHLY
        </button>
    `;

    leg.innerHTML = `
        <div style="display:flex; gap:12px; font-size:10px; color:#ccc;">
            <div class="leg-item"><span style="background:#FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly</div>
            ${showMonthly ? `<div class="leg-item"><span style="background:#42A5F5; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Monthly</div>` : ''}
        </div>
    `;

    document.getElementById('term-toggle-btn').onclick = () => {
        renderTermChart('chart-canvas', !showMonthly);
    };
}

export function renderTermChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    const traces = [
        { 
            x: mockData.term.expiries, y: mockData.term.weekly, 
            mode: 'lines+markers', name: 'Wk', // Added markers to match theme
            line: { color: '#FF9800', width: 2 }, 
            marker: { size: 4 },
            type: 'scatter' 
        }
    ];
    
    if (showMonthly) {
        traces.push({ 
            x: mockData.term.expiries, y: mockData.term.monthly, 
            mode: 'lines+markers', name: 'Mo', 
            line: { color: '#42A5F5', width: 2 }, 
            marker: { size: 4 },
            type: 'scatter' 
        });
    }

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { 
            showgrid: false, 
            fixedrange: true, 
            tickfont: { color: '#fff', size: 10 }, // White ticks
            title: '' // No Axis Title
        },
        yaxis: { 
            gridcolor: '#1f1f1f', 
            fixedrange: true,
            range: getGlobalIVRange(), 
            tickfont: { color: '#fff', size: 10 }, // White ticks
            title: '' // No Axis Title
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
