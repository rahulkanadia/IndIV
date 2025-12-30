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
        <button id="skew-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            MONTHLY
        </button>
    `;

    leg.innerHTML = `
        <div style="display:flex; gap:15px; font-size:10px; color:#ccc;">
            <div class="leg-item"><span style="background:#FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Wk Skew</div>
            ${showMonthly ? `<div class="leg-item"><span style="background:#42A5F5; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Mo Skew</div>` : ''}
            <div class="leg-item"><span style="background:#555; width:6px; height:6px; margin-right:4px;"></span>Spread</div>
        </div>
    `;

    document.getElementById('skew-toggle-btn').onclick = () => {
        renderSkewChart('chart-canvas', !showMonthly);
    };
}

export function renderSkewChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    // 1. BAR CHART (SKEW SPREAD) - Secondary Axis
    // We put this first so lines draw ON TOP of bars
    const traceBars = {
        x: mockData.skew.strikes,
        y: mockData.skew.skewBars,
        type: 'bar',
        name: 'Spread',
        yaxis: 'y2', // Map to right axis
        marker: {
            color: mockData.skew.skewBars.map(v => v >= 0 ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 82, 82, 0.3)'),
            line: { width: 0 }
        }
    };

    // 2. LINE CHARTS (VOLATILITY) - Primary Axis
    const traces = [traceBars];

    traces.push({ 
        x: mockData.skew.strikes, y: mockData.skew.weekly, 
        mode: 'lines+markers', name: 'Wk', 
        line: { color: '#FF9800', width: 2, shape: 'spline' },
        marker: { size: 4 }
    });

    if (showMonthly) {
        traces.push({ 
            x: mockData.skew.strikes, y: mockData.skew.monthly, 
            mode: 'lines+markers', name: 'Mo', 
            line: { color: '#42A5F5', width: 2, shape: 'spline' },
            marker: { size: 4 }
        });
    }

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { 
            title: '', 
            showgrid: false, 
            gridcolor: '#222', 
            tickfont: { color: '#fff', size: 10 } // White ticks
        },
        yaxis: { 
            title: '', 
            gridcolor: '#1f1f1f', 
            range: getGlobalIVRange(),
            tickfont: { color: '#fff', size: 10 } // White ticks
        },
        // SECONDARY Y-AXIS (Right Side)
        yaxis2: {
            title: '',
            overlaying: 'y',
            side: 'right',
            range: [-5, 5], // Symmetric range keeps 0 in middle
            showgrid: false,
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.2)',
            tickfont: { color: '#888', size: 9 } // Grey ticks for secondary to distinguish
        },
        barmode: 'relative',
        bargap: 0.5
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
