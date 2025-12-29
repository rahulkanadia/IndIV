import { mockData } from '../../../mockdata.js';

let isWeeklyMode = false; // Default Weekly for Surface? Or Monthly? Keeping Weekly for now.

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

    ctr.innerHTML = ''; // Clear Center

    // 1. LEFT: TOGGLE BUTTON
    const currentLabel = isWeeklyMode ? "WEEKLY" : "MONTHLY";
    const currentStyle = isWeeklyMode 
        ? "background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255,82,82,0.3);" 
        : "background: rgba(66, 165, 245, 0.2); color: #42A5F5; border: 1px solid rgba(66,165,245,0.3);";

    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap: 8px; font-size: 10px; color: #888;">
            <button id="surf-toggle-btn" style="border:none; width:90px; height:24px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:11px; outline:none; transition:0.2s; ${currentStyle}">
                ${currentLabel}
            </button>
            <span>Mode Selection</span>
        </div>
    `;

    // 2. RIGHT: HELP TEXT
    leg.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
             <span style="color:#aaa; font-size:10px;">Moneyness & Delta Maps</span>
             <span style="color:#666; font-size:9px;">Deeper the red, higher the PoP on sell</span>
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
