import { TradingViewAPI } from "tradingview-scraper"
import { ASSETS } from "../config/assets.js"
import { resolveWeeklyExpiry, resolveMonthlyExpiry } from "../config/expiry.js"
import { tradingTimeToExpiry } from "../lib/utils.js"
import { buildOptionSymbols } from "../lib/optionChain.js"
import { solveIV } from "../lib/ivSolver.js"
import { greeks } from "../lib/greeks.js"
import { straddleVariance } from "../lib/variance.js"
import { vegaWeightedAverage } from "../lib/aggregation.js"
import { computeSkew } from "../lib/skew.js"
import { applyVegaWeights } from "../lib/weights.js"

export default async function handler(req, res) {
  const asset = "NIFTY"
  const cfg = ASSETS[asset]
  let tv

  try {
    tv = new TradingViewAPI()
    await tv.setup()

    // ---- Futures ----
    const fut = await tv.getTicker(cfg.futures)
    await fut.fetch()

    if (!fut.last || fut.last <= 0) {
      throw new Error("Invalid futures price")
    }

    const F = fut.last
    const now = new Date()

    const weeklyExp = resolveWeeklyExpiry(now)
    const monthlyExp = resolveMonthlyExpiry(now)

    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      if (T <= 0) throw new Error("Invalid expiry time")

      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep
      const symbols = buildOptionSymbols(
        cfg.optionPrefix,
        expiry,
        atm,
        cfg.strikeStep,
        cfg.strikesEachSide
      )

      let rows = []

      for (let s of symbols) {
        try {
          const c = await tv.getTicker(s.call)
          const p = await tv.getTicker(s.put)
          await c.fetch()
          await p.fetch()

          if (!c.last || !p.last) continue

          const civ = solveIV({
            price: c.last,
            F,
            K: s.strike,
            T,
            isCall: true
          })

          const piv = solveIV({
            price: p.last,
            F,
            K: s.strike,
            T,
            isCall: false
          })

          if (!civ || !piv) continue

          rows.push({
            strike: s.strike,
            call: {
              price: c.last,
              iv: civ,
              greeks: greeks(F, s.strike, T, civ, true)
            },
            put: {
              price: p.last,
              iv: piv,
              greeks: greeks(F, s.strike, T, piv, false)
            }
          })
        } catch {
          // Skip broken strike safely
        }
      }

      if (!rows.length) throw new Error("No valid option data")

      rows = applyVegaWeights(rows, atm)

      const atmRow = rows.find(r => r.strike === atm)
      if (!atmRow) throw new Error("ATM option missing")

      const variance = straddleVariance(
        atmRow.call.price,
        atmRow.put.price,
        F,
        T
      )

      return {
        expiry: expiry.toISOString().slice(0, 10),
        atmStrike: atm,
        indiv: Math.sqrt(variance),
        variance,
        coreIV: vegaWeightedAverage(rows, atm, cfg.strikeStep * 3),
        skew: computeSkew(rows, atm),
        curve: rows.map(r => ({
          strike: r.strike,
          callIV: r.call.iv,
          putIV: r.put.iv,
          weight: r.weight
        })),
        rows
      }
    }

    const weekly = await compute(weeklyExp)
    const monthly = await compute(monthlyExp)

    res.status(200).json({
      asset,
      timestamp: Date.now(),
      futures: F,
      expiry: {
        weekly: weekly.expiry,
        monthly: monthly.expiry
      },
      headline: {
        weekly: weekly.indiv,
        monthly: monthly.indiv
      },
      weekly,
      monthly
    })

  } catch (err) {
    console.error("IV API error:", err)

    res.status(500).json({
      error: "IV_CALCULATION_FAILED",
      message: err.message
    })

  } finally {
    if (tv) {
      try { tv.cleanup() } catch {}
    }
  }
}