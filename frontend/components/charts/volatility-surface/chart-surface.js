import { mockData } from '../../../mockdata.js';

let isWeeklyMode = false;

const LAYOUT_CONTOUR = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    
    // --- FIX 1: FORCE CATEGORY AXES ---
    // This tells Plotly "Don't treat '20D' as a date or number. It's just a label."
    xaxis: { 
        type: 'category', 
        title: '', 
        tickfont: {size: 9}, 
        color: '#fff', 
        fixedrange: true 
    },
    yaxis: { 
        type: 'category', 
        title: '', 
        tickfont: {size: 9}, 
        color: '#fff', 
        fixedrange: true 
    },
    dragmode: false
};

function refreshCharts() {
    const moneyData = isWeeklyMode ? mockData.surfMoneyWk : mockData.surfMoney;
    const deltaData = isWeeklyMode ? mockData.surfDeltaWk : mockData.surfDelta;

    // 1. Plot Moneyness (Left)
    Plotly.react('surf-money', [{ 
        z: moneyData.z, 
        x: moneyData.x, 
        y: moneyData.y, 
        type: 'heatmap', 
        colorscale: 'Viridis', 
        showscale: false 
    }], { 
        ...LAYOUT_CONTOUR, 
        margin: { t: 20, b: 30, l: 40, r: 20 },
    }, { displayModeBar: false, responsive: true });


    // 2. Plot Delta (Right)
    Plotly.react('surf-delta', [{ 
        z: deltaData.z, 
        x: deltaData.x, 
        y: deltaData.y, 
        type: 'heatmap', 
        colorscale: 'Plasma', 
        showscale: false,
        
        // --- FIX 2: HELP PLOTLY WITH DATA GAPS ---
        // (Optional safety net, though 'category' axis usually solves it)
        zsmooth: false,
        connectgaps: false
    }], { 
        ...LAYOUT_CONTOUR, 
        margin: { t: 20, b: 30, l: 40, r: 20 },
    }, { displayModeBar: false, responsive: true });
}

export function updateLegend() {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    // Reset Container
    inp.innerHTML = '';
    inp.style.display = 'none'; 
    leg.style.width = '100%';   
    leg.style.flex = '1';

    // Button Styling
    const btnBase = `
        border: none;
        width: 80px;           
        padding: 4px 0;        
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.2s;
        text-align: center;
        outline: none;
    `;

    const styleMonthly = `background: rgba(66, 165, 245, 0.2); color: #42A5F5;`;
    const styleWeekly  = `background: rgba(255, 82, 82, 0.2);  color: #FF5252;`;

    const currentStyle = isWeeklyMode ? styleWeekly : styleMonthly;
    const currentLabel = isWeeklyMode ? "WEEKLY" : "MONTHLY";

    leg.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr auto 1fr; width:100%; align-items:center;">
            <div style="text-align:left;">
                <span style="color:#00E676; font-weight:bold; font-size:11px;">Moneyness vs Expiry</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:center; gap: 8px; font-size: 10px; color: #888;">
                <span>Click this button</span>
                <button id="surf-toggle-btn" style="${btnBase} ${currentStyle}">
                    ${currentLabel}
                </button>
                <span>to change expiries</span>
            </div>
            <div style="text-align:right;">
                <span style="color:#FF9800; font-weight:bold; font-size:11px;">Delta vs Expiry</span>
            </div>
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
