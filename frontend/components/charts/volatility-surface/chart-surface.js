import { mockData } from '../../../mockdata.js';

// Margins tuned for central axis meeting point
const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
};

function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    const styleOn = `background: rgba(0, 230, 118, 0.15); color: #00E676; border-color: rgba(0,230,118,0.3);`;
    const styleOff = `background: rgba(255, 82, 82, 0.15); color: #FF5252; border-color: rgba(255,82,82,0.3);`;

    // Controls: Toggle + Axis Explanations
    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
            <button id="surf-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
                ${showMonthly ? 'MONTHLY VIEWS' : 'WEEKLY VIEWS'}
            </button>
            <span style="color:#888; font-size:10px;">| L: Moneyness | R: Delta |</span>
        </div>
    `;

    // Legend: IV Gradient
    leg.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
             <div class="leg-item">
                <span style="font-size:9px; color:#ccc; margin-right:6px;">Lower IV</span>
                <span style="background:linear-gradient(90deg, #FF9800, #42A5F5); width:60px; height:8px; border-radius:2px; border:1px solid #333;"></span>
                <span style="font-size:9px; color:#ccc; margin-left:6px;">Higher IV</span>
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

    // 1. DATA SELECTION (Dynamic based on toggle)
    const expiries = showMonthly ? mockData.surface.expiriesMonthly : mockData.surface.expiriesWeekly;
    const zValues = showMonthly ? mockData.surface.zMo : mockData.surface.zWk;

    // 2. CONTAINER SETUP (Just two divs, no separator line div needed now)
    container.innerHTML = `
        <div style="display: flex; width: 100%; height: 100%;">
            <div id="surf-left" style="flex: 1; height: 100%;"></div>
            <div id="surf-right" style="flex: 1; height: 100%;"></div>
        </div>
    `;

    // SHARED COLOR SCALE
    const colorscale = [ [0, '#FF9800'], [1, '#42A5F5'] ];

    // --- CHART 1: MONEYNESS (Left) ---
    // Configured to show Y-axis line and labels on the RIGHT edge.
    Plotly.newPlot('surf-left', [{
        type: 'heatmap',
        x: mockData.surface.moneyness, 
        y: expiries,
        z: zValues,
        colorscale: colorscale, showscale: false,
        xgap: 1, ygap: 1
    }], {
        ...LAYOUT_BASE,
        // THE CENTRAL AXIS TRICK:
        yaxis: { 
            side: 'right',          // Put labels on right side
            color: '#fff',          // Text color
            showline: true,         // Draw the axis line
            linecolor: '#fff',      // Line color white
            linewidth: 2,           // Make it visible
            mirror: false,          // Only draw on the right side
            tickfont: {size:11, weight:'bold'}, 
            fixedrange: true
        },
        xaxis: { 
            title: 'Moneyness (%)', titlefont:{size:10, color:'#888'}, 
            tickfont: {color:'#ccc', size:9}, fixedrange: true
        },
        // Right margin must accommodate labels to sit exactly in the middle
        margin: { t: 10, b: 30, l: 30, r: 65 } 
    }, { displayModeBar: false, responsive: true });

    // --- CHART 2: DELTA (Right) ---
    // Y-axis completely hidden. Left margin meets the central line.
    Plotly.newPlot('surf-right', [{
        type: 'heatmap',
        x: mockData.surface.delta,
        y: expiries,
        z: zValues, 
        colorscale: colorscale, showscale: false,
        xgap: 1, ygap: 1
    }], {
        ...LAYOUT_BASE,
        yaxis: { visible: false, fixedrange: true }, 
        xaxis: { 
            title: 'Delta', titlefont:{size:10, color:'#888'}, 
            type: 'category', tickfont: {color:'#ccc', size:9}, fixedrange: true
        },
        // Left margin near zero to abut the central line
        margin: { t: 10, b: 30, l: 5, r: 30 }
    }, { displayModeBar: false, responsive: true });

    updateLegend(showMonthly);
}
