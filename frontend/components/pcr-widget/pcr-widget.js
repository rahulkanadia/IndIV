export function renderPCRSpark(containerId, pcrData) {
    const container = document.getElementById(containerId);
    if (!container || !pcrData || !pcrData.history) return;

    const currentVal = pcrData.history[pcrData.history.length - 1];

    // 1. Structure
    container.innerHTML = `
        <div class="pcr-spark-box">
            <div class="pcr-header-centered">
                <span class="pcr-title-text">PCR: ${currentVal.toFixed(2)}</span>
            </div>
            <div id="pcr-spark-chart"></div>
        </div>
    `;

    // 2. Determine Marker Colors
    // Red (>1), Grey (0.7-1), Green (<0.7)
    const markerColors = pcrData.history.map(val => {
        if (val > 1.0) return '#FF5252';       // Bearish (Red)
        if (val >= 0.7) return '#B0B0B0';      // Neutral (White/Grey)
        return '#00E676';                      // Bullish (Green)
    });

    // 3. Dynamic Range Safety
    // If PCR spikes to 1.8, we don't want the line to cut off.
    const minP = Math.min(...pcrData.history);
    const maxP = Math.max(...pcrData.history);
    // Base range is 0.4 to 1.6. If data exceeds, expand the view.
    const lowerBound = Math.min(0.4, minP - 0.1);
    const upperBound = Math.max(1.6, maxP + 0.1);

    const trace = {
        x: pcrData.time,
        y: pcrData.history,
        type: 'scatter',
        mode: 'lines+markers',
        line: { 
            color: '#FF9800', 
            width: 1,       
            dash: 'dot'     
        },
        marker: { 
            color: markerColors,
            size: 6,
            line: { color: '#121212', width: 1 } 
        },
        hoverinfo: 'y+x'
    };

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        // Left margin allows space for axis labels
        margin: { t: 10, b: 25, l: 55, r: 15 }, 
        
        xaxis: { 
            visible: true, 
            type: 'category', 
            fixedrange: true,
            tickfont: { size: 9, color: '#666' },
            showgrid: false,
            zeroline: false
        },
        
        yaxis: { 
            visible: true, 
            fixedrange: true,
            range: [lowerBound, upperBound], // Safe Dynamic Range
            
            // Custom Text Labels anchored to specific values
            tickmode: 'array',
            tickvals: [0.55, 1.0, 1.45], 
            ticktext: ['BULL', 'NEUTRAL', 'BEAR'],
            tickfont: { 
                size: 9, 
                color: '#888', 
                family: 'Segoe UI', 
                weight: 'bold' 
            },
            showgrid: false, 
            zeroline: false
        },
        
        dragmode: false
    };

    Plotly.newPlot('pcr-spark-chart', [trace], layout, { displayModeBar: false, responsive: true });
}
