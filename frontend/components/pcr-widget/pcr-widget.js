export function renderPCRWidget(containerId, pcrValue) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Calculate Logic (Center is 1.0)
    // Scale: 0.5 (Left Edge) <--> 1.0 (Center) <--> 1.5 (Right Edge)
    let percentage = 0;
    let color = '#888';
    let leftPos = '50%'; // Start at center
    
    // Clamp value for visual sanity
    const clampedVal = Math.max(0.5, Math.min(1.5, pcrValue));

    if (pcrValue < 1.0) {
        // BULLISH (Green, grows to Left)
        // Map 1.0 -> 0.5 to 0% width
        percentage = ((1.0 - clampedVal) / 0.5) * 50; 
        leftPos = (50 - percentage) + '%'; // Move start point left
        color = '#00E676';
    } else {
        // BEARISH (Red, grows to Right)
        percentage = ((clampedVal - 1.0) / 0.5) * 50;
        leftPos = '50%';
        color = '#FF5252';
    }

    // 2. Render HTML
    container.innerHTML = `
        <div class="pcr-box">
            <div class="pcr-header">
                <span>Put-Call Ratio</span>
                <span class="pcr-value-text" style="color: ${color}">${pcrValue.toFixed(2)}</span>
            </div>
            
            <div class="pcr-track">
                <div class="pcr-center-line"></div>
                <div class="pcr-fill" style="width: ${percentage}%; left: ${leftPos}; background: ${color};"></div>
            </div>
            
            <div style="display:flex; justify-content:space-between; font-size:9px; color:#555; margin-top:-4px;">
                <span>0.5 (Bull)</span>
                <span>1.0</span>
                <span>1.5 (Bear)</span>
            </div>
        </div>
    `;
}
