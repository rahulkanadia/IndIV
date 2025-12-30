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

    const styleOn = `background: rgba(0, 230, 118, 0.15); color: #00E676; border-color: rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.15); color: #FF5252; border-color: rgba(255,82,82,0.3);`;

    inp.innerHTML = `
        <button id="skew-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            MONTHLY
        </button>
    `;

    // UPDATED LEGEND ITEMS
    leg.innerHTML = `
        <div style="display:flex; gap:15px; font-size:10px; color:#ccc;">
            <div class="leg-item"><span style="background:#FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly Skew</div>
            <div class="leg-item" style="opacity:${showMonthly ? 1 : 0.5}"><span style="background:#42A5F5; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Monthly Skew</div>
            <div class="leg-item"><span style="background:#555; width:6px; height:6px; margin-right:4px;"></span>Spread (IV - ATM)</div>
            <div class="leg-item"><span style="border-bottom:2px dashed #9C27B0; width:12px; margin-right:4px;"></span>Risk Reversal</div>
        </div>
    `;

    document.getElementById('skew-toggle-btn').onclick = () => {
        renderSkewChart('chart-canvas', !showMonthly);
    };
}

export function renderSkewChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    // 1. CALCULATE BARS (IV - ATM)
    const wkData = mockData.skew.weekly;
    const atmIndex = Math.floor(wkData.length / 2);
    const atmIV = wkData[atmIndex];
    // Spread = Each Strike's IV minus the ATM IV
    const spreadBars = wkData.map(val => val - atmIV);

    // 2. RISK REVERSAL APPROXIMATION (Constant Line)
    // Low Strike IV (Put) - High Strike IV (Call)
    const riskReversalVal = wkData[0] - wkData[wkData.length - 1]; 

    // --- TRACES ---
    
    // Trace 1: Spread Bars (Secondary Axis)
    const traceBars = {
        x: mockData.skew.strikes,
        y: spreadBars,
        type: 'bar',
        name: 'Spread',
        yaxis: 'y2', 
        marker: {
            color: spreadBars.map(v => v >= 0 ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 82, 82, 0.2)'),
            line: { width: 0 }
        },
        hoverinfo: 'y'
    };

    // Trace 2: Risk Reversal Line (Secondary Axis)
    const traceRR = {
        x: [mockData.skew.strikes[0], mockData.skew.strikes[mockData.skew.strikes.length-1]], // Start to End
        y: [riskReversalVal, riskReversalVal],
        type: 'scatter',
        mode: 'lines',
        name: 'Risk Reversal',
        yaxis: 'y2',
        line: { color: '#9C27B0', width: 1, dash: 'dash' },
        hoverinfo: 'y'
    };

    // Trace 3: Weekly Skew (Primary Axis)
    const traceWk = { 
        x: mockData.skew.strikes, y: mockData.skew.weekly, 
        mode: 'lines+markers', name: 'Weekly Skew', 
        line: { color: '#FF9800', width: 2, shape: 'spline' },
        marker: { size: 4 }
    };

    const traces = [traceBars, traceRR, traceWk];

    if (showMonthly) {
        traces.push({ 
            x: mockData.skew.strikes, y: mockData.skew.monthly, 
            mode: 'lines+markers', name: 'Monthly Skew', 
            line: { color: '#42A5F5', width: 2, shape: 'spline' },
            marker: { size: 4 }
        });
    }

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { 
            showgrid: false, gridcolor: '#222', 
            tickfont: { color: '#fff', size: 10 } 
        },
        yaxis: { 
            gridcolor: '#1f1f1f', 
            range: getGlobalIVRange(),
            tickfont: { color: '#fff', size: 10 } 
        },
        // SECONDARY Y-AXIS (Spread & RR)
        yaxis2: {
            overlaying: 'y',
            side: 'right',
            range: [-5, 5], // Symmetric range
            showgrid: false,
            zeroline: true, zerolinecolor: 'rgba(255,255,255,0.1)',
            tickfont: { color: '#888', size: 9 } 
        },
        barmode: 'relative',
        bargap: 0.5
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
