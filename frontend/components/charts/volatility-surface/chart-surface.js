import { mockData } from '../../../mockdata.js';

const LAYOUT_CONTOUR = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#666', size: 10 },
    xaxis: { title: '', tickfont: {size: 9}, color: '#888', fixedrange: true },
    yaxis: { title: '', tickfont: {size: 9}, color: '#888', fixedrange: true },
    dragmode: false
};

// PUBLIC LEGEND UPDATER
export function updateLegend() {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    leg.innerHTML = `<span style="color:#00E676; margin-right:10px">Moneyness (X) vs Expiry (Y)</span> | <span style="color:#FF9800; margin-left:10px">Delta (X) vs Expiry (Y)</span>`;
    inp.innerHTML = '<span style="font-size:10px; color:#666; font-style:italic">Heatmap of Implied Volatility</span>';
}

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
}
