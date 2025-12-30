export function renderMarketGrid(containerId, title, data, themeClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || !Array.isArray(data)) {
        container.innerHTML = `<div style="color:#666;">No Data</div>`;
        return;
    }

    // MAP DATA: 0:ATM_C, 1:IV_C, 2:ATM_P, 3:IV_P, 4:STRADDLE, 5:IV, 6:RV, 7:IVR, 8:IVP
    const atmCall = data[0];
    const atmPut = data[2];
    const ivCall = data[1];
    const ivPut = data[3];
    const straddle = data[4];
    const volIV = data[5];
    const volRV = data[6];
    const rankIVR = data[7];
    const rankIVP = data[8];

    // Helper: Standard Cell
    const renderCell = (item) => `
        <div class="grid-cell">
            <div class="cell-label">${item.label}</div>
            <div class="cell-value">${item.value}</div>
            <div class="cell-change ${item.color}">${item.chg}</div>
        </div>
    `;

    // Helper: Rank Cell (Bold White Text)
    const renderRankCell = (item) => {
        const val = parseInt(item.value) || 0;
        const barColor = val > 50 ? '#00E676' : '#FF9800';
        return `
        <div class="grid-cell rank-cell">
            <div class="rank-row">
                <span class="cell-label">${item.label}</span>
                <span class="cell-value-sm text-white-bold">${item.value}</span>
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
                <div class="grid-col">
                    ${renderCell(atmCall)}
                    ${renderCell(atmPut)}
                </div>

                <div class="grid-col">
                    ${renderCell(ivCall)}
                    ${renderCell(ivPut)}
                </div>

                <div class="grid-col straddle-col">
                    <div class="grid-cell featured">
                        <div class="cell-label">${straddle.label}</div>
                        <div class="cell-value-lg text-straddle">${straddle.value}</div>
                        <div class="cell-change ${straddle.color}">${straddle.chg}</div>
                    </div>
                </div>

                <div class="grid-col">
                    ${renderCell(volIV)}
                    ${renderCell(volRV)}
                </div>

                <div class="grid-col">
                    ${renderRankCell(rankIVR)}
                    ${renderRankCell(rankIVP)}
                </div>
            </div>
        </div>
    `;
}
