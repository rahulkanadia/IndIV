import pkg from "tradingview-scraper"
const { TradingViewAPI } = pkg

import { ASSETS } from "../lib/assets.js"
import { resolveExpiry } from "../lib/expiry.js"
import { atmStraddleIV } from "../lib/iv.js"
import { checkIlliquidity } from "../lib/liquidity.js"
import { tradingHoursToExpiry } from "../lib/time.js"
import { MARKETS } from "../lib/markets.js"
import { tvOptionSymbols } from "../lib/symbols.js"

async function fetchQuote(tv, symbol) {
  const ticker = await tv.getTicker(symbol)
  const data = await ticker.fetch()

  return {
    price: data.lp,
    volume: data.volume ?? 0
  }
}

export default async function handler(req, res) {
  const asset = (req.query.asset || "NIFTY").toUpperCase()
  const cfg = ASSETS[asset]
  if (!cfg) return res.status(400).json({ error: "Unsupported asset" })

  const tv = new TradingViewAPI()

  try {
    await tv.setup()

    let now = new Date()
    let weeklyExp = resolveExpiry("W", now)
    let monthlyExp = resolveExpiry("M", now)

    let fut = await fetchQuote(tv, cfg.futuresSymbol)
    let futPrice = fut.price
    let futVolume = fut.volume

    let strike =
      Math.round(futPrice / cfg.strikeStep) * cfg.strikeStep

    async function compute(expiry, prevIV, prevFut) {
      let symbols = tvOptionSymbols(asset, expiry, strike)

      let ce = await fetchQuote(tv, symbols.ce)
      let pe = await fetchQuote(tv, symbols.pe)

      let ivNow = atmStraddleIV({
        call: ce.price,
        put: pe.price,
        fut: futPrice,
        now,
        expiry,
        market: cfg.exchange
      })

      let remainingHours =
        tradingHoursToExpiry(now, expiry, cfg.exchange)

      let T =
        remainingHours / MARKETS[cfg.exchange].annualHours

      let { illiquid } = checkIlliquidity({
        ivNow,
        ivPrev: prevIV,
        futNow: futPrice,
        futPrev: prevFut,
        T,
        optVolume: ce.volume + pe.volume,
        futVolume,
        strikeStep: cfg.strikeStep
      })

      return {
        iv: illiquid ? prevIV : ivNow,
        illiquid
      }
    }

    let weekly = await compute(weeklyExp)
    let monthly = await compute(monthlyExp)

    res.json({
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
    })
  } catch (err) {
    console.error("IV handler error:", err)
    res.status(500).json({ error: String(err) })
  } finally {
    await tv.cleanup()
  }
}