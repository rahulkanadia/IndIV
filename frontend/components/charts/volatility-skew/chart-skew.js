import { mockData, getGlobalIVRange } from '../../../mockdata.js';

// ... (Layout and Helper functions remain the same) ...

export function renderSkewChart(containerId, showMonthly) {
    // ... (Traces logic remains the same) ...

    // 1. GET GLOBAL RANGE
    const globalRange = getGlobalIVRange();

    // ... (y2Ticks logic remains the same) ...

    const layout = {
        ...LAYOUT_CLEAN,
        showlegend: false,
        margin: { t: 20, b: 30, l: 40, r: 40 }, 

        xaxis: { showgrid: false, fixedrange: true, tickfont: { color: '#fff', size: 10 } },

        yaxis2: { 
             // ... (Keep existing y2/Right Axis logic) ...
        },

        // --- LEFT AXIS (SYNCED) ---
        yaxis: { 
            gridcolor: '#222', 
            fixedrange: true, 
            
            // 2. STRICT SYNC SETTINGS
            range: globalRange,
            autorange: false,
            dtick: 1.0,           // <--- MATCHES TERM CHART EXACTLY
            
            overlaying: 'y2', 
            side: 'left',
            ticks: 'outside',
            ticklen: 8,
            tickcolor: 'rgba(0,0,0,0)', 
            tickfont: { color: '#fff', size: 10 }
        }
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
    updateLegend(showMonthly);
}
