// REMOVED: import { mockData } ...

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 40 },
};

function getLastValueText(dataArray) {
    if(!dataArray || dataArray.length === 0) return [];
    return dataArray.map((val, i) => i === dataArray.length - 1 ? val.toFixed(1) : '');
}

export function updateLegend(showMonthly, renderCallback) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    // ... (Keep existing CSS strings) ...
    const commonStyle = 'width: 80px; text-align: center; border-radius: 4px; font-weight: 600; font-size: 10px; cursor: pointer; transition: all 0.2s; outline: none;';
    const styleOn = `${commonStyle} background: #42A5F5; color: #fff; border: 1px solid #42A5F5;`;
    const styleOff = `${commonStyle} background: #fff; color: #42A5F5; border: 1px solid #42A5F5;`;

    inp.innerHTML = `
        <button id="intra-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            ${showMonthly ? 'MONTHLY' : 'WEEKLY'}
        </button>
    `;

    leg.innerHTML = `
        <div style="display:flex; gap:12px; font-size:10px; color:#ccc;">
            <div class="leg-item"><span style="background:#FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly IV</div>
            <div class="leg-item"><span style="border:1px dotted #FF9800; width:6px; height:6px; border-radius:50%; margin-right:4px;"></span>Weekly RV</div>
        </div>
    `;

    document.getElementById('intra-toggle-btn').onclick = () => {
        // Callback to parent to re-render with new toggle state
        if(renderCallback) renderCallback(!showMonthly);
    };
}

// NEW: Accepts 'chartData' as second arg
export function renderIntradayChart(containerId, chartData, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true;

    // Safely extract Intraday Data
    const d = chartData.intraday || { time:[], wk:[], wkRv:[], mo:[], moRv:[] };
    
    // Safety check for empty data
    if (!d.time || d.time.length === 0) {
        document.getElementById(containerId).innerHTML = '<div style="color:#666;text-align:center;padding-top:20px;">Waiting for Intraday Data...</div>';
        return;
    }

    const mode = 'lines+markers+text';
    const traceWk = {
        x: d.time, y: d.wk,
        type: 'scatter', mode: mode, name: 'Weekly IV',
        line: { color: '#FF9800', width: 2 },
        marker: { size: 4 },
        text: getLastValueText(d.wk), textposition: 'top right', textfont: { color: '#FF9800', size: 10 }
    };
    
    // ... (You can add Monthly traces back here if needed) ...

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: {
            type: 'category',
            tickmode: 'auto',
            nticks: 8,
            showgrid: false,
            tickfont: { color: '#fff', size: 10 }
        },
        yaxis: {
            gridcolor: '#1f1f1f',
            // Simple Auto Range or Fixed
            range: [10, 20], 
            tickfont: { color: '#fff', size: 10 }
        }
    };

    Plotly.react(containerId, [traceWk], layout, { displayModeBar: false, responsive: true });
    
    // Pass a callback to updateLegend so it knows how to re-render
    updateLegend(showMonthly, (newState) => renderIntradayChart(containerId, chartData, newState));
}
