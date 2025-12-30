// Helper to generate full market day slots (09:15 to 15:30)
function generateMarketTimeArray() {
    const times = [];
    let h = 9, m = 15;
    while (h < 15 || (h === 15 && m <= 30)) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
        m += 15;
        if (m === 60) { m = 0; h++; }
    }
    return times;
}

export function renderPCRSpark(containerId, pcrData) {
    const container = document.getElementById(containerId);
    if (!container || !pcrData || !pcrData.history) return;

    // 1. Generate Master Timeline (Fixed X-Axis)
    const fullTimeline = generateMarketTimeArray();
    
    // 2. Prepare Data arrays matched to the Full Timeline
    // This ensures that "09:15" data goes into the "09:15" slot, 
    // and future slots remain null/empty.
    const yValues = [];
    const colorValues = [];
    const textValues = [];

    // Create a map for quick lookup
    const dataMap = {};
    pcrData.time.forEach((t, i) => {
        dataMap[t] = pcrData.history[i];
    });

    fullTimeline.forEach(t => {
        const val = dataMap[t];
        if (val !== undefined) {
            yValues.push(1); // Full height bar
            textValues.push(val.toFixed(2));
            
            // Color Logic
            if (val > 1.0) colorValues.push('#D32F2F');      // Red
            else if (val >= 0.7) colorValues.push('#757575'); // Grey
            else colorValues.push('#388E3C');                 // Green
        } else {
            yValues.push(null); // No bar for future times
            textValues.push('');
            colorValues.push('transparent');
        }
    });

    // 3. HTML Structure
    container.innerHTML = `
        <div class="pcr-spark-box">
            <div class="pcr-header-centered">
                <span class="pcr-title-text">Intraday PCR</span>
            </div>
            <div id="pcr-spark-chart"></div>
        </div>
    `;

    // 4. Trace
    const trace = {
        x: fullTimeline, // Use FULL timeline for X-axis
        y: yValues,
        text: textValues,
        textposition: 'auto',
        type: 'bar',
        marker: {
            color: colorValues,
            line: {
                color: '#121212', // Separator color
                width: 2
            }
        },
        hoverinfo: 'x+text',
        insidetextfont: {
            family: 'Segoe UI',
            size: 10,
            color: '#fff',
            weight: 'bold'
        }
    };

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 5, b: 25, l: 0, r: 0 },
        
        xaxis: { 
            visible: true, 
            type: 'category', 
            fixedrange: true,
            tickmode: 'array',
            tickvals: fullTimeline.filter((_, i) => i % 4 === 0), // Show tick every hour (09:15, 10:15...)
            tickfont: { size: 10, color: '#666' },
            showgrid: false,
            zeroline: false
        },
        
        yaxis: { 
            visible: false, 
            fixedrange: true,
            range: [0, 1] 
        },
        
        bargap: 0, // Gantt Effect (Bars touch)
        dragmode: false
    };

    Plotly.newPlot('pcr-spark-chart', [trace], layout, { displayModeBar: false, responsive: true });
}
