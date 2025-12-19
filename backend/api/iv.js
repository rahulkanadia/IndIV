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
  const tv = new TradingViewAPI()

  try {
    const asset = "NIFTY"
    const cfg = ASSETS[asset]

    await tv.setup()

    const fut = await tv.getTicker(cfg.futures)
    await fut.fetch()
    const F = fut.last

    if (!F) throw new Error("Failed to fetch Futures price")

    const now = new Date()
    const weeklyExp = resolveWeeklyExpiry(now)
    const monthlyExp = resolveMonthlyExpiry(now)

    // Helper to process a single strike (for parallel execution)
    async function processStrike(s, expiry, T) {
      const c = await tv.getTicker(s.call)
      const p = await tv.getTicker(s.put)
      
      // Fetch both call and put in parallel for this strike
      await Promise.all([c.fetch(), p.fetch()])

      if (!c.last || !p.last) return null

      const civ = solveIV({ price: c.last, F, K: s.strike, T, isCall: true })
      const piv = solveIV({ price: p.last, F, K: s.strike, T, isCall: false })
      
      if (!civ || !piv) return null

      return {
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
      }
    }

    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep

      const symbols = buildOptionSymbols(
        cfg.optionPrefix,
        expiry,
        atm,
        cfg.strikeStep,
        cfg.strikesEachSide
      )

      // PARALLEL EXECUTION: Fire all requests at once
      const results = await Promise.all(
        symbols.map(s => processStrike(s, expiry, T))
      )

      // Filter out failed/null results
      let rows = results.filter(r => r !== null)

      if (rows.length === 0) throw new Error("No option data retrieved")

      rows = applyVegaWeights(rows, atm)

      const atmRow = rows.find(r => r.strike === atm)
      // Fallback: if exact ATM is missing, try closest available
      const bestAtmRow = atmRow || rows.sort((a,b) => Math.abs(a.strike - atm) - Math.abs(b.strike - atm))[0]

      if (!bestAtmRow) throw new Error("ATM data missing and no fallback found")

      const variance = straddleVariance(
        bestAtmRow.call.price,
        bestAtmRow.put.price,
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

    // Run weekly and monthly computations in parallel if possible, 
    // or sequential if you fear rate limits. 
    // Sequential is safer for TradingView to avoid 403 blocks.
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
    console.error("IV API ERROR:", err)
    res.status(500).json({
      error: "Internal error",
      message: err.message
    })
  } finally {
    // ALWAYS clean up, even if there is an error
    if (tv) {
        // tv.cleanup() usually returns a promise, best to await it to ensure process doesn't hang
        // Check documentation if cleanup is sync or async. Assuming async here:
        await tv.cleanup().catch(e => console.error("Cleanup failed", e))
    }
  }
}
