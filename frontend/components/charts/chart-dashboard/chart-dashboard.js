// IMPORTS
import { renderTermChart } from '../term-structure/chart-term.js';
import { renderSkewChart } from '../volatility-skew/chart-skew.js';
import { renderSurfaceCharts } from '../volatility-surface/chart-surface.js';
import { renderIntradayChart } from '../intraday-iv-rv/chart-intraday.js';

const tabs = [
    { id: 't-intra', label: 'INTRADAY IV & RV', render: renderIntradayChart },
    { id: 't-skew', label: 'VOLATILITY SKEW', render: renderSkewChart },
    { id: 't-term', label: 'TERM STRUCTURE', render: renderTermChart },
    { id: 't-surf', label: 'VOLATILITY SURFACE', render: renderSurfaceCharts }
];

let activeTab = 0; 

export function renderChartDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Setup Shell
    // Note: We swapped the IDs in the HTML structure below
    // Left: dynamicInputs (Toggle), Right: dynamicLegends (Legend)
    container.innerHTML = `
        <div class="chart-dashboard-wrapper">
            <div class="chart-tabs">
                ${tabs.map((t, i) => `
                    <div class="chart-tab ${i === activeTab ? 'active' : ''}" data-index="${i}">
                        ${t.label}
                    </div>
                `).join('')}
            </div>

            <div class="chart-controls">
                <div id="dynamicInputs" class="control-section left"></div>  <div id="dynamicCenterControls" class="control-section center"></div>
                <div id="dynamicLegends" class="control-section right"></div> </div>

            <div id="chart-canvas" style="width:100%; height:100%;"></div>
        </div>
    `;

    // 2. Click Handlers
    const tabEls = container.querySelectorAll('.chart-tab');
    tabEls.forEach(el => {
        el.addEventListener('click', (e) => {
            tabEls.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            activeTab = parseInt(e.target.getAttribute('data-index'));
            loadActiveChart();
        });
    });

    loadActiveChart();
}

function loadActiveChart() {
    const tab = tabs[activeTab];
    if (tab && tab.render) {
        // Clear center controls to prevent accumulation
        const center = document.getElementById('dynamicCenterControls');
        if(center) center.innerHTML = '';
        
        tab.render('chart-canvas');

        // CRITICAL FIX: Force Plotly to resize after rendering 
        // This solves the issue of charts not appearing when switching tabs
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }
}
