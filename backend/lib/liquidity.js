export function checkIlliquidity({
    ivNow,
    ivPrev,
    futNow,
    futPrev,
    T,
    optVolume,
    futVolume,
    strikeStep
}) {
    if (!ivPrev || !futPrev) return {illiquid: false}

    let volumeWeak = (optVolume/strikeStep) < 0.3*futVolume
    let expectedIVMove = 0.7*Math.abs(futNow-futPrev)/Math.sqrt(T)
    let ivExcess = Math.abs(ivNow-ivPrev) > 1.8*expectedIVMove
    let illiquid = volumeWeak && ivExcess

    return {illiquid}
}