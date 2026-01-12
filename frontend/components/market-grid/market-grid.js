export function renderMarketGrid(containerId, title, data, themeClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // DEFENSIVE CHECK: Ensure we have an array
    const safeData = Array.isArray(data) ? data : [];

    // Helper to safely get item at index or return placeholder
    const get = (idx) => safeData[idx] || { label: '-', value: '-', chg: '', color: 'neutral' };

    // MAP DATA SAFELY: 0:ATM_C, 1:IV_C, 2:ATM_P, 3:IV_P, 4:STRADDLE, 5:IV, 6:RV, 7:IVR, 8:IVP
    const atmCall = get(0);
    const ivCall  = get(1);
    const atmPut  = get(2);
    const ivPut   = get(3);
    const straddle= get(4);
    const volIV   = get(5);
    const volRV   = get(6);
    const rankIVR = get(7);
    const rankIVP = get(8);

    // Helper: Standard Cell
    const renderCell = (item) => `
        <div class="grid-cell">
            <div class="cell-label">${item.label || '-'}</div>
            <div class="cell-value">${item.value || '-'}</div>
            <div class="cell-change ${item.color || 'neutral'}">${item.chg || ''}</div>
        </div>
    `;

    // Helper: Rank Cell
    const renderRankCell = (item) => {
        const val = parseInt(item.value) || 0;
        const barColor = val > 50 ? '#00E676' : '#FF9800';
        return `
        <div class="grid-cell rank-cell">
            <div class="rank-row">
                <span class="cell-label">${item.label || '-'}</span>
                <span class="cell-value-sm text-white-bold">${item.value || '-'}</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width:${val}%; background:${barColor}"></div>
            </div>
        </div>
        `;
    };

    container.innerHTML = `
        <div class="market-section ${themeClass || ''}">
            <div class="section-title">${title}</div>
            <div class="grid-layout">
                <div class="grid-col">${renderCell(atmCall)}${renderCell(atmPut)}</div>
                <div class="grid-col">${renderCell(ivCall)}${renderCell(ivPut)}</div>
                <div class="grid-col straddle-col">
                    <div class="grid-cell featured">
                        <div class="cell-label">${straddle.label || 'STRADDLE'}</div>
                        <div class="cell-value-lg text-straddle">${straddle.value || '-'}</div>
                        <div class="cell-change ${straddle.color || 'neutral'}">${straddle.chg || ''}</div>
                    </div>
                </div>
                <div class="grid-col">${renderCell(volIV)}${renderCell(volRV)}</div>
                <div class="grid-col">${renderRankCell(rankIVR)}${renderRankCell(rankIVP)}</div>
            </div>
        </div>
    `;
}
