export function renderPCRSpark(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Safety: If data is missing or incomplete
    if (!data || !data.time || !data.history) {
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#444;font-size:10px;">Waiting for PCR Data...</div>`;
        return;
    }

    // 1. Filter X-Axis labels (Keep every 3rd label for cleanliness)
    const tickVals = [];
    const tickText = [];
    data.time.forEach((t, i) => {
        if (i % 3 === 0) { 
            tickVals.push(t);
            tickText.push(t);
        }
    });

    // 2. Color Logic
    const currentVal = data.current || 0;
    const markerColors = data.history.map(val => {
        if (val >= 1.0) return '#00E676'; // Green
        if (val <= 0.7) return '#FF5252'; // Red
        return '#666'; 
    });

    const trace = {
        x: data.time,
        y: data.history,
        mode: 'lines+markers',
        line: { color: '#444', width: 1 },
        marker: {
            color: markerColors,
            size: 4,
            symbol: 'circle',
            line: { width: 0 }
        },
        hoverinfo: 'y'
    };

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 25, r: 15, b: 12, l: 30 }, 
        title: {
            text: `PCR: ${currentVal.toFixed(2)}`,
            font: { size: 12, color: '#FF9800', weight: 700 },
            x: 0.5, xanchor: 'center',
            y: 0.92, yanchor: 'top'
        },
        xaxis: {
            tickmode: 'array', tickvals: tickVals, ticktext: tickText,
            showgrid: false, color: '#666', tickfont: { size: 9 }, fixedrange: true
        },
        yaxis: {
            showgrid: true, gridcolor: '#222', color: '#666',
            tickfont: { size: 9 }, fixedrange: true,
            // Dynamic Range: +/- 0.2 from min/max, but keeping reasonable bounds
            range: [Math.min(...data.history) - 0.1, Math.max(...data.history) + 0.1]
        },
        showlegend: false
    };

    // Use a unique ID for the plot div to avoid conflicts
    const plotId = `${containerId}-plot`;
    container.innerHTML = `<div id="${plotId}" style="width: 100%; height: 100%;"></div>`;

    Plotly.newPlot(plotId, [trace], layout, { displayModeBar: false, responsive: true });
}
