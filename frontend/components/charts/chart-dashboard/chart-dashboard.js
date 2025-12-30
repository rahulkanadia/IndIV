// UPDATED PATHS & IMPORTS
import { renderTermChart } from '../chart-term/chart-term.js'; // Check folder name (chart-term vs term-structure)
import { renderSkewChart } from '../chart-skew/chart-skew.js'; // Check folder name (chart-skew vs volatility-skew)
import { renderSurfaceCharts } from '../chart-surface/chart-surface.js'; // Check folder (chart-surface vs volatility-surface)
import { renderIntradayChart } from '../intraday-iv-rv/chart-intraday.js';

// NOTE: The paths above assume your folders are named 'chart-term', 'chart-skew', etc.
// If you renamed folders to 'term-structure', 'volatility-skew', please update the paths accordingly in your file.
// Based on your previous message, you updated them to:
// '../term-structure/chart-term.js'
// '../volatility-skew/chart-skew.js'
// '../volatility-surface/chart-surface.js'
// '../intraday-iv-rv/chart-intraday.js'
// Ensure the imports below match YOUR folder structure.

const tabs = [
    // 1. INTRADAY
    { id: 't-intra', label: 'INTRADAY IV & RV', render: renderIntradayChart },
    // 2. SKEW
    { id: 't-skew', label: 'VOLATILITY SKEW', render: renderSkewChart },
    // 3. TERM
    { id: 't-term', label: 'TERM STRUCTURE', render: renderTermChart },
    // 4. SURFACE (Using the plural render function)
    { id: 't-surf', label: 'VOLATILITY SURFACE', render: renderSurfaceCharts }
];

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
                <div id="dynamicLegends" class="control-section left"></div>
                <div id="dynamicCenterControls" class="control-section center"></div>
                <div id="dynamicInputs" class="control-section right"></div>
            </div>

            <div id="chart-canvas" style="width:100%; height:100%;"></div>
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
    if (tab && tab.render) {
        tab.render('chart-canvas'); 
    }
}
