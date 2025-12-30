import { mockData } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    // Margins adjusted to bring charts closer to center
    margin: { t: 20, b: 40, l: 20, r: 20 }, 
};

function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

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

    leg.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
             <div class="leg-item">
                <span style="font-size:9px; color:#888; margin-right:5px;">Low IV</span>
                <span style="background:linear-gradient(90deg, #111, #FF9800); width:50px; height:6px; border-radius:2px;"></span>
                <span style="font-size:9px; color:#888; margin-left:5px;">High IV</span>
            </div>
        </div>
    `;

    document.getElementById('surf-toggle-btn').onclick = () => {
        renderSurfaceCharts('chart-canvas', !showMonthly);
    };
}

export function renderSurfaceCharts(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true; 

    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. DATA PREP
    // Select correct expiries based on toggle
    const expiries = showMonthly ? mockData.surface.expiriesMonthly : mockData.surface.expiriesWeekly;
    const zValues = showMonthly ? mockData.surface.zMo : mockData.surface.zWk;

    // 2. CREATE SPLIT CONTAINER
    // We remove the border-right from left and just use spacing or a dedicated center line if needed
    container.innerHTML = `
        <div style="display: flex; width: 100%; height: 100%;">
            <div id="surf-left" style="flex: 1; height: 100%;"></div>
            <div style="width: 1px; background: #333; height: 90%; align-self: center;"></div>
            <div id="surf-right" style="flex: 1; height: 100%;"></div>
        </div>
    `;

    // --- CHART 1: MONEYNESS (Left) ---
    // Y-Axis on RIGHT side to act as center labels
    const dataLeft = [{
        type: 'heatmap',
        x: mockData.surface.moneyness, 
        y: expiries,
        z: zValues,
        colorscale: [ [0, '#1a1a1a'], [1, '#FF9800'] ], 
        showscale: false,
        xgap: 1, ygap: 1
    }];

    const layoutLeft = {
        ...LAYOUT_BASE,
        // Move Y-axis labels to the RIGHT side
        yaxis: { 
            side: 'right', 
            tickfont: {color:'#fff', size:11, weight:'bold'}, 
            ticks: '', // No tick marks, just text
        },
        xaxis: { 
            title: 'Moneyness', titlefont: {size:10, color:'#666'}, 
            tickfont: {color:'#888', size:9} 
        },
        margin: { t: 20, b: 40, l: 20, r: 50 } // Increased Right margin for labels
    };

    Plotly.react('surf-left', dataLeft, layoutLeft, { displayModeBar: false, responsive: true });

    // --- CHART 2: DELTA (Right) ---
    // Y-Axis Hidden (Shared)
    const dataRight = [{
        type: 'heatmap',
        x: mockData.surface.delta,
        y: expiries,
        z: zValues, 
        colorscale: [ [0, '#1a1a1a'], [1, '#42A5F5'] ],
        showscale: false,
        xgap: 1, ygap: 1
    }];

    const layoutRight = {
        ...LAYOUT_BASE,
        yaxis: { 
            visible: false, // Hide Y-axis completely
            fixedrange: true
        },
        xaxis: { 
            title: 'Delta', titlefont: {size:10, color:'#666'}, 
            tickfont: {color:'#888', size:9},
            // Better labeling for Delta
            type: 'category' 
        },
        margin: { t: 20, b: 40, l: 10, r: 20 } // Small Left margin
    };

    Plotly.react('surf-right', dataRight, layoutRight, { displayModeBar: false, responsive: true });

    updateLegend(showMonthly);
}
