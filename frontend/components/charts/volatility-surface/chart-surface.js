import { mockData } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    margin: { t: 20, b: 40, l: 20, r: 20 }, 
};

function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    const styleOn = `background: rgba(0, 230, 118, 0.15); color: #00E676; border-color: rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.15); color: #FF5252; border-color: rgba(255,82,82,0.3);`;

    inp.innerHTML = `
        <button id="surf-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            ${showMonthly ? 'MONTHLY' : 'WEEKLY'}
        </button>
    `;

    document.getElementById('surf-toggle-btn').onclick = () => {
        // Re-call render, which triggers the dashboard cleanup/re-render logic manually or internal update
        // Internal update is smoother for toggles inside a chart
        renderSurfaceCharts('chart-canvas', !showMonthly);
    };
}

export function renderSurfaceCharts(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true; 

    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Setup Split Container
    // This wipes whatever was in 'chart-canvas' (which is safe now)
    container.innerHTML = `
        <div style="display: flex; width: 100%; height: 100%;">
            <div id="surf-left" style="flex: 1; height: 100%;"></div>
            <div style="width: 1px; background: #333; height: 90%; align-self: center;"></div>
            <div id="surf-right" style="flex: 1; height: 100%;"></div>
        </div>
    `;

    // 2. Data
    const expiries = showMonthly ? mockData.surface.expiriesMonthly : mockData.surface.expiriesWeekly;
    const zValues = showMonthly ? mockData.surface.zMo : mockData.surface.zWk;

    // 3. Left Chart
    Plotly.newPlot('surf-left', [{
        type: 'heatmap',
        x: mockData.surface.moneyness, 
        y: expiries,
        z: zValues,
        colorscale: [ [0, '#1a1a1a'], [1, '#FF9800'] ], 
        showscale: false
    }], {
        ...LAYOUT_BASE,
        yaxis: { side: 'right', tickfont: {color:'#fff', size:11} }, // Center Labels
        xaxis: { title: 'Moneyness', titlefont:{size:10, color:'#666'} },
        margin: { t: 20, b: 30, l: 10, r: 50 }
    }, { displayModeBar: false, responsive: true });

    // 4. Right Chart
    Plotly.newPlot('surf-right', [{
        type: 'heatmap',
        x: mockData.surface.delta,
        y: expiries,
        z: zValues, 
        colorscale: [ [0, '#1a1a1a'], [1, '#42A5F5'] ],
        showscale: false
    }], {
        ...LAYOUT_BASE,
        yaxis: { visible: false }, // Hidden Y
        xaxis: { title: 'Delta', titlefont:{size:10, color:'#666'}, type: 'category' },
        margin: { t: 20, b: 30, l: 10, r: 10 }
    }, { displayModeBar: false, responsive: true });

    updateLegend(showMonthly);
}
