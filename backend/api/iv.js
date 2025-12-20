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

  try {
    const assetName = (req.query.asset || "NIFTY").toUpperCase()
    const cfg = ASSETS[assetName]

    if (!cfg) throw new Error(`Asset '${assetName}' not found`)

    // STANDARD LIBRARY PATTERN: Setup first
    await tv.setup()

    // 1. Fetch Futures
    // Construct symbol: "EXCHANGE:SYMBOL"
    const futuresSymbol = `${cfg.exchange}:${cfg.futuresSymbol}`
    
    const futTicker = await tv.getTicker(futuresSymbol)
    const futData = await futTicker.fetch() // Standard fetch() call

    if (!futData || !futData.last) {
      throw new Error(`Failed to fetch Futures: ${futuresSymbol}`)
    }
    
    const F = futData.last

    // 2. Setup Expiry
    const now = new Date()
    const { weekly: weeklyExp, monthly: monthlyExp } = resolveExpiry(cfg, now)

    // 3. Early Exit if no options
    if (!cfg.options) {
      res.status(200).json({
        asset: assetName,
        timestamp: Date.now(),
        futures: F,
        note: "Futures Only",
        expiry: {
            weekly: weeklyExp ? weeklyExp.toISOString().slice(0,10) : null,
            monthly: monthlyExp ? monthlyExp.toISOString().slice(0,10) : null
        }
      })
      return 
    }

    // 4. Compute Engine
    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      if (T <= 0) return { status: "Expired", rows: [] }

      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep

      const symbols = buildOptionSymbols(
        cfg.optionPrefix, // passed as "NIFTY" or "BSX"
        expiry,
        atm,
        cfg.strikeStep,
        cfg.strikesEachSide
      )

      let rows = []

      for (const s of symbols) {
        // Construct standard symbols
        const callSymbol = `${cfg.exchange}:${s.call}`
        const putSymbol = `${cfg.exchange}:${s.put}`

        // Get Tickers
        const cTicker = await tv.getTicker(callSymbol)
        const pTicker = await tv.getTicker(putSymbol)

        // Strict Fetch
        const cData = await cTicker.fetch()
        const pData = await pTicker.fetch()

        if (!cData || !cData.last || !pData || !pData.last) continue

        const civ = solveIV({ price: cData.last, F, K: s.strike, T, isCall: true })
        const piv = solveIV({ price: pData.last, F, K: s.strike, T, isCall: false })
        
        if (!civ || !piv) continue

        rows.push({
          strike: s.strike,
          call: { price: cData.last, iv: civ, greeks: greeks(F, s.strike, T, civ, true) },
          put: { price: pData.last, iv: piv, greeks: greeks(F, s.strike, T, piv, false) }
        })
      }

      if (rows.length === 0) return { status: "No Data", rows: [] }

      rows = applyVegaWeights(rows, atm)

      let atmRow = rows.find(r => r.strike === atm)
      if (!atmRow) atmRow = rows.sort((a,b) => Math.abs(a.strike - atm) - Math.abs(b.strike - atm))[0]
      
      const variance = atmRow ? straddleVariance(atmRow.call.price, atmRow.put.price, F, T) : 0

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
      error: "Error",
      message: err.message
    })
  } finally {
    // Standard Cleanup
    tv.cleanup()
  }
}
