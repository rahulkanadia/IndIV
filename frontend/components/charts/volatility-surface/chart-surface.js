import { mockData } from '../../../mockdata.js';

let isWeeklyMode = false;

const LAYOUT_CONTOUR = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    xaxis: { type: 'category', tickfont: {size: 9, color:'#fff'}, fixedrange: true },
    yaxis: { type: 'category', tickfont: {size: 9, color:'#fff'}, fixedrange: true },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 20 }
};

function getZRange(zMatrix) {
    const flat = zMatrix.flat();
    return [Math.min(...flat), Math.max(...flat)];
}

function refreshCharts() {
    const moneyData = isWeeklyMode ? mockData.surfMoneyWk : mockData.surfMoney;
    const deltaData = isWeeklyMode ? mockData.surfDeltaWk : mockData.surfDelta;

    const [mMin, mMax] = getZRange(moneyData.z);
    Plotly.react('surf-money', [{ 
        z: moneyData.z, x: moneyData.x, y: moneyData.y, 
        type: 'heatmap', colorscale: 'Viridis', showscale: false, zmin: mMin, zmax: mMax 
    }], LAYOUT_CONTOUR, { displayModeBar: false, responsive: true });

    const [dMin, dMax] = getZRange(deltaData.z);
    Plotly.react('surf-delta', [{ 
        z: deltaData.z, x: deltaData.x, y: deltaData.y, 
        type: 'heatmap', colorscale: 'Plasma', showscale: false, zmin: dMin, zmax: dMax 
    }], LAYOUT_CONTOUR, { displayModeBar: false, responsive: true });
}

export function updateLegend() {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    const ctr = document.getElementById('dynamicCenterControls');
    if(!leg || !inp || !ctr) return;

    // 1. LEFT TITLE (Replaces Inputs)
    inp.innerHTML = `
        <span style="color:#00E676; font-weight:bold; font-size:11px; white-space:nowrap;">
            Moneyness w.r.t. Expiry
        </span>
    `;

    // 2. RIGHT TITLE (Replaces Legends)
    leg.innerHTML = `
        <span style="color:#FF9800; font-weight:bold; font-size:11px; white-space:nowrap;">
            Delta w.r.t. Expiry
        </span>
    `;

    // 3. CENTER CONTROL (Toggle)
    const currentLabel = isWeeklyMode ? "WEEKLY" : "MONTHLY";
    const currentStyle = isWeeklyMode 
        ? "background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255,82,82,0.3);" 
        : "background: rgba(66, 165, 245, 0.2); color: #42A5F5; border: 1px solid rgba(66,165,245,0.3);";

    // Use chart-toggle-btn for dimension consistency
    ctr.innerHTML = `
        <div style="display:flex; align-items:center; gap: 8px; font-size: 10px; color: #888;">
            <button id="surf-toggle-btn" class="chart-toggle-btn" style="${currentStyle}">
                ${currentLabel}
            </button>
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
