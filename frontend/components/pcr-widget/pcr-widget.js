// Helper: Generates 15-min slots for the full Indian trading day (09:15 - 15:30)
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

    // 1. Generate Master Timeline (Fixed 15-min X-Axis)
    const fullTimeline = generateMarketTimeArray();
    
    // 2. Map Data to Timeline
    const yValues = [];
    const colorValues = [];
    const textValues = [];

    // Lookup map for incoming data
    const dataMap = {};
    if (pcrData.time && pcrData.history) {
        pcrData.time.forEach((t, i) => {
            dataMap[t] = pcrData.history[i];
        });
    }

    fullTimeline.forEach(t => {
        const val = dataMap[t];
        if (val !== undefined) {
            yValues.push(1); // Full height bar
            textValues.push(val.toFixed(2));
            
            // Color Logic
            if (val > 1.0) colorValues.push('#D32F2F');      // Red (Bearish)
            else if (val >= 0.7) colorValues.push('#757575'); // Grey (Neutral)
            else colorValues.push('#388E3C');                 // Green (Bullish)
        } else {
            // Future placeholder (Transparent)
            yValues.push(null); 
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

    // 4. Trace Configuration
    const trace = {
        x: fullTimeline,
        y: yValues,
        text: textValues,
        textposition: 'inside',          // Force text inside the block
        insidetextorientation: 'horizontal', // NEVER ROTATE
        type: 'bar',
        marker: {
            color: colorValues,
            line: {
                color: '#121212',        // Dark separator
                width: 2
            }
        },
        hoverinfo: 'x+text',             // Tooltip: Time + Value
        insidetextfont: {
            family: 'Segoe UI',
            size: 9,                     // Small enough to fit horizontally
            color: '#fff',
            weight: 'bold'
        }
    };

    // 5. Layout Configuration
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 5, b: 25, l: 0, r: 0 },
        
        xaxis: { 
            visible: true, 
            type: 'category', 
            fixedrange: true,
            
            // Show tick only every hour (4 * 15min)
            tickmode: 'array',
            tickvals: fullTimeline.filter((_, i) => i % 4 === 0), 
            
            tickfont: { size: 10, color: '#666' },
            showgrid: false,
            zeroline: false
        },
        
        yaxis: { 
            visible: false, 
            fixedrange: true,
            range: [0, 1] 
        },
        
        bargap: 0, // GANTT STRIP EFFECT
        dragmode: false
    };

    Plotly.newPlot('pcr-spark-chart', [trace], layout, { displayModeBar: false, responsive: true });
}
