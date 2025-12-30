import { mockData, getGlobalIVRange } from '../../../mockdata.js';

// UNIFORM LAYOUT (Applied to all charts for consistent plot area)
const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    // FIXED MARGINS: l/r=40 ensures alignment with Term/Skew charts
    margin: { t: 20, b: 30, l: 40, r: 40 },
};

function generateFullDayTimeArray() {
    const times = [];
    let h = 9, m = 15;
    while (h < 15 || (h === 15 && m <= 30)) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
        m += 15;
        if (m === 60) { m = 0; h++; }
    }
    return times;
}

// HELPER: Create text array with only the last value populated
function getLastValueText(dataArray) {
    return dataArray.map((val, i) => 
        i === dataArray.length - 1 ? val.toFixed(1) : ''
    );
}

// LEGEND UPDATE (Matches specific legend requirements)
export function updateLegend(showMonthly) {
    // Note: Intraday chart legend is static in the UI or handled by the chart toggles,
    // but we update the external controls here if needed.
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    // Toggle Button
    const styleOn = `background: rgba(0, 230, 118, 0.15); color: #00E676; border-color: rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.15); color: #FF5252; border-color: rgba(255,82,82,0.3);`;

    inp.innerHTML = `
        <button id="intra-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            MONTHLY
        </button>
    `;
    
    // Custom Legend Display
    leg.innerHTML = `
        <div style="display:flex; gap:12px; font-size:10px; color:#ccc;">
            <div class="leg-item"><span style="background:#FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly IV</div>
            <div class="leg-item"><span style="border:1px dotted #FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly RV</div>
            ${showMonthly ? `<div class="leg-item"><span style="background:#42A5F5; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Monthly IV</div>` : ''}
            ${showMonthly ? `<div class="leg-item"><span style="border:1px dotted #42A5F5; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Monthly RV</div>` : ''}
        </div>
    `;

    document.getElementById('intra-toggle-btn').onclick = () => {
        renderIntradayChart('chart-canvas', !showMonthly);
    };
}

export function renderIntradayChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;
    
    const d = mockData.intraday;
    const fullTimeline = generateFullDayTimeArray();
    const activeTime = d.time; 

    // CONFIG: Lines + Markers + Text (Last Value)
    const mode = 'lines+markers+text';
    const textPos = 'top right';
    const markerSize = 4;

    const traces = [];

    // 1. Weekly IV
    traces.push({
        x: activeTime, y: d.wk,
        type: 'scatter', mode: mode, name: 'Weekly IV',
        line: { color: '#FF9800', width: 2 },
        marker: { size: markerSize },
        text: getLastValueText(d.wk), textposition: textPos, textfont: { color: '#FF9800', size: 10 }
    });

    // 2. Weekly RV
    traces.push({
        x: activeTime, y: d.wkRv,
        type: 'scatter', mode: mode, name: 'Weekly RV',
        line: { color: '#FF9800', width: 1.5, dash: 'dot' },
        marker: { size: markerSize, symbol: 'circle-open' },
        text: getLastValueText(d.wkRv), textposition: 'bottom right', textfont: { color: '#FF9800', size: 10 }
    });

    if (showMonthly) {
        // 3. Monthly IV
        traces.push({
            x: activeTime, y: d.mo,
            type: 'scatter', mode: mode, name: 'Monthly IV',
            line: { color: '#42A5F5', width: 2 },
            marker: { size: markerSize },
            text: getLastValueText(d.mo), textposition: textPos, textfont: { color: '#42A5F5', size: 10 }
        });
        // 4. Monthly RV
        traces.push({
            x: activeTime, y: d.moRv,
            type: 'scatter', mode: mode, name: 'Monthly RV',
            line: { color: '#42A5F5', width: 1.5, dash: 'dot' },
            marker: { size: markerSize, symbol: 'circle-open' },
            text: getLastValueText(d.moRv), textposition: 'bottom right', textfont: { color: '#42A5F5', size: 10 }
        });
    }

    const globalRange = getGlobalIVRange();

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: {
            type: 'category',
            categoryorder: 'array',
            categoryarray: fullTimeline,
            tickmode: 'array',
            tickvals: fullTimeline.filter((_, i) => i % 8 === 0), // Spread ticks to prevent overlap
            fixedrange: true,
            showgrid: false,
            tickfont: { color: '#fff', size: 10 },
            title: '' // No Axis Title
        },
        yaxis: {
            gridcolor: '#1f1f1f',
            fixedrange: true,
            range: globalRange, 
            tickfont: { color: '#fff', size: 10 },
            title: '' // No Axis Title
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
