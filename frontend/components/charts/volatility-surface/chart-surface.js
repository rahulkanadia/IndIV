import { mockData } from '../../../mockdata.js';

let isWeeklyMode = false;

const LAYOUT_CONTOUR = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    xaxis: { title: '', tickfont: {size: 9}, color: '#888', fixedrange: true },
    yaxis: { title: '', tickfont: {size: 9}, color: '#888', fixedrange: true },
    dragmode: false
};

function refreshCharts() {
    const moneyData = isWeeklyMode ? mockData.surfMoneyWk : mockData.surfMoney;
    const deltaData = isWeeklyMode ? mockData.surfDeltaWk : mockData.surfDelta;

    Plotly.react('surf-money', [{ 
        z: moneyData.z, x: moneyData.x, y: moneyData.y, 
        type: 'heatmap', colorscale: 'Viridis', showscale: false 
    }], { 
        ...LAYOUT_CONTOUR, 
        margin: { t: 40, b: 20, l: 30, r: 10 },
        title: {text: 'IV vs Moneyness', font:{size:10, color:'#666'}, y: 0.98} 
    }, { displayModeBar: false, responsive: true });

    Plotly.react('surf-delta', [{ 
        z: deltaData.z, x: deltaData.x, y: deltaData.y, 
        type: 'heatmap', colorscale: 'Plasma', showscale: false 
    }], { 
        ...LAYOUT_CONTOUR, 
        margin: { t: 40, b: 20, l: 30, r: 10 },
        title: {text: 'IV vs Delta', font:{size:10, color:'#666'}, y: 0.98} 
    }, { displayModeBar: false, responsive: true });
}

export function updateLegend() {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    // 1. CLEAR RIGHT CONTAINER AND FORCE LEFT CONTAINER TO FULL WIDTH
    inp.innerHTML = '';
    inp.style.display = 'none'; // Remove from flow
    leg.style.width = '100%';   // Take full space
    leg.style.flex = '1';

    // 2. BUTTON STYLING (Fixed Width + Filled Background + No Border)
    const btnBase = `
        border: none;
        width: 80px;           /* Fixed width prevents shifting */
        padding: 4px 0;        /* Vertical padding */
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.2s;
        text-align: center;
        outline: none;
    `;

    // Faint Blue Fill vs Faint Red Fill
    const styleMonthly = `background: rgba(66, 165, 245, 0.2); color: #42A5F5;`;
    const styleWeekly  = `background: rgba(255, 82, 82, 0.2);  color: #FF5252;`;

    const currentStyle = isWeeklyMode ? styleWeekly : styleMonthly;
    const currentLabel = isWeeklyMode ? "WEEKLY" : "MONTHLY";

    // 3. LAYOUT GRID: [Left Label] [Center Button] [Right Label]
    leg.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr auto 1fr; width:100%; align-items:center;">
            
            <div style="text-align:left;">
                <span style="color:#00E676; font-weight:bold; font-size:11px;">Moneyness vs Expiry</span>
            </div>
            
            <div style="text-align:center;">
                <button id="surf-toggle-btn" style="${btnBase} ${currentStyle}">
                    ${currentLabel}
                </button>
            </div>
            
            <div style="text-align:right;">
                <span style="color:#FF9800; font-weight:bold; font-size:11px;">Delta vs Expiry</span>
            </div>

        </div>
    `;

    // 4. ATTACH LISTENER
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
