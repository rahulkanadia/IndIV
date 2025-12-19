export function applyVegaWeights(rows, atmStrike) {
  const atm = rows.find(r => r.strike === atmStrike)
  if (!atm) return rows

  const atmVega =
    atm.call.greeks.vega + atm.put.greeks.vega

  return rows.map(r => {
    const vega =
      r.call.greeks.vega + r.put.greeks.vega
    return { ...r, weight: Math.min(1, vega / atmVega) }
  })
}