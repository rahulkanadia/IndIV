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
    't-intra': "Intraday IV & RV: Divergence signals regime shifts.",
    't-skew': "Volatility Skew: The 'Smile'. Bars show premium spread.",
    't-term': "Term Structure: Slope indicates market stress.",
    't-surf': "Volatility Surface: Visual scan of cheap vs. expensive options."
};

let activeTab = 0; 
let currentData = null; // Store data here

// NEW: Accepts 'data' as the second argument
export function renderChartDashboard(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Store data for tab switching
    currentData = data;

    // Only build DOM if it's empty (First Run)
    if (!container.innerHTML.trim()) {
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
    }

    loadActiveChart();
}

function loadActiveChart() {
    const tab = tabs[activeTab];
    const canvasId = 'chart-canvas';
    const canvas = document.getElementById(canvasId);

    if (tab && canvas && currentData) {
        // 1. Cleanup Plotly
        try { Plotly.purge(canvasId); } catch (e) {}

        // 2. Reset DOM
        canvas.innerHTML = ''; 
        canvas.removeAttribute('style'); 
        canvas.style.width = "100%"; 
        canvas.style.height = "100%";

        // 3. Render with specific data slice
        // We pass the WHOLE charts object so sub-charts can pick what they need
        tab.render(canvasId, currentData, true);

        // 4. Update Help
        const helpContainer = document.getElementById('chart-help-text');
        if(helpContainer) helpContainer.textContent = descriptions[tab.id] || "";
    }
}
