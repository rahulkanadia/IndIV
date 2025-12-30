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

    // 2. Trace
    const trace = {
        x: pcrData.time,
        y: pcrData.history,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#FF9800', width: 2 },
        marker: { size: 4, color: '#FF9800' },
        hoverinfo: 'y+x'
    };

    // 3. Layout
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 5, b: 20, l: 10, r: 10 },
        
        xaxis: { 
            visible: true, 
            type: 'category', // FORCE CATEGORY TYPE (Fixes 0, 2, 4 issue)
            fixedrange: true,
            tickfont: { size: 9, color: '#666' },
            showgrid: false,
            zeroline: false
        },
        
        yaxis: { 
            visible: false, 
            fixedrange: true, 
            range: [0.4, 1.6]
        },
        
        // 4. Background Zones (Brighter + Borders)
        shapes: [
            // ZONE 1: RED (> 1.0)
            {
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1,
                yref: 'y', y0: 1.0, y1: 2.0,
                fillcolor: 'rgba(255, 82, 82, 0.15)', // Slightly brighter red
                line: { color: 'rgba(255, 255, 255, 0.1)', width: 1 }, // Faint border
                layer: 'below'
            },
            // ZONE 2: WHITE/GREY (0.7 to 1.0)
            {
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1,
                yref: 'y', y0: 0.7, y1: 1.0,
                fillcolor: 'rgba(255, 255, 255, 0.12)', // Brighter white/grey
                line: { color: 'rgba(255, 255, 255, 0.1)', width: 1 }, // Faint border
                layer: 'below'
            },
            // ZONE 3: GREEN (< 0.7)
            {
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1,
                yref: 'y', y0: 0.0, y1: 0.7,
                fillcolor: 'rgba(0, 230, 118, 0.15)', // Slightly brighter green
                line: { color: 'rgba(255, 255, 255, 0.1)', width: 1 }, // Faint border
                layer: 'below'
            }
        ],
        
        dragmode: false
    };

    Plotly.newPlot('pcr-spark-chart', [trace], layout, { displayModeBar: false, responsive: true });
}
