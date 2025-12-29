import { mockData } from '../../../mockdata.js';

let isWeeklyMode = false;

// Helper to flatten 2D array and find min/max for color scaling
function getZRange(zMatrix) {
    const flat = zMatrix.flat();
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    return [min, max];
}

function refreshCharts() {
    const moneyData = isWeeklyMode ? mockData.surfMoneyWk : mockData.surfMoney;
    const deltaData = isWeeklyMode ? mockData.surfDeltaWk : mockData.surfDelta;

    // --- CHART 1: MONEYNESS (Left) ---
    const [mMin, mMax] = getZRange(moneyData.z);
    
    const traceMoney = {
        type: 'heatmap',
        z: moneyData.z,
        x: moneyData.x,
        y: moneyData.y,
        colorscale: 'Viridis',
        showscale: false,
        // FORCE COLOR RANGE
        zmin: mMin,
        zmax: mMax
    };

    const layoutMoney = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 20, b: 30, l: 40, r: 20 },
        font: { family: 'Segoe UI', color: '#666', size: 10 },
        xaxis: { type: 'category', tickfont: {color: '#fff', size: 9}, fixedrange: true },
        yaxis: { type: 'category', tickfont: {color: '#fff', size: 9}, fixedrange: true }
    };

    Plotly.newPlot('surf-money', [traceMoney], layoutMoney, { displayModeBar: false, responsive: true });


    // --- CHART 2: DELTA (Right) ---
    const [dMin, dMax] = getZRange(deltaData.z);

    const traceDelta = {
        type: 'heatmap',
        z: deltaData.z,
        x: deltaData.x,
        y: deltaData.y,
        colorscale: 'Plasma',
        showscale: false,
        // FORCE COLOR RANGE (Crucial Fix)
        zmin: dMin,
        zmax: dMax
    };

    const layoutDelta = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 20, b: 30, l: 40, r: 20 },
        font: { family: 'Segoe UI', color: '#666', size: 10 },
        xaxis: { type: 'category', tickfont: {color: '#fff', size: 9}, fixedrange: true },
        yaxis: { type: 'category', tickfont: {color: '#fff', size: 9}, fixedrange: true }
    };

    Plotly.newPlot('surf-delta', [traceDelta], layoutDelta, { displayModeBar: false, responsive: true });
}

export function updateLegend() {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    inp.style.display = 'none'; 
    leg.style.width = '100%';   
    leg.style.flex = '1';

    // Simple Toggle Button Logic
    const currentLabel = isWeeklyMode ? "WEEKLY" : "MONTHLY";
    const currentStyle = isWeeklyMode 
        ? "background: rgba(255, 82, 82, 0.2); color: #FF5252;" 
        : "background: rgba(66, 165, 245, 0.2); color: #42A5F5;";

    leg.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <span style="color:#00E676; font-weight:bold; font-size:11px;">Moneyness</span>
            
            <button id="surf-toggle-btn" style="border:none; padding:4px 12px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:11px; ${currentStyle}">
                ${currentLabel}
            </button>
            
            <span style="color:#FF9800; font-weight:bold; font-size:11px;">Delta</span>
        </div>
    `;

    document.getElementById('surf-toggle-btn').onclick = () => {
        isWeeklyMode = !isWeeklyMode;
        updateLegend();
        refreshCharts();
    };
}

export function renderSurfaceCharts(containerId1, containerId2) {
    refreshCharts();
    updateLegend();
}
