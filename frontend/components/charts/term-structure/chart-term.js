import { mockData, getGlobalIVRange } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 20 },
    // disable animation transitions globally for this layout
    transition: { duration: 0 } 
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

export function renderTermChart(containerId, showMonthly) {
    const traces = [
        { x: mockData.term.expiries, y: mockData.term.weekly, name: 'Wk', line: { color: '#FF9800' }, type: 'scatter' }
    ];

    if (showMonthly) {
        traces.push(
            { x: mockData.term.expiries, y: mockData.term.monthly, name: 'Mo', line: { color: '#42A5F5' }, type: 'scatter' }
        );
    }

    // 1. Calculate Range BEFORE layout definition
    const globalRange = getGlobalIVRange();

    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { showgrid: false, fixedrange: true, tickfont: { color: '#fff', size: 10 } },
        yaxis: { 
            gridcolor: '#222', 
            fixedrange: true,
            
            // 2. EXPLICITLY SET RANGE (Stops the jump)
            range: globalRange,
            autorange: false,     // Crucial: Tells Plotly "Do not guess"
            dtick: 1.0,
            ticks: 'outside',
            ticklen: 8,
            tickcolor: 'rgba(0,0,0,0)',
            tickfont: { color: '#fff', size: 10 }
        }
    };

    // 3. Just use react (faster/simpler than newPlot for updates)
    Plotly.react(containerId, traces, layout, { displayModeBar: false, responsive: true });
}
