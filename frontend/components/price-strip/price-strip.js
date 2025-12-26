export function renderPriceStrip(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Price Strip Container #${containerId} not found!`);
        return;
    }

    // Format numbers helper
    const fmt = (num) => num.toLocaleString('en-IN', {minimumFractionDigits: 2});

    container.innerHTML = `
        <div class="price-strip">
            <div class="p-group">
                <span class="p-label">SPOT PRICE</span>
                <span class="p-val">${fmt(data.spot)}</span>
                <div class="p-change up">+45.20 (0.17%)</div>
            </div>

            <div class="p-group">
                <span class="p-label">ASSET</span>
                <select class="asset-select">
                    <option>NIFTY 50</option>
                    <option>BANK NIFTY</option>
                </select>
            </div>

            <div class="p-group">
                <span class="p-label">FUTURES PRICE</span>
                <span class="p-val">${fmt(data.spot + 37)}</span>
                <div class="p-change up">+37.00 (0.14%)</div>
            </div>
        </div>
    `;
}
