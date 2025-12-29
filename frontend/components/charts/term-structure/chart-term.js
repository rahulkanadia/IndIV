import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_CLEAN = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    xaxis: { showgrid: false, fixedrange: true },
    yaxis: { gridcolor: '#222', fixedrange: true },
    dragmode: false
};

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

// ... imports and updateLegend ...

export function renderTermChart(containerId, showMonthly) {
    const traces = [
        { x: mockData.term.expiries, y: mockData.term.weekly, name: 'Wk', line: { color: '#FF9800' }, type: 'scatter' }
    ];

    if (showMonthly) {
        traces.push(
            { x: mockData.term.expiries, y: mockData.term.monthly, name: 'Mo', line: { color: '#42A5F5' }, type: 'scatter' }
        );
    }

    const globalRange = getGlobalIVRange();

    const layout = {
        ...LAYOUT_CLEAN,
        showlegend: false,
        margin: { t: 20, b: 30, l: 40, r: 20 },
        transition: { duration: 0 }, // Keep this to prevent data animation
        yaxis: { 
            ...LAYOUT_CLEAN.yaxis, 
            autorange: false,
            range: globalRange,
            tickformat: '.1f',
            ticks: 'outside',
            ticklen: 8,
            tickcolor: 'rgba(0,0,0,0)',
            tickfont: { color: '#fff', size: 10 }
        }
    };

    // --- THE FIX: PURGE OLD CHART ---
    // If a chart already exists, destroy it. 
    // This stops Plotly from trying to "animate" from the old axis range to the new one.
    const container = document.getElementById(containerId);
    if (container) {
        Plotly.purge(containerId);
    }

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
}
