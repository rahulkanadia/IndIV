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

const descriptions = {
    't-intra': "Intraday IV & RV: Tracks IV and RV movement. Divergence signals regime shifts.",
    't-skew': "Volatility Skew: IV difference between OTM Puts/Calls. Steep curve = Fear.",
    't-term': "Term Structure: IV across expirations. Backwardation (down slope) = Stress.",
    't-surf': "Vol Surface: Heatmap view. Left: IV vs Moneyness. Right: IV vs Delta."
};

let activeTab = 0; 

export function renderChartDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

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
                <div id="dynamicInputs" class="control-section left"></div>
                <div id="dynamicCenterControls" class="control-section center"></div>
                <div id="dynamicLegends" class="control-section right"></div>
            </div>

            <div id="chart-canvas-container" style="flex:1; width:100%; min-height:0; position:relative; overflow:hidden;">
                <div id="chart-canvas" style="width:100%; height:100%;"></div>
            </div>
            
            <div id="chart-help-text" class="chart-help-text"></div>
        </div>
    `;

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
    const canvasId = 'chart-canvas';
    const canvas = document.getElementById(canvasId);

    if (tab && canvas) {
        // 1. NUCLEAR CLEANUP
        try {
            Plotly.purge(canvasId); // Kill existing Plotly instance
        } catch (e) { console.warn("Plotly purge failed", e); }
        
        canvas.innerHTML = ''; // Wipe DOM
        canvas.removeAttribute('class'); // Remove any lingering styles
        canvas.removeAttribute('style'); 
        canvas.style.width = "100%"; // Reset basic style
        canvas.style.height = "100%";

        // 2. Clear Controls
        document.getElementById('dynamicCenterControls').innerHTML = '';
        document.getElementById('dynamicInputs').innerHTML = '';
        document.getElementById('dynamicLegends').innerHTML = '';

        // 3. Render New Chart
        // We use a small timeout to let the DOM settle after the wipe
        setTimeout(() => {
            tab.render(canvasId, true);
        }, 10);

        // 4. Update Help Text
        const helpContainer = document.getElementById('chart-help-text');
        if(helpContainer) {
            helpContainer.textContent = descriptions[tab.id] || "";
        }
    }
}
