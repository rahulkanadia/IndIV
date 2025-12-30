export function renderPCRSpark(containerId, pcrDataArray) {
    const container = document.getElementById(containerId);
    if (!container || !pcrDataArray || pcrDataArray.length === 0) return;

    // 1. Get Values & Color Logic
    const currentVal = pcrDataArray[pcrDataArray.length - 1];
    
    // Logic: If < 1.0 (Bullish/Green), If > 1.0 (Bearish/Red)
    const isBullish = currentVal < 1.0;
    const color = isBullish ? '#00E676' : '#FF5252';
    const fillColor = isBullish ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)';

    // 2. Inject HTML Structure
    container.innerHTML = `
        <div class="pcr-spark-box">
            <div class="pcr-spark-row">
                <span class="pcr-label">PCR Trend</span>
                <span class="pcr-value-text" style="color:${color}">${currentVal.toFixed(2)}</span>
            </div>
            <div id="pcr-spark-chart"></div>
        </div>
    `;

    // 3. Render Plotly Chart
    const trace = {
        y: pcrDataArray,
        type: 'scatter',
        mode: 'lines',
        line: { color: color, width: 2, shape: 'spline' }, // 'spline' makes it smooth
        fill: 'tozeroy', 
        fillcolor: fillColor,
        hoverinfo: 'y'
    };

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 5, b: 5, l: 0, r: 0 }, // Tight margins
        xaxis: { visible: false, fixedrange: true },
        // Dynamic Y-Range: Adds a 10% buffer to min/max so the line doesn't hit the edges
        yaxis: { 
            visible: false, 
            fixedrange: true,
            range: [Math.min(...pcrDataArray) * 0.95, Math.max(...pcrDataArray) * 1.05] 
        },
        dragmode: false
    };

    Plotly.newPlot('pcr-spark-chart', [trace], layout, { displayModeBar: false, responsive: true });
}
