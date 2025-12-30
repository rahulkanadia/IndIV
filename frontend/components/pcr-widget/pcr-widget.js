export function renderPCRSpark(containerId, pcrData) {
    const container = document.getElementById(containerId);
    if (!container || !pcrData || !pcrData.history) return;

    const currentVal = pcrData.history[pcrData.history.length - 1];

    // 1. Structure (Centered Title)
    container.innerHTML = `
        <div class="pcr-spark-box">
            <div class="pcr-header-centered">
                <span class="pcr-title-text">PCR: ${currentVal.toFixed(2)}</span>
            </div>
            <div id="pcr-spark-chart"></div>
        </div>
    `;

    // 2. The Data Line
    const trace = {
        x: pcrData.time,
        y: pcrData.history,
        type: 'scatter',
        mode: 'lines+markers', // Added Markers
        line: { color: '#FF9800', width: 2 },
        marker: { size: 4, color: '#FF9800' }, // Small markers
        hoverinfo: 'y+x'
    };

    // 3. Layout with Background Zones
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 5, b: 20, l: 10, r: 10 }, // Minimal margins
        
        xaxis: { 
            visible: true, 
            fixedrange: true,
            tickfont: { size: 9, color: '#666' },
            showgrid: false,
            zeroline: false
        },
        
        yaxis: { 
            visible: false, // Hide Axis Labels completely
            fixedrange: true, 
            range: [0.4, 1.6] // Fixed range to ensure zones stay proportional
        },
        
        // 4. THE TRAFFIC LIGHT BACKGROUND ZONES
        shapes: [
            // ZONE 1: RED (> 1.0)
            {
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1,
                yref: 'y', y0: 1.0, y1: 2.0, // Goes up to max
                fillcolor: 'rgba(255, 82, 82, 0.1)', // Faint Red
                line: { width: 0 },
                layer: 'below'
            },
            // ZONE 2: GREY (0.7 to 1.0)
            {
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1,
                yref: 'y', y0: 0.7, y1: 1.0,
                fillcolor: 'rgba(255, 255, 255, 0.05)', // Faint Grey
                line: { width: 0 },
                layer: 'below'
            },
            // ZONE 3: GREEN (< 0.7)
            {
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1,
                yref: 'y', y0: 0.0, y1: 0.7,
                fillcolor: 'rgba(0, 230, 118, 0.1)', // Faint Green
                line: { width: 0 },
                layer: 'below'
            }
        ],
        
        dragmode: false
    };

    Plotly.newPlot('pcr-spark-chart', [trace], layout, { displayModeBar: false, responsive: true });
}
