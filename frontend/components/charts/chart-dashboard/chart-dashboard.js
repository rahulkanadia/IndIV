// ... imports ...
import { renderSkewChart, updateLegend as updateSkewLegend } from '../volatility-skew/chart-skew.js';
import { renderTermChart, updateLegend as updateTermLegend } from '../term-structure/chart-term.js';
import { renderSurfaceCharts, updateLegend as updateSurfaceLegend } from '../volatility-surface/chart-surface.js';

export function renderChartDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="tabs-container">
            <button class="tab-btn active" data-target="skew">Volatility Skew</button>
            <button class="tab-btn" data-target="term">Term Structure</button>
            <button class="tab-btn" data-target="surface">Volatility Surface</button>
        </div>
        <div class="dashboard-wrapper">
            <div class="dashboard-controls">
                <div id="dynamicInputs"></div>
                <div id="dynamicCenterControls"></div>
                <div id="dynamicLegends"></div>
            </div>
            <div class="chart-stack">
                <div id="layer-skew" class="chart-layer active"><div id="chart-skew" class="full-chart"></div></div>
                <div id="layer-term" class="chart-layer"><div id="chart-term" class="full-chart"></div></div>
                <div id="layer-surface" class="chart-layer">
                    <div class="surface-split">
                        <div id="surf-money" class="surface-half"></div>
                        <div id="surf-delta" class="surface-half"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // INIT WITH TRUE (Monthly On)
    renderSkewChart('chart-skew', true);
    renderTermChart('chart-term', true);
    renderSurfaceCharts('surf-money', 'surf-delta');

    updateSkewLegend(true); 

    const tabs = container.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetName = e.target.dataset.target;
            handleTabSwitch(targetName, container, tabs, btn);
        });
    });
}
// ... handleTabSwitch remains same ...
function handleTabSwitch(targetName, container, allTabs, clickedBtn) {
    allTabs.forEach(t => t.classList.remove('active'));
    clickedBtn.classList.add('active');

    container.querySelectorAll('.chart-layer').forEach(l => l.classList.remove('active'));
    container.querySelector(`#layer-${targetName}`).classList.add('active');

    if (targetName === 'skew') updateSkewLegend(true); // Always refresh Legend state
    if (targetName === 'term') updateTermLegend(true);
    if (targetName === 'surface') updateSurfaceLegend();
}
