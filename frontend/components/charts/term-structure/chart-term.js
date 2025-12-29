import { mockData } from '../../../mockdata.js';

// 1. SIMPLE LAYOUT (Removed strict axis settings here to set them dynamically later)
const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    dragmode: false,
    margin: { t: 20, b: 30, l: 40, r: 20 } // Fixed margins prevent "layout shift"
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
    // 1. PREPARE DATA
    const traces = [
        { x: mockData.term.expiries, y: mockData.term.weekly, name: 'Wk', line: { color: '#FF9800' }, type: 'scatter' }
    ];
    if (showMonthly) {
        traces.push(
            { x: mockData.term.expiries, y: mockData.term.monthly, name: 'Mo', line: { color: '#42A5F5' }, type: 'scatter' }
        );
    }

    // 2. CALCULATE RANGE LOCALY (Live Data Friendly)
    // We scan ALL relevant data to ensure the chart doesn't jump if we toggle lines
    const allValues = [...mockData.term.weekly, ...mockData.term.monthly];
    const minV = Math.min(...allValues);
    const maxV = Math.max(...allValues);
    
    // Add 1-point buffer
    const safeRange = [Math.floor(minV) - 1, Math.ceil(maxV) + 1];

    // 3. DEFINE LAYOUT WITH EXPLICIT RANGE
    const layout = {
        ...LAYOUT_BASE,
        showlegend: false,
        xaxis: { 
            showgrid: false, 
            fixedrange: true, 
            tickfont: { color: '#fff', size: 10 } 
        },
        yaxis: { 
            gridcolor: '#222', 
            fixedrange: true, // Prevents user zoom
            
            // KEY FIX: Hard-set the range immediately
            range: safeRange,
            autorange: false, 
            
            tickformat: '.1f',
            ticks: 'outside',
            ticklen: 8,
            tickcolor: 'rgba(0,0,0,0)', // Invisible padding
            tickfont: { color: '#fff', size: 10 }
        }
    };

    // 4. DRAW
    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
}
