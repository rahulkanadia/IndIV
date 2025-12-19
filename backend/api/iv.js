import { TradingViewAPI } from "tradingview-scraper"
import { ASSETS } from "../config/assets.js"
import { resolveWeeklyExpiry, resolveMonthlyExpiry } from "../config/expiry.js"
import { tradingTimeToExpiry } from "../lib/utils.js"
import { solveIV } from "../lib/ivSolver.js"
import { greeks } from "../lib/greeks.js"
import { straddleVariance } from "../lib/variance.js"
import { buildOptionSymbols } from "../lib/optionChain.js"

export default async function handler(req, res) {
  const asset = "NIFTY"
  const cfg = ASSETS[asset]

  const tv = new TradingViewAPI()
  await tv.setup()

  const futTicker = await tv.getTicker(cfg.futures)
  await futTicker.fetch()
  const F = futTicker.last

  const now = new Date()
  const weeklyExpiry = resolveWeeklyExpiry(now)
  const monthlyExpiry = resolveMonthlyExpiry(now)

  const T_weekly = tradingTimeToExpiry(now, weeklyExpiry)
  const T_monthly = tradingTimeToExpiry(now, monthlyExpiry)

  const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep

  async function processExpiry(expiry, T) {
    const strikes = buildOptionSymbols(
      cfg.optionPrefix,
      expiry,
      atm,
      cfg.strikeStep,
      cfg.strikesEachSide
    )

    let rows = []

    for (let s of strikes) {
      const call = await tv.getTicker(s.call)
      const put = await tv.getTicker(s.put)
      await call.fetch()
      await put.fetch()

      const callIV = solveIV({ price: call.last, F, K: s.strike, T, isCall: true })
      const putIV = solveIV({ price: put.last, F, K: s.strike, T, isCall: false })

      if (!callIV || !putIV) continue

      rows.push({
        strike: s.strike,
        call: {
          price: call.last,
          iv: callIV,
          greeks: greeks(F, s.strike, T, callIV, true)
        },
        put: {
          price: put.last,
          iv: putIV,
          greeks: greeks(F, s.strike, T, putIV, false)
        }
      })
    }

    const atmRow = rows.find(r => r.strike === atm)
    const variance = straddleVariance(
      atmRow.call.price,
      atmRow.put.price,
      F,
      T
    )

    return {
      expiry: expiry.toISOString().slice(0,10),
      indiv: Math.sqrt(variance),
      variance,
      rows
    }
  }

  const weekly = await processExpiry(weeklyExpiry, T_weekly)
  const monthly = await processExpiry(monthlyExpiry, T_monthly)

  tv.cleanup()

  res.status(200).json({
    asset,
    timestamp: Date.now(),
    futures: F,
    headline: {
      weekly: weekly.indiv,
      monthly: monthly.indiv
    },
    weekly,
    monthly
  })
}