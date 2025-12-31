import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 40 },
};

function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    const commonStyle = 'width: 80px; text-align: center; border-radius: 4px; font-weight: 600; font-size: 10px; cursor: pointer; transition: all 0.2s; outline: none;';

    const styleOn = `$(commonStyle) background: #42A5F5; color: #fff; border: 1px solid #42A5F5;`;
    const styleOff = `$(commonStyle) background: #fff; color: #42A5F5; border: 1px solid #42A5F5;`;

    inp.innerHTML = `
        <button id="term-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            ${showMonthly ? 'MONTHLY' : 'WEEKLY'}
        </button>
    `;

    // UPDATED LEGEND
    leg.innerHTML = `
        <div style="display:flex; gap:12px; font-size:10px; color:#ccc;">
            <div class="leg-item"><span style="background:#FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly</div>
            <div class="leg-item" style="opacity:${showMonthly ? 1 : 0.5}"><span style="background:#42A5F5; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Monthly</div>
            <div class="leg-item"><span style="border-bottom:2px dashed #FFF; width:12px; margin-right:4px;"></span>India VIX</div>
        </div>
    `;

    document.getElementById('term-toggle-btn').onclick = () => {
        renderTermChart('chart-canvas', !showMonthly);
    };
}

export function renderTermChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    // 1. Weekly Trace
    const traceWk = { 
        x: mockData.term.expiries, y: mockData.term.weekly, 
        mode: 'lines+markers', name: 'Wk', 
        line: { color: '#FF9800', width: 2 }, marker: { size: 4 },
        type: 'scatter' 
    };

    // 2. India VIX Trace (Secondary Axis Y2)
    // Horizontal Line across all expiries
    const vixVal = mockData.spotVix;
    const traceVix = {
        x: [mockData.term.expiries[0], mockData.term.expiries[mockData.term.expiries.length - 1]],
        y: [vixVal, vixVal],
        mode: 'lines', name: 'India VIX',
        yaxis: 'y2', // Map to Right Axis
        line: { color: '#fff', width: 1.5, dash: 'dash' },
        type: 'scatter'
    };

    const traces = [traceWk, traceVix];
    
    if (showMonthly) {
        traces.push({ 
            x: mockData.term.expiries, y: mockData.term.monthly, 
            mode: 'lines+markers', name: 'Mo', 
            line: { color: '#42A5F5', width: 2 }, marker: { size: 4 },
            type: 'scatter' 
        });
    }

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { 
            showgrid: false, fixedrange: true, 
            tickfont: { color: '#fff', size: 10 }
        },
        yaxis: { 
            gridcolor: '#1f1f1f', fixedrange: true,
            range: getGlobalIVRange(), 
            tickfont: { color: '#fff', size: 10 }
        },
        // SECONDARY Y-AXIS (VIX)
        yaxis2: {
            overlaying: 'y',
            side: 'right',
            // Typically VIX range is similar to IV, but we let it be auto or same
            range: getGlobalIVRange(), 
            showgrid: false,
            tickfont: { color: '#888', size: 9 }
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
