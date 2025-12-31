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

    // Dual Gradient Legend
    leg.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
             <div class="leg-item">
                <span style="font-size:9px; color:#ccc; margin-right:6px;">Moneyness</span>
                <span style="background:linear-gradient(90deg, #E3F2FD, #0D47A1); width:40px; height:8px; border-radius:2px;"></span>
            </div>
            <div class="leg-item">
                <span style="font-size:9px; color:#ccc; margin-right:6px;">Delta</span>
                <span style="background:linear-gradient(90deg, #FFFDE7, #FF3D00); width:40px; height:8px; border-radius:2px;"></span>
            </div>
        </div>
    `;

    document.getElementById('surf-toggle-btn').onclick = () => {
        renderSurfaceCharts('chart-canvas', !showMonthly);
    };
}

// HELPER: Generate Shapes & Annotations for Signals
function createSignalOverlay(signalMatrix, xLabels, yLabels, xref, yref) {
    const shapes = [];
    const annotations = [];

    // Iterate matrix
    signalMatrix.forEach((row, rowIndex) => {
        row.forEach((sig, colIndex) => {
            if (!sig) return;

            const color = sig === 'buy' ? '#00E676' : '#FF5252';
            const labelText = sig === 'buy' ? 'PoP: Buy' : 'PoP: Sell';
            
            // Plotly Heatmap coordinates align with indices/labels
            // x0, x1 around the center point
            const xVal = xLabels[colIndex];
            const yVal = yLabels[rowIndex];

            // 1. Border Box (Shape)
            shapes.push({
                type: 'rect',
                xref: xref, yref: yref,
                x0: colIndex - 0.45, x1: colIndex + 0.45, // Use indices for discrete heatmap placement
                y0: rowIndex - 0.45, y1: rowIndex + 0.45,
                line: { color: color, width: 2 },
                fillcolor: color,
                opacity: 0.2 // Transparent fill
            });

            // 2. Text Label (Annotation)
            annotations.push({
                xref: xref, yref: yref,
                x: colIndex,
                y: rowIndex,
                text: `<b>${labelText}</b>`,
                showarrow: false,
                font: { color: '#fff', size: 9, family: 'Segoe UI' },
                bgcolor: 'rgba(0,0,0,0.6)',
                borderpad: 2,
                borderwidth: 0
            });
        });
    });

    return { shapes, annotations };
}

export function renderSurfaceCharts(containerId, showMonthly) {
    if (typeof showMonthly === 'undefined') showMonthly = true; 

    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. DATA SELECTION
    const expiries = showMonthly ? mockData.surface.expiriesMonthly : mockData.surface.expiriesWeekly;
    const zValues = showMonthly ? mockData.surface.zMo : mockData.surface.zWk;
    const signals = showMonthly ? mockData.surface.sigMo : mockData.surface.sigWk;
    
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

    // 3. GENERATE OVERLAYS
    // Left Chart (Moneyness)
    const overlayLeft = createSignalOverlay(signals, xMoneyness, expiries, 'x', 'y');
    // Right Chart (Delta) - reusing same signal logic for demo (or use separate if available)
    const overlayRight = createSignalOverlay(signals, xDelta, expiries, 'x', 'y');

    // --- CHART 1: MONEYNESS (Left) ---
    // Color: Blues
    // Y-Axis: Labels + Line on RIGHT
    Plotly.newPlot('surf-left', [{
        type: 'heatmap',
        x: xMoneyness, 
        y: expiries,
        z: zValues,
        colorscale: 'Blues', 
        showscale: false,
        xgap: 2, ygap: 2 // Gaps for grid look
    }], {
        ...LAYOUT_BASE,
        title: { text: 'By Moneyness', font: {size:11, color:'#bbb'}, x:0.05, y:0.98 },
        yaxis: { 
            side: 'right',          
            color: '#fff',          
            showline: true,         
            linecolor: '#fff',      
            linewidth: 2,           
            mirror: false,          
            tickfont: {size:11, weight:'bold'}, 
            fixedrange: true
        },
        xaxis: { 
            title: '', 
            tickfont: {color:'#ccc', size:9}, fixedrange: true 
        },
        margin: { t: 30, b: 30, l: 30, r: 65 }, // Right margin for labels
        shapes: overlayLeft.shapes,
        annotations: overlayLeft.annotations
    }, { displayModeBar: false, responsive: true });

    // --- CHART 2: DELTA (Right) ---
    // Color: YlOrRd (Yellow-Orange-Red)
    // Y-Axis: Line ONLY on LEFT (No labels)
    Plotly.newPlot('surf-right', [{
        type: 'heatmap',
        x: xDelta,
        y: expiries,
        z: zValues, 
        colorscale: 'YlOrRd', 
        showscale: false,
        xgap: 2, ygap: 2
    }], {
        ...LAYOUT_BASE,
        title: { text: 'By Delta', font: {size:11, color:'#bbb'}, x:0.05, y:0.98 },
        yaxis: { 
            side: 'left',
            showticklabels: false, // Hide Text
            showline: true,        // Show Line
            linecolor: '#fff',
            linewidth: 2,
            mirror: false,
            fixedrange: true,
            ticks: 'outside', tickcolor: '#fff', ticklen: 5 // Ticks point out to meet left chart
        },
        xaxis: { 
            title: '', 
            type: 'category', tickfont: {color:'#ccc', size:9}, fixedrange: true 
        },
        margin: { t: 30, b: 30, l: 10, r: 30 }, // Left margin near zero
        shapes: overlayRight.shapes,
        annotations: overlayRight.annotations
    }, { displayModeBar: false, responsive: true });

    updateLegend(showMonthly);
}
