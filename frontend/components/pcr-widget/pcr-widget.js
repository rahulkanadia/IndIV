export function renderPCRSpark(containerId, pcrData) {
    const container = document.getElementById(containerId);
    if (!container || !pcrData || !pcrData.history) return;

    // 1. Structure
    container.innerHTML = `
        <div class="pcr-spark-box">
            <div class="pcr-header-centered">
                <span class="pcr-title-text">Intraday PCR</span>
            </div>
            <div id="pcr-spark-chart"></div>
        </div>
    `;

    // 2. Prepare Data for the "Strip"
    // We map each value to a specific color
    const colors = pcrData.history.map(val => {
        if (val > 1.0) return '#D32F2F';       // Red (Bearish)
        if (val >= 0.7) return '#757575';      // Grey/White (Neutral) - using Grey for better text contrast
        return '#388E3C';                      // Green (Bullish)
    });

    // We map values to text strings
    const textLabels = pcrData.history.map(val => val.toFixed(2));

    // Dummy Y-values (all 1 so bars are equal height)
    const yValues = new Array(pcrData.history.length).fill(1);

    const trace = {
        x: pcrData.time,
        y: yValues,
        text: textLabels,
        textposition: 'auto', // Smart positioning (usually inside)
        type: 'bar',
        marker: {
            color: colors,
            line: {
                color: '#121212', // Dark separator between blocks
                width: 2
            }
        },
        hoverinfo: 'x+text', // Show Time + PCR Value on hover
        insidetextfont: {
            family: 'Segoe UI',
            size: 11,
            color: '#fff',
            weight: 'bold'
        }
    };

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 0, b: 20, l: 0, r: 0 }, // Minimal margins
        
        xaxis: { 
            visible: true, 
            type: 'category', 
            fixedrange: true,
            tickfont: { size: 10, color: '#666' },
            showgrid: false,
            zeroline: false
        },
        
        yaxis: { 
            visible: false, // Hide Y axis completely
            fixedrange: true,
            range: [0, 1] 
        },
        
        bargap: 0, // CRITICAL: Makes bars touch like a Gantt chart
        dragmode: false
    };

    Plotly.newPlot('pcr-spark-chart', [trace], layout, { displayModeBar: false, responsive: true });
}
