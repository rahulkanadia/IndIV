export function renderMarketGrid(containerId, title, data, titleClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div>
            <div class="section-header"><span class="sec-title ${titleClass}">${title} (${data.date})</span></div>
            <div class="data-grid-6">
                <div class="d-box area-cp">
                    <span class="d-lbl">ATM CALL</span>
                    <div class="d-val c-g">${data.atmCall.val.toFixed(2)}</div>
                    <div class="d-chg up">${data.atmCall.chg}</div>
                </div>
                <div class="d-box area-civ">
                    <span class="d-lbl">CALL IV</span>
                    <div class="iv-val c-g">${data.atmCall.iv}</div>
                    <div class="d-chg up">${data.atmCall.ivChg}</div>
                </div>

                <div class="area-sp"></div>

                <div class="d-box box-straddle-anchor area-stdp">
                    <span class="d-lbl">STRADDLE</span>
                    <div class="d-val ${titleClass}" style="font-size:1.4rem">${data.straddle.val.toFixed(2)}</div>
                    <div class="d-chg down">${data.straddle.chg}</div>
                </div>
                <div class="d-box area-stdiv" style="background:#191919">
                    <span class="d-lbl">IV</span>
                    <div class="iv-val ${titleClass}">${data.straddle.iv}</div>
                    <div class="d-chg up">${data.straddle.ivChg}</div>
                </div>

                <div class="d-box d-box-rank area-rnk1">
                    <span class="rank-header">${data.ivr}</span>
                    <div class="rank-row">
                        <div class="rank-sq r-mid on"></div><div class="rank-sq r-mid on"></div><div class="rank-sq r-low on"></div><div class="rank-sq"></div><div class="rank-sq"></div>
                    </div>
                </div>

                <div class="d-box area-pp">
                    <span class="d-lbl">ATM PUT</span>
                    <div class="d-val c-r">${data.atmPut.val.toFixed(2)}</div>
                    <div class="d-chg down">${data.atmPut.chg}</div>
                </div>
                <div class="d-box area-piv">
                    <span class="d-lbl">PUT IV</span>
                    <div class="iv-val c-r">${data.atmPut.iv}</div>
                    <div class="d-chg down">${data.atmPut.ivChg}</div>
                </div>

                <div class="d-box area-rv">
                    <span class="d-lbl">RV (20D)</span>
                    <div class="iv-val" style="color:#42A5F5">${data.rv}</div>
                    <div class="d-chg">-</div>
                </div>

                <div class="d-box d-box-rank area-rnk2">
                    <span class="rank-header">${data.ivp}</span>
                    <div class="rank-row">
                        <div class="rank-sq r-mid on"></div><div class="rank-sq r-mid on"></div><div class="rank-sq r-mid on"></div><div class="rank-sq r-low on"></div><div class="rank-sq"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
