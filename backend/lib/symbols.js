export function tvOptionSymbols(asset,expiry,strike) {
    let yy = String(expiry.getFullYear()).slice(2)
    let mm = expiry.toLocaleString("en", {month: "short"}).toUpperCase()

    return {
        ce: 'NSE:${asset}${yy}${mm}${strike}CE',
        pe: 'NSE:${asset}${yy}${mm}${strike}PE'
    }
}