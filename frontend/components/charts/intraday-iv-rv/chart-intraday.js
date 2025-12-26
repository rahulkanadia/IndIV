import { mockData } from '../../../mockdata.js';

const LAYOUT_2D = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    xaxis: { showgrid: false, fixedrange: true, color: '#666' },
    yaxis: { gridcolor: '#222', fixedrange: true },
    dragmode: false
};

// ... [Keep getSmartRange helper] ...
function getSmartRange(dataArrays) {
    let all = [];
    dataArrays.forEach(arr => all.push(...arr));
    const minV = Math.min(...all);
    const maxV = Math.max(...all);
    const pad = (maxV - minV) * 0.1; 
    return [minV - (pad||1.0), maxV + (pad||1.0)];
}

// Export Legend Updater
export function updateLegend() {
    // Intraday legends are actually static in the HTML header in this design, 
    // but we define this for consistency if we want to change them later.
}

export function renderIntradayChart(containerId) {
    // ... [Keep Axis Generation Logic] ...
    const fullTimeAxis = [];
    let h = 9, m = 15;
    while (h < 15 || (h === 15 && m <= 30)) {
        fullTimeAxis.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        m += 15;
        if (m === 60) { m = 0; h++; }
    }
    const generateTickLabels = () => {
        const ticks = ["09:15"];
        for(let i=10; i<=15; i++) ticks.push(i + ":00");
        ticks.push("15:30");
        return ticks;
    };
    const autoTicks = generateTickLabels();

    const mapToFullAxis = (existingTimes, existingVals) => fullTimeAxis.map(t => {
        const idx = existingTimes.indexOf(t);
        return idx !== -1 ? existingVals[idx] : null;
    });
    
    const generateLastValText = (sparseData) => {
        let lastIdx = -1;
        for(let i=sparseData.length-1; i>=0; i--) {
            if(sparseData[i] !== null && sparseData[i] !== undefined) {
                lastIdx = i;
                break;
            }
        }
        return sparseData.map((v, i) => i === lastIdx ? v.toFixed(1) : null);
    };

    const yWk = mapToFullAxis(mockData.intraday.time, mockData.intraday.wk);
    const yMo = mapToFullAxis(mockData.intraday.time, mockData.intraday.mo);
    const yWkRv = mapToFullAxis(mockData.intraday.time, mockData.intraday.wkRv);
    const yMoRv = mapToFullAxis(mockData.intraday.time, mockData.intraday.moRv);

    const traces = [
        { x: fullTimeAxis, y: yWk, name: 'Weekly IV', line: { color: '#FF9800', width: 1 }, connectgaps: true, type: 'scatter', mode:'lines+markers+text', text: generateLastValText(yWk), textposition:'middle right' },
        { x: fullTimeAxis, y: yMo, name: 'Monthly IV', line: { color: '#FF9800', width: 3 }, connectgaps: true, type: 'scatter', mode:'lines+markers+text', text: generateLastValText(yMo), textposition:'middle right' },
        { x: fullTimeAxis, y: yWkRv, name: 'Weekly RV', line: { color: '#42A5F5', width: 1, dash: 'dot' }, connectgaps: true, type: 'scatter', mode:'lines+markers+text', text: generateLastValText(yWkRv), textposition:'middle right' },
        { x: fullTimeAxis, y: yMoRv, name: 'Monthly RV', line: { color: '#42A5F5', width: 2, dash: 'dash' }, connectgaps: true, type: 'scatter', mode:'lines+markers+text', text: generateLastValText(yMoRv), textposition:'middle right' }
    ];

    const range = getSmartRange([mockData.intraday.wk, mockData.intraday.mo, mockData.intraday.wkRv, mockData.intraday.moRv], true);

    const layout = {
        ...LAYOUT_2D,
        title: { text: 'Intraday IV & RV', font: {size: 11, color: '#888'}, x: 0.5 }, // UPDATED TITLE
        showlegend: false,
        margin: { t: 10, b: 25, l: 35, r: 50 }, // REDUCED MARGINS
        yaxis: { ...LAYOUT_2D.yaxis, range: range },
        xaxis: {
            ...LAYOUT_2D.xaxis,
            tickmode: 'array',
            tickvals: autoTicks,
            ticktext: autoTicks,
            tickangle: 0
        }
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
}
