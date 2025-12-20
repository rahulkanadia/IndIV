import { TradingViewAPI } from "tradingview-scraper"
import { ASSETS } from "../config/assets.js"
import { resolveExpiry } from "../config/expiry.js"
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

  // Helper: Retry fetching up to 3 times to handle "Cold Start" connection drops
  async function fetchWithRetry(tickerObj, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await tickerObj.fetch()
        if (tickerObj.last && tickerObj.last > 0) return tickerObj.last
        // If fetch worked but price is 0/null, wait and retry
        await new Promise(r => setTimeout(r, 500))
      } catch (e) {
        console.warn(`Retry ${i+1} failed for ${tickerObj.symbol}`)
        await new Promise(r => setTimeout(r, 500))
      }
    }
    return null
  }

  try {
    // 1. Identify Asset (Default to NIFTY if missing)
    const assetName = (req.query.asset || "NIFTY").toUpperCase()
    const cfg = ASSETS[assetName]

    if (!cfg) throw new Error(`Asset '${assetName}' not found in configuration`)

    await tv.setup()

    // 2. Fetch Futures Price (The "Head" of the data)
    const fut = await tv.getTicker(cfg.futures)
    const F = await fetchWithRetry(fut)

    if (!F) {
      // If fails, throw detailed error with the symbol we tried
      throw new Error(`Failed to fetch Futures: ${cfg.futures}`)
    }

    // 3. Setup Expiry Logic
    const now = new Date()
    const { weekly: weeklyExp, monthly: monthlyExp } = resolveExpiry(cfg, now)

    // 4. If Asset has NO OPTIONS (e.g. ALUMINIUM), return simple Futures data
    if (!cfg.hasOptions) {
      res.status(200).json({
        asset: assetName,
        timestamp: Date.now(),
        futures: F,
        note: "Futures only - No liquid options",
        expiry: {
            weekly: weeklyExp ? weeklyExp.toISOString().slice(0,10) : null,
            monthly: monthlyExp ? monthlyExp.toISOString().slice(0,10) : null
        }
      })
      return // Stop here
    }

    // 5. The Heavy Math (Only runs if hasOptions = true)
    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      
      // If expired or invalid date
      if (T <= 0) return { status: "Expired", rows: [] }

      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep

      const symbols = buildOptionSymbols(
        cfg.optionPrefix,
        expiry,
        atm,
        cfg.strikeStep,
        cfg.strikesEachSide
      )

      let rows = []

      // SEQUENTIAL LOOP (Stable but slow)
      for (const s of symbols) {
        const c = await tv.getTicker(s.call)
        const p = await tv.getTicker(s.put)
        
        // Fetch both sides
        const cPrice = await fetchWithRetry(c, 1) // Less retries for options to save time
        const pPrice = await fetchWithRetry(p, 1)

        if (!cPrice || !pPrice) continue

        const civ = solveIV({ price: cPrice, F, K: s.strike, T, isCall: true })
        const piv = solveIV({ price: pPrice, F, K: s.strike, T, isCall: false })
        
        if (!civ || !piv) continue

        rows.push({
          strike: s.strike,
          call: {
            price: cPrice,
            iv: civ,
            greeks: greeks(F, s.strike, T, civ, true)
          },
          put: {
            price: pPrice,
            iv: piv,
            greeks: greeks(F, s.strike, T, piv, false)
          }
        })
      }

      if (rows.length === 0) return { status: "No Data", rows: [] }

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

    // Execute computations
    // Note: We await sequentially to prevent socket overload
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
        weekly: weekly.indiv || 0,
        monthly: monthly.indiv || 0
      },
      weekly,
      monthly
    })

  } catch (err) {
    console.error("IV API ERROR:", err)
    res.status(500).json({
      error: "Calculation Failed",
      message: err.message,
      // Sending specific details to help you debug
      step: "Check logs for specific symbol failure" 
    })
  } finally {
    if (tv) {
        try { await tv.cleanup() } catch(e) { console.error(e) }
    }
  }
}
