// REMOVED: import { mockData } ...

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 40 }, 
};

export function renderSkewChart(containerId, chartData) {
    const d = chartData.skew || { strikes: [], weekly: [] };
    
    // Fallback if empty (e.g. initial load)
    if (!d.strikes || d.strikes.length === 0) {
        document.getElementById(containerId).innerHTML = '<div style="color:#666;text-align:center;padding-top:20px;">No Skew Data Available</div>';
        return;
    }

    const traceWk = { 
        x: d.strikes, y: d.weekly || [], 
        mode: 'lines+markers', name: 'Skew', 
        line: { color: '#FF9800', width: 2, shape: 'spline' },
        marker: { size: 4 }
    };

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { showgrid: false, gridcolor: '#222', tickfont: { color: '#fff', size: 10 } },
        yaxis: { gridcolor: '#1f1f1f', tickfont: { color: '#fff', size: 10 } }
    };

    Plotly.react(containerId, [traceWk], layout, { displayModeBar: false, responsive: true });
}
