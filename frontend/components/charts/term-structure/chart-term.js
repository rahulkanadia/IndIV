import { mockData } from '../../../mockdata.js';

const LAYOUT_CLEAN = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    xaxis: { showgrid: false, fixedrange: true },
    yaxis: { gridcolor: '#222', fixedrange: true },
    dragmode: false
};

function getSmartRange(dataArrays) {
    let all = [];
    dataArrays.forEach(arr => all.push(...arr));
    const minV = Math.min(...all);
    const maxV = Math.max(...all);
    const pad = (maxV - minV) * 0.1; 
    return [minV - (pad||1.0), maxV + (pad||1.0)];
}

// PUBLIC LEGEND UPDATER
export function updateLegend(showMonthly) {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    leg.innerHTML = `
        <div class="leg-item" style="display:flex; align-items:center; margin-right:15px"><span class="leg-dot" style="background:#FF9800; display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:4px;"></span>Weekly</div> 
        <div class="leg-item" style="display:flex; align-items:center"><span class="leg-dot" style="background:#42A5F5; display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:4px;"></span>Monthly</div>
    `;
    inp.innerHTML = '';
    const lbl = document.createElement('label');
    lbl.style.display = 'flex'; lbl.style.alignItems = 'center'; lbl.style.gap = '4px'; lbl.style.cursor = 'pointer';
    lbl.innerHTML = `<input type="checkbox" ${showMonthly ? 'checked' : ''}> Show Monthly`;
    lbl.querySelector('input').onchange = (e) => renderTermChart('chart-term', e.target.checked);
    inp.appendChild(lbl);
}

export function renderTermChart(containerId, showMonthly) {
    const traces = [
        { x: mockData.term.expiries, y: mockData.term.weekly, name: 'Wk', line: { color: '#FF9800' }, type: 'scatter' }
    ];

    if (showMonthly) {
        traces.push(
            { x: mockData.term.expiries, y: mockData.term.monthly, name: 'Mo', line: { color: '#42A5F5' }, type: 'scatter' }
        );
    }

    const range = getSmartRange([mockData.term.weekly, mockData.term.monthly]);

    const layout = {
        ...LAYOUT_CLEAN,
        showlegend: false,
        margin: { t: 20, b: 30, l: 20, r: 20 },
        yaxis: { ...LAYOUT_CLEAN.yaxis, range: range }
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
}
