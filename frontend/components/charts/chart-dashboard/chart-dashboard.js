// GO UP ONE LEVEL (..) THEN INTO SPECIFIC FOLDERS
import { renderTermChart } from '../term-structure/chart-term.js';
import { renderSkewChart } from '../volatility-skew/chart-skew.js';
import { renderSurfaceChart } from '../volatility-surface/chart-surface.js';
import { renderIntradayChart } from '../intraday-iv-rv/chart-intraday.js';

const tabs = [
    // 1. INTRADAY
    { id: 't-intra', label: 'INTRADAY IV & RV', render: renderIntradayChart },
    // 2. SKEW
    { id: 't-skew', label: 'VOLATILITY SKEW', render: renderSkewChart },
    // 3. TERM
    { id: 't-term', label: 'TERM STRUCTURE', render: renderTermChart },
    // 4. SURFACE
    { id: 't-surf', label: 'VOLATILITY SURFACE', render: renderSurfaceChart }
];

let activeTab = 0; // Default to Intraday

export function renderChartDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Setup Shell (Tabs + Controls + Canvas)
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

    // 2. Attach Click Handlers
    const tabEls = container.querySelectorAll('.chart-tab');
    tabEls.forEach(el => {
        el.addEventListener('click', (e) => {
            // Update UI
            tabEls.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // Switch Logic
            activeTab = parseInt(e.target.getAttribute('data-index'));
            loadActiveChart();
        });
    });

    // 3. Load Initial Chart
    loadActiveChart();
}

function loadActiveChart() {
    const tab = tabs[activeTab];
    if (tab && tab.render) {
        tab.render('chart-canvas'); 
    }
}
