import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 20 }
};

// ... (updateLegend function remains the same) ...

export function renderTermChart(containerId, showMonthly) {
    const traces = [
        { x: mockData.term.expiries, y: mockData.term.weekly, name: 'Wk', line: { color: '#FF9800' }, type: 'scatter' }
    ];
    if (showMonthly) {
        traces.push(
            { x: mockData.term.expiries, y: mockData.term.monthly, name: 'Mo', line: { color: '#42A5F5' }, type: 'scatter' }
        );
    }

    // 1. GET GLOBAL RANGE
    const globalRange = getGlobalIVRange();

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { 
            showgrid: false, 
            fixedrange: true, 
            tickfont: { color: '#fff', size: 10 } 
        },
        yaxis: { 
            gridcolor: '#222', 
            fixedrange: true,
            
            // 2. STRICT SYNC SETTINGS
            range: globalRange,
            autorange: false,
            dtick: 1.0,           // <--- FORCES STEP SIZE OF 1 (No more 2.0 steps)
            
            tickformat: '.1f',
            ticks: 'outside',
            ticklen: 8,
            tickcolor: 'rgba(0,0,0,0)',
            tickfont: { color: '#fff', size: 10 }
        }
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
}
