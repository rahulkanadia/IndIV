import { mockData } from '../../../mockdata.js';

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

    inp.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
            <button id="surf-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
                ${showMonthly ? 'MONTHLY VIEWS' : 'WEEKLY VIEWS'}
            </button>
        </div>
    `;

    // Updated Text Legend
    leg.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
             <div class="leg-item" style="color:#aaa; font-style:italic;">
                <span style="color:#42A5F5; font-weight:700;">Note:</span>
                Moneyness view (Left) is strike-neutral. Delta view (Right) is directional.
                Brighter colors indicate higher IV / Cost.
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

    // 1. DATA SELECTION
    const expiries = showMonthly ? mockData.surface.expiriesMonthly : mockData.surface.expiriesWeekly;
    const zValues = showMonthly ? mockData.surface.zMo : mockData.surface.zWk;
    
    // Axis Labels
    const xMoneyness = mockData.surface.moneyness;
    const xDelta = mockData.surface.delta;

    // 2. CONTAINER
    container.innerHTML = `
        <div style="display: flex; width: 100%; height: 100%;">
            <div id="surf-left" style="flex: 1; height: 100%;"></div>
            <div id="surf-right" style="flex: 1; height: 100%;"></div>
        </div>
    `;

    // --- CHART 1: MONEYNESS (Left) ---
    // Color: Blues, Opacity 0.8, No Borders
    Plotly.newPlot('surf-left', [{
        type: 'heatmap',
        x: xMoneyness, 
        y: expiries,
        z: zValues,
        colorscale: 'Blues', 
        showscale: false,
        opacity: 0.8,      // Lighter colors
        xgap: 0, ygap: 0   // Remove borders
    }], {
        ...LAYOUT_BASE,
        title: { 
            text: 'Moneyness by expiry', 
            font: {size:11, color:'#bbb'}, 
            x: 0.5, y: 0.98, xanchor: 'center' // Centered Title
        },
        yaxis: { 
            side: 'right',          
            color: '#fff',          
            showline: true,         
            linecolor: '#fff',      
            linewidth: 2,           
            mirror: false,          
            tickfont: {size:11, weight:'bold'}, 
            tickprefix: '    ', // Shift labels 4 spaces right
            fixedrange: true
        },
        xaxis: { 
            title: '', 
            tickfont: {color:'#ccc', size:9}, fixedrange: true 
        },
        margin: { t: 30, b: 30, l: 30, r: 65 }, 
    }, { displayModeBar: false, responsive: true });

    // --- CHART 2: DELTA (Right) ---
    // Color: YlOrRd, Opacity 0.8, No Borders
    Plotly.newPlot('surf-right', [{
        type: 'heatmap',
        x: xDelta,
        y: expiries,
        z: zValues, 
        colorscale: 'YlOrRd', 
        showscale: false,
        opacity: 0.8,      // Lighter colors
        xgap: 0, ygap: 0   // Remove borders
    }], {
        ...LAYOUT_BASE,
        title: { 
            text: 'Delta by expiry', 
            font: {size:11, color:'#bbb'}, 
            x: 0.5, y: 0.98, xanchor: 'center' // Centered Title
        },
        yaxis: { 
            side: 'left',
            showticklabels: false, 
            showline: true,        
            linecolor: '#fff',
            linewidth: 2,
            mirror: false,
            fixedrange: true,
            ticks: 'outside', tickcolor: '#fff', ticklen: 5 
        },
        xaxis: { 
            title: '', 
            type: 'category', tickfont: {color:'#ccc', size:9}, fixedrange: true 
        },
        margin: { t: 30, b: 30, l: 10, r: 30 }, 
    }, { displayModeBar: false, responsive: true });

    updateLegend(showMonthly);
}
