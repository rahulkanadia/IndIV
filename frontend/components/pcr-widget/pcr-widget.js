export function renderPCRSpark(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Filter X-Axis labels (Reduce to 1/3)
    const tickVals = [];
    const tickText = [];
    data.time.forEach((t, i) => {
        if (i % 3 === 0) { // Take every 3rd point
            tickVals.push(t);
            tickText.push(t);
        }
    });

    const trace = {
        x: data.time,
        y: data.history,
        mode: 'lines',
        line: { color: '#00E676', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(0, 230, 118, 0.1)',
        hoverinfo: 'y'
    };

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 10, r: 10, b: 25, l: 30 }, // Reduced margins
        xaxis: {
            tickmode: 'array',
            tickvals: tickVals,
            ticktext: tickText,
            showgrid: false,
            color: '#666',
            tickfont: { size: 9 },
            tickangle: 0, // No Rotation
            fixedrange: true
        },
        yaxis: {
            showgrid: true,
            gridcolor: '#333',
            color: '#666',
            tickfont: { size: 9 },
            fixedrange: true
        },
        showlegend: false
    };

    // Header Overlay (Absolute position inside container)
    const currentVal = data.current;
    const colorClass = currentVal > 1 ? '#00E676' : (currentVal < 0.7 ? '#FF5252' : '#E0E0E0');
    
    // Create inner structure
    container.innerHTML = `
        <div style="position: absolute; top: 5px; left: 10px; z-index: 10;">
            <div style="font-size: 10px; color: #888; font-weight: 600;">PCR</div>
            <div style="font-size: 14px; font-weight: 700; color: ${colorClass};">
                ${currentVal.toFixed(2)}
            </div>
        </div>
        <div id="${containerId}-plot" style="width: 100%; height: 100%;"></div>
    `;

    Plotly.newPlot(`${containerId}-plot`, [trace], layout, { displayModeBar: false, responsive: true });
}
