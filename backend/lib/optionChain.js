export function buildOptionSymbols(prefix, expiry, atm, step, n) {
  const y = expiry.getFullYear().toString().slice(2)
  const m = String(expiry.getMonth() + 1).padStart(2, "0")
  const d = String(expiry.getDate()).padStart(2, "0")

  let out = []
  for (let i = -n; i <= n; i++) {
    const strike = atm + i * step
    out.push({
      strike,
      call: `${prefix}${y}${m}${d}C${strike}`,
      put: `${prefix}${y}${m}${d}P${strike}`
    })
  }
  return out
}