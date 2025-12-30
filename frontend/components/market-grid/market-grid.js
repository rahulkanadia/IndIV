export function renderMarketGrid(containerId, title, data, themeClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Safety Check: If data is missing or not an array, render nothing or error
    if (!data || !Array.isArray(data)) {
        console.warn(`MarketGrid: No data found for ${containerId}`);
        container.innerHTML = `<div style="color:#666; font-size:10px; padding:10px;">No Data</div>`;
        return;
    }

    // Generate Grid Items
    const itemsHtml = data.map(item => {
        // Determine color class (up/down/neutral)
        const colorClass = item.color || 'neutral';
        
        return `
            <div class="grid-item">
                <div class="grid-label">${item.label}</div>
                <div class="grid-value">${item.value}</div>
                <div class="grid-change ${colorClass}">${item.chg}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="market-grid-box ${themeClass || ''}">
            <div class="grid-header">${title}</div>
            <div class="grid-body">
                ${itemsHtml}
            </div>
        </div>
    `;
}
