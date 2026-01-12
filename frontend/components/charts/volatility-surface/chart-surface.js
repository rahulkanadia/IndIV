// REMOVED: import { mockData } ...

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
};

export function renderSurfaceCharts(containerId, chartData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const d = chartData.surface || {};
    // Ensure we have minimal data
    const zValues = d.zWeekly || []; 
    const expiries = d.expiries || [];
    
    if (zValues.length === 0 || expiries.length === 0) {
        container.innerHTML = '<div style="color:#666;text-align:center;padding-top:20px;">Building Surface Model...</div>';
        return;
    }

    // Reuse Mock structure for labels if live doesn't provide them yet
    const xMoneyness = d.moneynessLabels || ['-10%', '-5%', 'ATM', '+5%', '+10%'];
    const xDelta = d.deltaLabels || ['90', '75', '50', '25', '10'];

    container.innerHTML = `
        <div style="display: flex; width: 100%; height: 100%;">
            <div id="surf-left" style="flex: 0 0 calc(50% + 30px); height: 100%;"></div>
            <div id="surf-right" style="flex: 0 0 calc(50% - 30px); height: 100%;"></div>
        </div>
    `;

    // CHART 1: MONEYNESS (Left)
    Plotly.newPlot('surf-left', [{
        type: 'heatmap',
        x: xMoneyness, y: expiries, z: zValues,
        colorscale: 'Blues', showscale: false,
        xgap: 1, ygap: 1
    }], {
        ...LAYOUT_BASE,
        title: { text: 'Moneyness', font: {size:11, color:'#bbb'}, x: 0.5, y: 0.98 },
        yaxis: { side: 'right', color: '#fff', fixedrange: true },
        xaxis: { color: '#ccc', fixedrange: true },
        margin: { t: 30, b: 30, l: 30, r: 65 }, 
    }, { displayModeBar: false, responsive: true });

    // CHART 2: DELTA (Right)
    Plotly.newPlot('surf-right', [{
        type: 'heatmap',
        x: xDelta, y: expiries, z: zValues, 
        colorscale: 'YlOrRd', showscale: false,
        xgap: 1, ygap: 1
    }], {
        ...LAYOUT_BASE,
        title: { text: 'Delta', font: {size:11, color:'#bbb'}, x: 0.5, y: 0.98 },
        yaxis: { showticklabels: false, fixedrange: true },
        xaxis: { color: '#ccc', fixedrange: true },
        margin: { t: 30, b: 30, l: 5, r: 30 }, 
    }, { displayModeBar: false, responsive: true });
}
