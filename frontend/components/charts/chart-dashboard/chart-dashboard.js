import { renderSkewChart, updateLegend as updateSkewLegend } from '../volatility-skew/chart-skew.js';
import { renderTermChart, updateLegend as updateTermLegend } from '../term-structure/chart-term.js';
import { renderSurfaceCharts, updateLegend as updateSurfaceLegend } from '../volatility-surface/chart-surface.js';

const STRATEGY_TEXT = {
    skew: `<strong>Volatility Skew:</strong> This chart highlights the cost difference between OTM puts and calls. A steep "smirk" (higher Put IV) indicates market fear and hedging demand. If the curve flattens, it suggests complacency. Useful for selecting vertical spreads or ratio spreads.`,
    term: `<strong>Term Structure:</strong> Compares IV across expirations. An upward slope (Contango) is healthy/normal. A downward slope (Inversion) signals immediate market stress or an event risk. Inversion is often a signal to sell short-term premium (Calendars/Diagonals).`,
    surface: `<strong>Volatility Surface:</strong> Visualizes IV across Moneyness and Delta. Look for strike moneyness and expiry co-inciding with deep blue colour (Low IV), this is theoretically safe to buy (Long Gamma). Hot zones (Red/Yellow) suggest high premium selling opportunities.`
};

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

            <div id="chart-footer" class="dashboard-footer"></div>
        </div>
    `;

    // Init Logic
    renderSkewChart('chart-skew', true);
    renderTermChart('chart-term', true);
    renderSurfaceCharts('surf-money', 'surf-delta');

    // Initial State: Skew
    updateSkewLegend(true);
    document.getElementById('chart-footer').innerHTML = STRATEGY_TEXT.skew;

    const tabs = container.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetName = e.target.dataset.target;
            handleTabSwitch(targetName, container, tabs, btn);
        });
    });
}

function handleTabSwitch(targetName, container, allTabs, clickedBtn) {
    allTabs.forEach(t => t.classList.remove('active'));
    clickedBtn.classList.add('active');

    container.querySelectorAll('.chart-layer').forEach(l => l.classList.remove('active'));
    container.querySelector(`#layer-${targetName}`).classList.add('active');

    // Update Controls
    if (targetName === 'skew') updateSkewLegend(true);
    if (targetName === 'term') updateTermLegend(true);
    if (targetName === 'surface') updateSurfaceLegend();

    // Update Footer Text
    const footer = document.getElementById('chart-footer');
    if (footer && STRATEGY_TEXT[targetName]) {
        footer.innerHTML = STRATEGY_TEXT[targetName];
    }
}
