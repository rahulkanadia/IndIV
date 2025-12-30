import { mockData } from '../../../mockdata.js';

const LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', color: '#fff', size: 10 },
    margin: { t: 0, b: 0, l: 0, r: 0 }, // Tight margins for 3D
};

function updateLegend() {
    const leg = document.getElementById('dynamicLegends');
    const inp = document.getElementById('dynamicInputs');
    if(!leg || !inp) return;

    // Surface chart usually doesn't toggle Monthly/Weekly the same way, 
    // but we add a disabled state or simple info to match layout
    inp.innerHTML = `
        <div style="color:#666; font-size:10px; font-style:italic;">
            3D View Interactive
        </div>
    `;

    leg.innerHTML = `
        <div style="display:flex; gap:15px;">
             <div class="leg-item">
                <span style="background:linear-gradient(90deg, #FF9800, #42A5F5); width:12px; height:8px; border-radius:2px; margin-right:6px;"></span>
                Surface Gradient
            </div>
        </div>
    `;
}

export function renderSurfaceCharts(containerId) {
    const data = [{
        type: 'surface',
        x: mockData.surface.strikes,
        y: mockData.surface.expiries,
        z: mockData.surface.z,
        colorscale: [
            [0, '#FF9800'], 
            [1, '#42A5F5']
        ],
        showscale: false,
        contours: {
            z: { show: true, usecolormap: true, highlightcolor: "#fff", project: { z: true } }
        }
    }];

    const layout = {
        ...LAYOUT_BASE,
        scene: {
            xaxis: { title: 'Strike', titlefont:{size:9, color:'#666'}, tickfont:{size:9, color:'#888'}, gridcolor: '#333' },
            yaxis: { title: 'Expiry', titlefont:{size:9, color:'#666'}, tickfont:{size:9, color:'#888'}, gridcolor: '#333' },
            zaxis: { title: 'IV', titlefont:{size:9, color:'#666'}, tickfont:{size:9, color:'#888'}, gridcolor: '#333' },
            camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
            aspectmode: 'cube' // Helps fit in small container
        }
    };

    Plotly.react(containerId, data, layout, { displayModeBar: false, responsive: true });
    updateLegend();
}
