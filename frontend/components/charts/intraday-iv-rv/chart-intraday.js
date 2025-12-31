import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
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

function getLastValueText(dataArray) {
    return dataArray.map((val, i) => 
        i === dataArray.length - 1 ? val.toFixed(1) : ''
    );
}

export function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    const commonStyle = 'width: 80px; text-align: center; border-radius: 4px; font-weight: 600; font-size: 10px; cursor: pointer; transition: all 0.2s; outline: none;';

    const styleOn = `${commonStyle} background: #42A5F5; color: #fff; border: 1px solid #42A5F5;`;
    const styleOff = `${commonStyle} background: #fff; color: #42A5F5; border: 1px solid #42A5F5;`;

    inp.innerHTML = `
        <button id="intra-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            ${showMonthly ? 'MONTHLY' : 'WEEKLY'}
        </button>
    `;
    
    // UPDATED: All legend items always visible
    leg.innerHTML = `
        <div style="display:flex; gap:12px; font-size:10px; color:#ccc;">
            <div class="leg-item"><span style="background:#FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly IV</div>
            <div class="leg-item"><span style="border:1px dotted #FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly RV</div>
            <div class="leg-item" style="opacity:${showMonthly ? 1 : 0.5}"><span style="background:#42A5F5; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Monthly IV</div>
            <div class="leg-item" style="opacity:${showMonthly ? 1 : 0.5}"><span style="border:1px dotted #42A5F5; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Monthly RV</div>
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

    const mode = 'lines+markers+text';
    const textPos = 'top right';
    const markerSize = 4;

    const traces = [];

    // Weekly Traces (Always On)
    traces.push({
        x: activeTime, y: d.wk,
        type: 'scatter', mode: mode, name: 'Weekly IV',
        line: { color: '#FF9800', width: 2 },
        marker: { size: markerSize },
        text: getLastValueText(d.wk), textposition: textPos, textfont: { color: '#FF9800', size: 10 }
    });

    traces.push({
        x: activeTime, y: d.wkRv,
        type: 'scatter', mode: mode, name: 'Weekly RV',
        line: { color: '#FF9800', width: 1.5, dash: 'dot' },
        marker: { size: markerSize, symbol: 'circle-open' },
        text: getLastValueText(d.wkRv), textposition: 'bottom right', textfont: { color: '#FF9800', size: 10 }
    });

    if (showMonthly) {
        traces.push({
            x: activeTime, y: d.mo,
            type: 'scatter', mode: mode, name: 'Monthly IV',
            line: { color: '#42A5F5', width: 2 },
            marker: { size: markerSize },
            text: getLastValueText(d.mo), textposition: textPos, textfont: { color: '#42A5F5', size: 10 }
        });
        traces.push({
            x: activeTime, y: d.moRv,
            type: 'scatter', mode: mode, name: 'Monthly RV',
            line: { color: '#42A5F5', width: 1.5, dash: 'dot' },
            marker: { size: markerSize, symbol: 'circle-open' },
            text: getLastValueText(d.moRv), textposition: 'bottom right', textfont: { color: '#42A5F5', size: 10 }
        });
    }

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: {
            type: 'category',
            categoryorder: 'array',
            categoryarray: fullTimeline,
            tickmode: 'array',
            tickvals: fullTimeline.filter((_, i) => i % 8 === 0),
            fixedrange: true,
            showgrid: false,
            tickfont: { color: '#fff', size: 10 },
            title: ''
        },
        yaxis: {
            gridcolor: '#1f1f1f',
            fixedrange: true,
            range: getGlobalIVRange(), 
            tickfont: { color: '#fff', size: 10 },
            title: ''
        }
    };

    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
