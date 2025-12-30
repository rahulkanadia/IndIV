export function renderMarketGrid(containerId, title, data, themeClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || !Array.isArray(data)) {
        container.innerHTML = `<div style="color:#666;">No Data</div>`;
        return;
    }

    // MAP DATA INDICES TO LAYOUT GROUPS (Based on your mockData order)
    // 0:ATM CALL, 1:CALL IV, 2:ATM PUT, 3:PUT IV, 4:STRADDLE, 5:IV, 6:RV, 7:IVR, 8:IVP
    
    // Group 1: ATM Prices (Call Top, Put Bottom)
    const atmCall = data[0];
    const atmPut = data[2];

    // Group 2: ATM IVs (Call Top, Put Bottom)
    const ivCall = data[1];
    const ivPut = data[3];

    // Group 3: Straddle (Center, Tall)
    const straddle = data[4];

    // Group 4: Volatility (IV Top, RV Bottom)
    const volIV = data[5];
    const volRV = data[6];

    // Group 5: Rank (IVR Top, IVP Bottom)
    const rankIVR = data[7];
    const rankIVP = data[8];

    // HELPER: Generate a Standard Cell
    const renderCell = (item, extraClass = '') => `
        <div class="grid-cell ${extraClass}">
            <div class="cell-label">${item.label}</div>
            <div class="cell-value">${item.value}</div>
            <div class="cell-change ${item.color}">${item.chg}</div>
        </div>
    `;

    // HELPER: Generate Rank Cell with Progress Bar
    const renderRankCell = (item) => {
        // Extract number for width (e.g., "45")
        const val = parseInt(item.value) || 0;
        // Color based on value (Green > 50, else Orange/Red) - simplified logic
        const barColor = val > 50 ? '#00E676' : '#FF9800';
        
        return `
        <div class="grid-cell rank-cell">
            <div class="rank-row">
                <span class="cell-label">${item.label}</span>
                <span class="cell-value-sm">${item.value}</span>
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
                        <div class="cell-value-lg">${straddle.value}</div>
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
