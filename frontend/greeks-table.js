export function renderGreeksTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Initial Render of the Shell (Toolbar + Table Wrapper)
    container.innerHTML = `
        <div class="table-toolbar">
            <div class="toolbar-expiries">
                <div class="tool-tab active" data-expiry="0">26 Dec (Wk)</div>
                <div class="tool-tab" data-expiry="1">02 Jan (Wk)</div>
                <div class="tool-tab" data-expiry="2">09 Jan (Wk)</div>
                <div class="tool-tab" data-expiry="3">16 Jan (Wk)</div>
                <div class="tool-tab" data-expiry="4">23 Jan (Wk)</div>
                <div class="tool-tab" data-expiry="5">30 Jan (Mo)</div>
            </div>
            <div class="toolbar-toggle-wrapper">
                <label style="color:#fff; font-size:11px; display:flex; gap:6px; cursor:pointer; font-weight:bold;">
                    <input type="checkbox" id="majorToggle"> Major Strikes
                </label>
            </div>
        </div>

        <div class="table-wrapper">
            <table>
                <colgroup><col class="greeks" span="5"><col class="strike"><col class="greeks" span="5"></colgroup>
                <thead>
                    <tr><th>GAMMA</th><th>VEGA</th><th>THETA</th><th>DELTA</th><th>IV%</th><th>STRIKE</th><th>IV%</th><th>DELTA</th><th>THETA</th><th>VEGA</th><th>GAMMA</th></tr>
                </thead>
                <tbody id="tableBody"></tbody>
            </table>
        </div>
        <div class="quote-ticker">"He who has a why to live can bear almost any how." – Friedrich Nietzsche</div>
    `;

    // 2. Logic to Generate Rows (Moved from V1 script)
    const generateRows = (isMajorOnly) => {
        const tbody = document.getElementById("tableBody");
        if (!tbody) return;

        const atm = 26200; // Mock ATM center
        let rowsHTML = "";
        let step = isMajorOnly ? 100 : 50;

        for (let i = -10; i <= 10; i++) {
            let k = atm + (i * step);
            let isATM = i === 0;
            let dist = Math.abs(i);

            // Mock Greek Calculations for visuals
            let gamma = 0.0035 - (dist * 0.0001);
            let vega = 15 - (dist * 0.2);
            
            // Heatmap logic
            let heatG = gamma > 0.003 ? 'heat-high' : (gamma > 0.002 ? 'heat-med' : '');
            let heatV = vega > 14 ? 'heat-high' : (vega > 12 ? 'heat-med' : '');

            rowsHTML += `
            <tr class="${isATM ? 'atm-row' : ''}">
                <td class="${heatG}">${gamma.toFixed(4)}</td>
                <td class="${heatV}">${vega.toFixed(1)}</td>
                <td style="color:#888">-14.2</td>
                <td class="c-g">0.52</td>
                <td class="c-g" style="font-family:monospace">12.4</td>
                <td class="strike-cell">${k}</td>
                <td class="c-r" style="font-family:monospace">12.9</td>
                <td class="c-r">-0.48</td>
                <td style="color:#888">-14.2</td>
                <td class="${heatV}">${vega.toFixed(1)}</td>
                <td class="${heatG}">${gamma.toFixed(4)}</td>
            </tr>`;
        }
        tbody.innerHTML = rowsHTML;
    };

    // 3. Attach Event Listeners
    
    // Toggle Logic
    const toggle = container.querySelector('#majorToggle');
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            generateRows(e.target.checked);
        });
    }

    // Expiry Tab Logic
    const tabs = container.querySelectorAll('.tool-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            // Add to clicked
            tab.classList.add('active');
            // Re-render table (Mock refresh)
            generateRows(toggle ? toggle.checked : false);
        });
    });

    // 4. Initial Render
    generateRows(false);
}
