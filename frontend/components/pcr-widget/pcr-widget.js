export function renderPCRSpark(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Filter X-Axis labels (Keep every 3rd label)
    const tickVals = [];
    const tickText = [];
    data.time.forEach((t, i) => {
        if (i % 3 === 0) { 
            tickVals.push(t);
            tickText.push(t);
        }
    });

    // 2. Color Logic for Markers
    const currentVal = data.current;
    const markerColors = data.history.map(val => {
        if (val >= 1.0) return '#00E676';
        if (val <= 0.7) return '#FF5252';
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
        
        // CRITICAL: Tighter margins to remove blank space
        // 't: 30' leaves room for Title. 'b: 20' is minimal for X-axis labels.
        margin: { t: 35, r: 15, b: 20, l: 30 }, 
        
        title: {
            text: `PCR: ${currentVal.toFixed(2)}`,
            font: { size: 12, color: '#FF9800', weight: 700 }, // ORANGE
            x: 0.01,
            y: 0.98,
            xanchor: 'middle',
            yanchor: 'top'
        },
        
        xaxis: {
            tickmode: 'array',
            tickvals: tickVals,
            ticktext: tickText,
            showgrid: false,
            color: '#666',
            tickfont: { size: 9 },
            tickangle: 0, // No rotation
            fixedrange: true
        },
        
        yaxis: {
            showgrid: true,
            gridcolor: '#222',
            color: '#666',
            tickfont: { size: 9 },
            fixedrange: true,
            
            // EXACT REQUIREMENT: 0.0 to 2.0 in steps of 0.4
            range: [0, 2], 
            dtick: 0.4
        },
        
        showlegend: false,
        autosize: true
    };

    // Clear and Inject
    container.innerHTML = `<div id="${containerId}-plot"></div>`;
    
    // Create Plot with 'responsive: true'
    Plotly.newPlot(`${containerId}-plot`, [trace], layout, { 
        displayModeBar: false, 
        responsive: true 
    });
}
