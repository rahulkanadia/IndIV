import { mockData } from '../../../mockdata.js';

// Module-level state to track the toggle
let isWeeklyMode = false;

const LAYOUT_CONTOUR = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    xaxis: { title: '', tickfont: {size: 9}, color: '#888', fixedrange: true },
    yaxis: { title: '', tickfont: {size: 9}, color: '#888', fixedrange: true },
    dragmode: false
};

// Helper to re-render charts based on mode
function refreshCharts() {
    // Select data based on mode
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

// PUBLIC LEGEND & CONTROLLER
export function updateLegend() {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs'); // We will hide this to make room
    if(!leg || !inp) return;

    // 1. Hide the Inputs right-side container to give us full width
    inp.innerHTML = '';
    
    // 2. Define Styles for the Button States
    const btnStyleBase = `
        border: 1px solid; 
        padding: 2px 12px; 
        border-radius: 4px; 
        font-size: 10px; 
        font-weight: bold; 
        cursor: pointer; 
        transition: 0.2s;
        background: rgba(0,0,0,0.3);
    `;
    
    const styleMonthly = `color: #42A5F5; border-color: #42A5F5; box-shadow: 0 0 5px rgba(66, 165, 245, 0.2);`;
    const styleWeekly  = `color: #FF5252; border-color: #FF5252; box-shadow: 0 0 5px rgba(255, 82, 82, 0.2);`;

    const currentStyle = isWeeklyMode ? styleWeekly : styleMonthly;
    const currentLabel = isWeeklyMode ? "Weekly" : "Monthly";

    // 3. Inject Layout: [Label Left] --- [Button Center] --- [Label Right]
    // We use a container with width: 95% (to account for padding) and space-between
    leg.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width: 440px;">
            <span style="color:#00E676; font-weight:bold;">Moneyness vs Expiry</span>
            
            <button id="surf-toggle-btn" style="${btnStyleBase} ${currentStyle}">
                ${currentLabel}
            </button>
            
            <span style="color:#FF9800; font-weight:bold;">Delta vs Expiry</span>
        </div>
    `;

    // 4. Attach Event Listener to the new Button
    document.getElementById('surf-toggle-btn').onclick = () => {
        isWeeklyMode = !isWeeklyMode; // Toggle State
        updateLegend(); // Re-render button with new color/text
        refreshCharts(); // Update the charts
    };
}

export function renderSurfaceCharts(containerId1, containerId2) {
    // Initial Render
    refreshCharts();
    updateLegend();
}
