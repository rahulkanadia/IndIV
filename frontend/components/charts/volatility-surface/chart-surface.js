import { mockData } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    margin: { t: 30, b: 40, l: 60, r: 20 }, // Margins for axis labels
};

function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    // TOGGLE BUTTON (Monthly Default)
    const styleOn = `background: rgba(0, 230, 118, 0.15); color: #00E676; border-color: rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.15); color: #FF5252; border-color: rgba(255,82,82,0.3);`;

    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
            <button id="surf-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
                MONTHLY
            </button>
            <span style="color:#666; font-size:10px;">${showMonthly ? 'ON' : 'OFF'}</span>
        </div>
    `;

    // LEGEND (Heatmap Gradient)
    leg.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
             <div class="leg-item">
                <span style="font-size:9px; color:#888; margin-right:5px;">Low IV</span>
                <span style="background:linear-gradient(90deg, #111, #FF9800); width:50px; height:6px; border-radius:2px;"></span>
                <span style="font-size:9px; color:#888; margin-left:5px;">High IV</span>
            </div>
        </div>
    `;

    // Toggle Logic
    document.getElementById('surf-toggle-btn').onclick = () => {
        renderSurfaceCharts('chart-canvas', !showMonthly);
    };
}

export function renderSurfaceCharts(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true; // Default ON

    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Prepare Data based on Toggle
    const expiries = showMonthly ? mockData.surface.expiriesMonthly : mockData.surface.expiriesWeekly;
    const zValues = showMonthly ? mockData.surface.zMo : mockData.surface.zWk;

    // 2. Setup Split Layout
    container.innerHTML = `
        <div style="display: flex; width: 100%; height: 100%;">
            <div id="surf-left" style="flex: 1; height: 100%; border-right: 1px solid #222;"></div>
            <div id="surf-right" style="flex: 1; height: 100%;"></div>
        </div>
    `;

    // --- CHART 1: MONEYNESS (Left) ---
    // Y: Expiry, X: Moneyness
    const dataLeft = [{
        type: 'heatmap',
        x: mockData.surface.moneyness, 
        y: expiries,
        z: zValues,
        colorscale: [ [0, '#1a1a1a'], [1, '#FF9800'] ], // Dark to Orange
        showscale: false,
        xgap: 1, ygap: 1
    }];

    const layoutLeft = {
        ...LAYOUT_BASE,
        title: { text: 'By Moneyness', font: {size: 11, color: '#888'}, x: 0.05, y: 0.98 },
        xaxis: { title: 'Moneyness', titlefont: {size:10, color:'#666'}, tickfont: {color:'#888', size:9} },
        yaxis: { tickfont: {color:'#fff', size:10} }
    };

    Plotly.react('surf-left', dataLeft, layoutLeft, { displayModeBar: false, responsive: true });

    // --- CHART 2: DELTA (Right) ---
    // Y: Expiry, X: Delta
    const dataRight = [{
        type: 'heatmap',
        x: mockData.surface.delta,
        y: expiries,
        z: zValues, // Using same Z for mock; real app would map distinct z-values
        colorscale: [ [0, '#1a1a1a'], [1, '#42A5F5'] ], // Dark to Blue
        showscale: false,
        xgap: 1, ygap: 1
    }];

    const layoutRight = {
        ...LAYOUT_BASE,
        title: { text: 'By Delta', font: {size: 11, color: '#888'}, x: 0.05, y: 0.98 },
        xaxis: { title: 'Delta', titlefont: {size:10, color:'#666'}, tickfont: {color:'#888', size:9} },
        yaxis: { visible: false } // Hide Y axis (shared)
    };

    Plotly.react('surf-right', dataRight, layoutRight, { displayModeBar: false, responsive: true });

    updateLegend(showMonthly);
}
