export function vegaWeightedAverage(rows, atmStrike, width) {
  let slice = rows.filter(r =>
    Math.abs(r.strike - atmStrike) <= width
  )

  let num = 0
  let den = 0

  slice.forEach(r => {
    const vega =
      r.call.greeks.vega + r.put.greeks.vega
    const iv =
      (r.call.iv + r.put.iv) / 2

    num += iv * vega
    den += vega
  })

  return den > 0 ? num / den : null
}