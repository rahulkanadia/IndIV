import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 20 },
};

// Helper: Generates 15-min slots for 09:15 - 15:30
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

export function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    const ctr = document.getElementById('dynamicCenterControls');
    if(!leg || !inp || !ctr) return;

    ctr.innerHTML = ''; 

    // CUSTOM LEGENDS FOR INTRADAY (4 Items)
    // We use your standard palette: Wk=Orange, Mo=Blue
    // Solid = IV, Dotted = RV
    leg.innerHTML = `
        <div style="display:flex; gap:15px;">
            <div class="leg-item" style="display:flex; align-items:center;">
                <div style="width:12px; height:2px; background:#FF9800; margin-right:4px;"></div> Wk IV
            </div>
            <div class="leg-item" style="display:flex; align-items:center;">
                <div style="width:12px; height:2px; border-bottom:2px dotted #FF9800; margin-right:4px;"></div> Wk RV
            </div>

            <div class="leg-item" style="display:flex; align-items:center; opacity: ${showMonthly ? 1 : 0.5}">
                <div style="width:12px; height:2px; background:#42A5F5; margin-right:4px;"></div> Mo IV
            </div>
            <div class="leg-item" style="display:flex; align-items:center; opacity: ${showMonthly ? 1 : 0.5}">
                <div style="width:12px; height:2px; border-bottom:2px dotted #42A5F5; margin-right:4px;"></div> Mo RV
            </div>
        </div>
    `;

    // TOGGLE BUTTON (Exact style from Term Chart reference)
    const styleOn = `background: rgba(0, 230, 118, 0.2); color: #00E676; border: 1px solid rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255,82,82,0.3);`;

    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap: 8px; font-size: 10px; color: #888;">
            <button id="intra-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
                MONTHLY
            </button>
            <span>is ${showMonthly ? 'ON' : 'OFF'}</span>
        </div>
    `;

    document.getElementById('intra-toggle-btn').onclick = () => {
        renderIntradayChart('chart-canvas', !showMonthly); // Note: chart-dashboard uses 'chart-canvas' ID
    };
}

export function renderIntradayChart(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;
    
    // Data Source
    const intradayData = mockData.intraday;
    const fullTimeline = generateFullDayTimeArray();
    const activeTime = intradayData.time; 

    // TRACES
    const traces = [];

    // 1. Weekly IV (Always On)
    traces.push({
        x: activeTime, y: intradayData.wk,
        type: 'scatter', mode: 'lines', name: 'Wk IV',
        line: { color: '#FF9800', width: 2 }
    });

    // 2. Weekly RV (Always On)
    traces.push({
        x: activeTime, y: intradayData.wkRv,
        type: 'scatter', mode: 'lines', name: 'Wk RV',
        line: { color: '#FF9800', width: 2, dash: 'dot' }
    });

    // 3 & 4. Monthly Traces (Conditional)
    if (showMonthly) {
        traces.push({
            x: activeTime, y: intradayData.mo,
            type: 'scatter', mode: 'lines', name: 'Mo IV',
            line: { color: '#42A5F5', width: 2 }
        });
        traces.push({
            x: activeTime, y: intradayData.moRv,
            type: 'scatter', mode: 'lines', name: 'Mo RV',
            line: { color: '#42A5F5', width: 2, dash: 'dot' }
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
            tickvals: fullTimeline.filter((_, i) => i % 4 === 0),
            fixedrange: true,
            showgrid: false,
            tickfont: { color: '#fff', size: 10 }
        },
        yaxis: {
            gridcolor: '#1f1f1f',
            fixedrange: true,
            // We can use global IV range here to keep scale consistent across tabs
            // or use autorange if Intraday moves differently. 
            // Using globalRange for consistency.
            range: globalRange, 
            tickfont: { color: '#fff', size: 10 }
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
