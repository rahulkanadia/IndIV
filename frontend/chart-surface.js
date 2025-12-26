import { mockData } from '../../../mockdata.js';

const LAYOUT_CONTOUR = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    xaxis: { title: '', tickfont: {size: 9}, color: '#888', fixedrange: true },
    yaxis: { title: '', tickfont: {size: 9}, color: '#888', fixedrange: true },
    dragmode: false
};

export function renderSurfaceCharts(containerId1, containerId2) {
    Plotly.newPlot(containerId1, [{ 
        z: mockData.surfMoney.z, x: mockData.surfMoney.x, y: mockData.surfMoney.y, 
        type: 'heatmap', colorscale: 'Viridis', showscale: false 
    }], { 
        ...LAYOUT_CONTOUR, 
        margin: { t: 20, b: 20, l: 30, r: 10 },
        title: {text: 'IV vs Moneyness', font:{size:10, color:'#666'}, y:0.95} 
    }, { displayModeBar: false, responsive: true });

    Plotly.newPlot(containerId2, [{ 
        z: mockData.surfDelta.z, x: mockData.surfDelta.x, y: mockData.surfDelta.y, 
        type: 'heatmap', colorscale: 'Plasma', showscale: false 
    }], { 
        ...LAYOUT_CONTOUR, 
        margin: { t: 20, b: 20, l: 30, r: 10 },
        title: {text: 'IV vs Delta', font:{size:10, color:'#666'}, y:0.95} 
    }, { displayModeBar: false, responsive: true });

    // Update Legends via DOM
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    
    // Only update if 'surf' tab is active
    if(leg && inp && document.querySelector('[data-target="surf"].active')) {
        leg.innerHTML = `<span style="color:#00E676">Moneyness</span> | <span style="color:#FF9800">Delta</span>`;
        inp.innerHTML = '';
    }
}
