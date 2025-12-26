export function renderSDTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Static rendering based on V1 mockup values
    // In a real app, these values would be calculated from data.spot and data.term
    container.innerHTML = `
        <div class="sd-container">
            <div class="sd-header">Weekly: based on IV 12.8% ±275 pts</div>
            <table class="exp-table">
                <thead><tr><th>Range</th><th>Lower</th><th>Upper</th></tr></thead>
                <tbody>
                    <tr><td style="color:#aaa">1 SD (68%)</td><td style="color:#FF5252">25,900</td><td style="color:#00E676">26,450</td></tr>
                    <tr><td style="color:#aaa">2 SD (95%)</td><td style="color:#FF5252">25,600</td><td style="color:#00E676">26,750</td></tr>
                </tbody>
            </table>
            <div class="sd-footer">Monthly: based on IV 14.2% ±580 pts</div>
        </div>
    `;
}
