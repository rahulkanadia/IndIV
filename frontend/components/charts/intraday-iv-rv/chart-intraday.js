// Helper: Generates 15-min slots for 09:15 - 15:30
function generateFullDayTimeArray() {
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

export function renderIntradayChart(containerId, intradayData) {
    // 1. Setup Data
    // We Map the incoming data to the first N slots of our full timeline
    const fullTimeline = generateFullDayTimeArray();
    
    // Slice timeline to match data length for plotting
    // (Assuming intradayData.time aligns with the start of the day)
    const activeTime = intradayData.time; 

    const traceWk = {
        x: activeTime, y: intradayData.wk,
        type: 'scatter', mode: 'lines', name: 'Wk IV',
        line: { color: '#FF9800', width: 2 }
    };

    const traceMo = {
        x: activeTime, y: intradayData.mo,
        type: 'scatter', mode: 'lines', name: 'Mo IV',
        line: { color: '#FF9800', width: 4 } // Thicker for visual distinction
    };

    const traceWkRv = {
        x: activeTime, y: intradayData.wkRv,
        type: 'scatter', mode: 'lines', name: 'Wk RV',
        line: { color: '#42A5F5', width: 2, dash: 'dot' }
    };

    const traceMoRv = {
        x: activeTime, y: intradayData.moRv,
        type: 'scatter', mode: 'lines', name: 'Mo RV',
        line: { color: '#42A5F5', width: 2, dash: 'dash' }
    };

    // 2. Layout
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 10, b: 20, l: 30, r: 10 },
        font: { family: 'Segoe UI', color: '#fff', size: 10 },
        showlegend: false, // Custom legend in HTML handled in index.html

        xaxis: {
            // CRITICAL: Force the range to cover 09:15 to 15:30
            // We use the category array index logic or pass the full category list
            type: 'category',
            categoryorder: 'array',
            categoryarray: fullTimeline, // This reserves the space for the whole day
            tickmode: 'array',
            tickvals: fullTimeline.filter((_, i) => i % 4 === 0), // Hourly ticks
            fixedrange: true,
            gridcolor: '#1f1f1f',
            tickfont: { color: '#666' }
        },
        yaxis: {
            gridcolor: '#1f1f1f',
            fixedrange: true,
            tickfont: { color: '#666' }
        }
    };

    const config = { displayModeBar: false, responsive: true };

    Plotly.newPlot(containerId, [traceWk, traceMo, traceWkRv, traceMoRv], layout, config);
}
