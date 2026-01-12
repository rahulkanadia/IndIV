export function renderSDTable(containerId, fullData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Extract Data safely
    // We expect fullData.sdTable, but fallback gracefully
    const data = fullData.sdTable || { 
        levels: ["+2 SD", "+1 SD", "Mean", "-1 SD", "-2 SD"],
        call: ["-", "-", "-", "-", "-"],
        put: ["-", "-", "-", "-", "-"]
    };
    
    // Also use Header data for context if available
    const spot = fullData.header ? fullData.header.spot : 0;
    const iv = fullData.gridWeekly && fullData.gridWeekly[5] ? fullData.gridWeekly[5].value : "0%";

    // 2. Render
    container.innerHTML = `
        <div class="sd-container">
            <div class="sd-header">Weekly: based on Spot ${spot.toLocaleString()}</div>
            <table class="exp-table">
                <thead><tr><th>Range</th><th>Lower (Put)</th><th>Upper (Call)</th></tr></thead>
                <tbody>
                    <tr>
                        <td style="color:#aaa">1 SD (68%)</td>
                        <td style="color:#FF5252">${data.put[3] || '-'}</td>
                        <td style="color:#00E676">${data.call[1] || '-'}</td>
                    </tr>
                    <tr>
                        <td style="color:#aaa">2 SD (95%)</td>
                        <td style="color:#FF5252">${data.put[4] || '-'}</td>
                        <td style="color:#00E676">${data.call[0] || '-'}</td>
                    </tr>
                </tbody>
            </table>
            <div class="sd-footer">IV Reference: ${iv}</div>
        </div>
    `;
}
