import { TradingViewAPI } from "tradingview-scraper"
import { ASSETS } from "../config/assets.js"
import { resolveExpiry } from "../config/expiry.js" // UPDATED IMPORT
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
    // 1. Get Asset from Query (default to NIFTY)
    const assetName = (req.query.asset || "NIFTY").toUpperCase()
    const cfg = ASSETS[assetName]

    if (!cfg) throw new Error(`Asset ${assetName} not found in config`)

    await tv.setup()

    // 2. Fetch Futures
    const fut = await tv.getTicker(cfg.futures)
    await fut.fetch()
    const F = fut.last

    if (!F) throw new Error("Failed to fetch Futures price")

    const now = new Date()
    
    // 3. Resolve Expiry using new Logic
    const { weekly: weeklyExp, monthly: monthlyExp } = resolveExpiry(cfg, now)

    // Computation Logic
    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      
      // If T is negative or zero (expired today), return placeholders
      if (T <= 0) return { error: "Expired", rows: [] }

      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep

      const symbols = buildOptionSymbols(
        cfg.optionPrefix,
        expiry,
        atm,
        cfg.strikeStep,
        cfg.strikesEachSide
      )

      let rows = []

      // SEQUENTIAL LOOP
      for (const s of symbols) {
        const c = await tv.getTicker(s.call)
        const p = await tv.getTicker(s.put)
        
        await c.fetch()
        await p.fetch()

        if (!c.last || !p.last) continue

        const civ = solveIV({ price: c.last, F, K: s.strike, T, isCall: true })
        const piv = solveIV({ price: p.last, F, K: s.strike, T, isCall: false })
        
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
      }

      if (rows.length === 0) return { error: "No Data", rows: [] }

      rows = applyVegaWeights(rows, atm)

      // Fallback if exact ATM row is missing
      let atmRow = rows.find(r => r.strike === atm)
      if (!atmRow) {
         atmRow = rows.sort((a,b) => Math.abs(a.strike - atm) - Math.abs(b.strike - atm))[0]
      }
      
      const variance = atmRow ? straddleVariance(
        atmRow.call.price,
        atmRow.put.price,
        F,
        T
      ) : 0

      return {
        expiry: expiry.toISOString().slice(0, 10),
        atmStrike: atm,
        indiv: Math.sqrt(variance),
        variance,
        coreIV: vegaWeightedAverage(rows, atm, cfg.strikeStep * 3),
        skew: computeSkew(rows, atm),
        rows
      }
    }

    // Execute
    const weekly = await compute(weeklyExp)
    const monthly = await compute(monthlyExp)

    res.status(200).json({
      asset: assetName,
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
      message: err.message, 
      stack: err.stack, // Helpful for debugging
      step: "Check this step",
    })
  } finally {
    if (tv) {
        try { await tv.cleanup() } catch(e) { console.error(e) }
    }
  }
}