export function computeSkew(rows, atmStrike) {
  const puts = rows.filter(r => r.strike < atmStrike)
  const calls = rows.filter(r => r.strike > atmStrike)

  if (!puts.length || !calls.length) return null

  const avgPut =
    puts.reduce((a,b)=>a+b.put.iv,0)/puts.length
  const avgCall =
    calls.reduce((a,b)=>a+b.call.iv,0)/calls.length

  return avgPut - avgCall
}