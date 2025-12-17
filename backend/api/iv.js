// api/iv.js
import tv from "tradingview-scraper"

import { ASSETS } from "../lib/assets.js"
import { resolveExpiry } from "../lib/expiry.js"
import { atmStraddleIV } from "../lib/iv.js"
import { checkIlliquidity } from "../lib/liquidity.js"
import { tradingHoursToExpiry } from "../lib/time.js"
import { MARKETS } from "../lib/markets.js"
import { cache } from "../lib/cache.js"
import { storeSnapshot } from "../lib/store.js"
import { tvOptionSymbols } from "../lib/symbols.js"

export default async function handler(req, res) {
  const asset = (req.query.asset || "NIFTY").toUpperCase()
  const cfg = ASSETS[asset]
  if (!cfg) return res.status(400).json({ error: "Unsupported asset" })

  // Cache (<25 min)
  if (cache[asset] && Date.now() - cache[asset].ts < 25 * 60 * 1000)
    return res.json(cache[asset].data)

  let now = new Date()
  let weeklyExp = resolveExpiry("W", now)
  let monthlyExp = resolveExpiry("M", now)

  let fut = await tv.getQuote(cfg.futuresSymbol)
  let futPrice = fut.price
  let futVolume = fut.volume ?? 0

  let strike =
    Math.round(futPrice / cfg.strikeStep) * cfg.strikeStep

  let prev = cache[asset]?.data

  async function compute(expiry, prevIV, prevFut) {
    let symbols = tvOptionSymbols(asset, expiry, strike)

    let ce = await tv.getQuote(symbols.ce)
    let pe = await tv.getQuote(symbols.pe)

    if (!ce.price || !pe.price) throw "Bad option prices"

    let ivNow = atmStraddleIV({
      call: ce.price,
      put: pe.price,
      fut: futPrice,
      now,
      expiry,
      market: cfg.exchange
    })

    let T =
      tradingHoursToExpiry(now, expiry, cfg.exchange) /
      MARKETS[cfg.exchange].annualHours

    let { illiquid } = checkIlliquidity({
      ivNow,
      ivPrev: prevIV,
      futNow: futPrice,
      futPrev: prevFut,
      T,
      optVolume: (ce.volume ?? 0) + (pe.volume ?? 0),
      futVolume,
      strikeStep: cfg.strikeStep
    })

    return {
      iv: illiquid ? prevIV : ivNow,
      illiquid
    }
  }

  let weekly = await compute(
    weeklyExp,
    prev?.iv?.weekly,
    prev?.futures
  )

  let monthly = await compute(
    monthlyExp,
    prev?.iv?.monthly,
    prev?.futures
  )

  let response = {
    asset,
    futures: Math.round(futPrice),
    iv: {
      weekly: weekly.iv,
      monthly: monthly.iv
    },
    flags: {
      weekly: weekly.illiquid ? "#" : "",
      monthly: monthly.illiquid ? "#" : ""
    },
    expiry: {
      weekly: weeklyExp.toISOString().slice(0, 10),
      monthly: monthlyExp.toISOString().slice(0, 10)
    },
    timestamp: Date.now()
  }

  cache[asset] = { ts: Date.now(), data: response }
  await storeSnapshot(response)

  res.json(response)
}