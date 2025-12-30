export function renderPriceCone(containerId, mockData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Structure
    container.innerHTML = `
        <div class="cone-header">
            <div class="cone-title">Expected Move (SD)</div>
            <div class="cone-spot-label">${mockData.spot.toLocaleString()}</div>
        </div>
        <div id="cone-chart"></div>
    `;

    // 2. Parse Levels from Mock Data
    // Assumes mockData.sdTable.call has ["26,800", "26,500", "26,150", "25,800", "25,500"]
    // Indices: 0=+2SD, 1=+1SD, 2=Mean, 3=-1SD, 4=-2SD
    const parse = (str) => parseFloat(str.replace(/,/g, ''));
    
    const sd2Up = parse(mockData.sdTable.call[0]); 
    const sd1Up = parse(mockData.sdTable.call[1]); 
    const mean  = parse(mockData.sdTable.call[2]); 
    const sd1Dn = parse(mockData.sdTable.call[3]); 
    const sd2Dn = parse(mockData.sdTable.call[4]);

    // 3. Generate Mock Price Path (Stay within bands for demo)
    const time = ["09:15", "10:30", "11:45", "13:00", "14:15", "15:30"];
    const prices = [mean, mean + 40, mean - 20, mean + 60, mean + 10, mean + 45];

    const tracePrice = {
        x: time, y: prices,
        type: 'scatter', mode: 'lines',
        line: { color: '#fff', width: 2 },
        hoverinfo: 'y'
    };

    // 4. Layout
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 0, b: 20, l: 0, r: 35 }, // Right margin for axis labels
        
        xaxis: {
            fixedrange: true, visible: true,
            tickfont: { size: 9, color: '#666' },
            showgrid: false
        },
        yaxis: {
            fixedrange: true, visible: true, side: 'right',
            showgrid: false,
            tickfont: { size: 9, color: '#888' },
            range: [sd2Dn - 50, sd2Up + 50] // Dynamic range padding
        },
        
        // THE ZONES
        shapes: [
            // Green Zone (+1SD to -1SD)
            { type: 'rect', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: sd1Dn, y1: sd1Up, fillcolor: 'rgba(0, 230, 118, 0.08)', line: { width: 0 }, layer: 'below' },
            // Red Zones (+2SD to +1SD, -1SD to -2SD)
            { type: 'rect', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: sd1Up, y1: sd2Up, fillcolor: 'rgba(255, 82, 82, 0.08)', line: { width: 0 }, layer: 'below' },
            { type: 'rect', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: sd2Dn, y1: sd1Dn, fillcolor: 'rgba(255, 82, 82, 0.08)', line: { width: 0 }, layer: 'below' },
            
            // Dotted Lines
            { type: 'line', xref: 'paper', x0:0, x1:1, y0:sd1Up, y1:sd1Up, line:{color:'rgba(0,230,118,0.3)', width:1, dash:'dot'} },
            { type: 'line', xref: 'paper', x0:0, x1:1, y0:sd1Dn, y1:sd1Dn, line:{color:'rgba(0,230,118,0.3)', width:1, dash:'dot'} },
            { type: 'line', xref: 'paper', x0:0, x1:1, y0:sd2Up, y1:sd2Up, line:{color:'rgba(255,82,82,0.3)', width:1, dash:'dot'} },
            { type: 'line', xref: 'paper', x0:0, x1:1, y0:sd2Dn, y1:sd2Dn, line:{color:'rgba(255,82,82,0.3)', width:1, dash:'dot'} }
        ],
        
        annotations: [
            { xref: 'paper', x: 1, y: sd1Up, xanchor: 'left', text: '+1SD', showarrow: false, font: {size: 9, color: '#00E676'} },
            { xref: 'paper', x: 1, y: sd1Dn, xanchor: 'left', text: '-1SD', showarrow: false, font: {size: 9, color: '#00E676'} },
            { xref: 'paper', x: 1, y: sd2Up, xanchor: 'left', text: '+2SD', showarrow: false, font: {size: 9, color: '#FF5252'} },
            { xref: 'paper', x: 1, y: sd2Dn, xanchor: 'left', text: '-2SD', showarrow: false, font: {size: 9, color: '#FF5252'} }
        ],
        dragmode: false
    };

    Plotly.newPlot('cone-chart', [tracePrice], layout, { displayModeBar: false, responsive: true });
}
