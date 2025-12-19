export function buildOptionSymbols(prefix, expiry, strike, step, n) {
  let y = expiry.getFullYear().toString().slice(2)
  let m = String(expiry.getMonth() + 1).padStart(2,"0")
  let d = String(expiry.getDate()).padStart(2,"0")

  let symbols = []

  for (let i = -n; i <= n; i++) {
    let k = strike + i * step
    symbols.push({
      strike: k,
      call: `${prefix}${y}${m}${d}C${k}`,
      put: `${prefix}${y}${m}${d}P${k}`
    })
  }

  return symbols
}