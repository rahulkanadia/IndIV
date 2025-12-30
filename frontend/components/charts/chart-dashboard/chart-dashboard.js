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

// CHART HELP DESCRIPTIONS
const descriptions = {
    't-intra': "Intraday IV & RV: Tracks the movement of Implied Volatility (IV) and Realized Volatility (RV) throughout the trading day. Divergence here signals potential regime shifts.",
    't-skew': "Volatility Skew: Shows the IV difference between OTM Puts and Calls. A steep 'smirk' indicates high hedging demand (fear), while a flat curve suggests complacency.",
    't-term': "Term Structure: Compares IV across different expiration dates. Contango (upward slope) is normal; Backwardation (downward slope) signals near-term stress.",
    't-surf': "Volatility Surface: The 3D view of risk. Left chart plots IV against Moneyness (Strike distance), Right chart plots IV against Delta. Use to identify cheap/expensive pockets."
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

            <div id="chart-canvas" style="width:100%; flex:1; min-height:0;"></div>
            
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
    if (tab && tab.render) {
        // 1. Clear center controls
        const center = document.getElementById('dynamicCenterControls');
        if(center) center.innerHTML = '';
        
        // 2. Render Chart
        // Some charts (like Surface) accept 'true' as default for showMonthly
        tab.render('chart-canvas', true); 

        // 3. Update Help Text
        const helpContainer = document.getElementById('chart-help-text');
        if(helpContainer) {
            helpContainer.innerText = descriptions[tab.id] || "";
        }

        // 4. Force Resize
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }
}
