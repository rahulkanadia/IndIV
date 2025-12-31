import { mockData } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
};

// NEW: Helper to analyze data and return smart text
function generateSmartCommentary(zValues, showMonthly) {
    // Calculate average IV for Put side (left cols) vs Call side (right cols)
    let putSum = 0, callSum = 0, count = 0;
    
    // Scan rows (expiries)
    zValues.forEach(row => {
        // Assuming 5 columns: 0,1 (Puts) | 2 (ATM) | 3,4 (Calls)
        if(row.length >= 5) {
            putSum += (row[0] + row[1]); 
            callSum += (row[3] + row[4]); 
            count += 2;
        }
    });

    // Avoid divide by zero if data is empty
    if (count === 0) return "Data loading...";

    const avgPutIV = putSum / count;
    const avgCallIV = callSum / count;
    const skewDiff = avgPutIV - avgCallIV;

    // Determine Sentiment
    let sentiment = "";
    if (skewDiff > 1.5) {
        sentiment = "Moneyness shows high Put skew (Fear). Delta indicates expensive protection.";
    } else if (skewDiff < -0.5) {
        sentiment = "Moneyness shows Call skew (Bullish). Delta suggests upside speculation is pricey.";
    } else {
        sentiment = "Moneyness is balanced (Neutral). Delta shows ATMs are fair value.";
    }

    const timeframe = showMonthly ? "Monthly" : "Weekly";
    return `${timeframe} view: ${sentiment}`;
}

// UPDATED: Accepts zValues to generate text
function updateLegend(showMonthly, zValues) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    const commonStyle = 'width: 80px; text-align: center; border-radius: 4px; font-weight: 600; font-size: 10px; cursor: pointer; transition: all 0.2s; outline: none;';

    // Fixed syntax error: $(...) -> ${...}
    const styleOn = `${commonStyle} background: #42A5F5; color: #fff; border: 1px solid #42A5F5;`;
    const styleOff = `${commonStyle} background: #fff; color: #42A5F5; border: 1px solid #42A5F5;`;

    inp.innerHTML = `
        <button id="surf-toggle-btn" class="chart-toggle-btn" style="${showMonthly ? styleOn : styleOff}">
            ${showMonthly ? 'MONTHLY' : 'WEEKLY'}
        </button>
    `;

    // Generate Smart Text
    const smartText = generateSmartCommentary(zValues, showMonthly);

    // Updated Text Legend (White, Italics, No Prefix)
    leg.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
             <div class="leg-item" style="color:#fff; font-style:italic; font-size: 11px;">
                ${smartText}
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
    Plotly.newPlot('surf-left', [{
        type: 'heatmap',
        x: xMoneyness, 
        y: expiries,
        z: zValues,
        colorscale: 'Blues', 
        showscale: false,
        opacity: 0.8,      
        xgap: 0, ygap: 0   
    }], {
        ...LAYOUT_BASE,
        title: { 
            text: 'Moneyness by expiry', 
            font: {size:11, color:'#bbb'}, 
            x: 0.5, y: 0.98, xanchor: 'center'
        },
        yaxis: { 
            side: 'right',          
            color: '#fff',          
            showline: false,     // CHANGED: Remove axis line
            mirror: false,          
            tickfont: {size:11, weight:'bold'}, 
            tickprefix: '    ',
            fixedrange: true,
            showgrid: false
        },
        xaxis: { 
            title: '', 
            showline: false,     // CHANGED: Remove axis line
            tickfont: {color:'#ccc', size:9}, 
            fixedrange: true,
            showgrid: false
        },
        margin: { t: 30, b: 30, l: 30, r: 65 }, 
    }, { displayModeBar: false, responsive: true });

    // --- CHART 2: DELTA (Right) ---
    Plotly.newPlot('surf-right', [{
        type: 'heatmap',
        x: xDelta,
        y: expiries,
        z: zValues, 
        colorscale: 'YlOrRd', 
        showscale: false,
        opacity: 0.8,      
        xgap: 0, ygap: 0   
    }], {
        ...LAYOUT_BASE,
        title: { 
            text: 'Delta by expiry', 
            font: {size:11, color:'#bbb'}, 
            x: 0.5, y: 0.98, xanchor: 'center'
        },
        yaxis: { 
            side: 'left',
            showticklabels: false, 
            showline: false,     // CHANGED: Remove axis line
            mirror: false,
            fixedrange: true,
            ticks: '',           // CHANGED: Removed ticks to clean up the edge
//          ticks: 'outside', tickcolor: '#fff', ticklen: 5 
            showgrid: false 
        },
        xaxis: { 
            title: '', 
            type: 'category', 
            showline: false,     // CHANGED: Remove axis line
            tickfont: {color:'#ccc', size:9}, 
            fixedrange: true,
            showgrid: false
        },
        margin: { t: 30, b: 30, l: 10, r: 30 }, 
    }, { displayModeBar: false, responsive: true });

    // UPDATED: Pass zValues for smart text analysis
    updateLegend(showMonthly, zValues);
}


