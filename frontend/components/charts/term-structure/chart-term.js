// REMOVED: import { mockData } ...

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 40 },
};

export function renderTermChart(containerId, chartData) {
    // Extract Term Data
    const d = chartData.term || { expiries: [], weekly: [] };

    if (!d.expiries || d.expiries.length === 0) {
        document.getElementById(containerId).innerHTML = '<div style="color:#666;text-align:center;padding-top:20px;">No Term Structure Data</div>';
        return;
    }

    const traceWk = { 
        x: d.expiries, y: d.weekly, 
        mode: 'lines+markers', name: 'Term Structure', 
        line: { color: '#FF9800', width: 2 }, marker: { size: 4 },
        type: 'scatter' 
    };

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { showgrid: false, tickfont: { color: '#fff', size: 10 } },
        yaxis: { gridcolor: '#1f1f1f', tickfont: { color: '#fff', size: 10 }, range: [10, 20] }
    };

    Plotly.react(containerId, [traceWk], layout, { displayModeBar: false, responsive: true });
    
    // Clear legend for this simple view
    const leg = document.getElementById('dynamicLegends');
    if(leg) leg.innerHTML = '';
}
