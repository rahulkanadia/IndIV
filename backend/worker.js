import fs from 'fs'
import { TradingViewAPI } from "tradingview-scraper"
import { ASSETS } from "./config/assets.js"
import { resolveExpiry } from "./config/expiry.js"
import { tradingTimeToExpiry } from "./lib/utils.js"
import { buildOptionSymbols } from "./lib/optionChain.js"
import { solveIV } from "./lib/ivSolver.js"
import { greeks } from "./lib/greeks.js"
import { straddleVariance } from "./lib/variance.js"
import { vegaWeightedAverage } from "./lib/aggregation.js"
import { computeSkew } from "./lib/skew.js"
import { applyVegaWeights } from "./lib/weights.js"

const tv = new TradingViewAPI()

async function processAsset(assetName) {
  const cfg = ASSETS[assetName]
  console.log(`Processing ${assetName}...`)

  // Construct Symbol
  const futuresTicker = `${cfg.exchange}:${cfg.futuresSymbol}`
  
  try {
    const futTicker = await tv.getTicker(futuresTicker)
    const futData = await futTicker.fetch()
    
    if (!futData || !futData.last) return null
    const F = futData.last

    const now = new Date()
    const { weekly: weeklyExp, monthly: monthlyExp } = resolveExpiry(cfg, now)

    // Compute Helper
    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      if (T <= 0) return null

      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep
      const symbols = buildOptionSymbols(cfg.optionPrefix, expiry, atm, cfg.strikeStep, cfg.strikesEachSide)

      let rows = []
      
      for (const s of symbols) {
         const cTicker = await tv.getTicker(`${cfg.exchange}:${s.call}`)
         const pTicker = await tv.getTicker(`${cfg.exchange}:${s.put}`)
         
         const cData = await cTicker.fetch()
         const pData = await pTicker.fetch()

         if (!cData.last || !pData.last) continue

         const civ = solveIV({ price: cData.last, F, K: s.strike, T, isCall: true })
         const piv = solveIV({ price: pData.last, F, K: s.strike, T, isCall: false })
         if (!civ || !piv) continue

         rows.push({
            strike: s.strike,
            call: { price: cData.last, iv: civ },
            put: { price: pData.last, iv: piv }
         })
      }

      if (rows.length === 0) return null
      
      // Calculate Variance IV
      rows = applyVegaWeights(rows, atm)
      let atmRow = rows.find(r => r.strike === atm) || rows[0]
      const variance = straddleVariance(atmRow.call.price, atmRow.put.price, F, T)

      return {
        expiry: expiry.toISOString().slice(0, 10),
        atmStrike: atm,
        indiv: Math.sqrt(variance), // Annualized IV
        rows
      }
    }

    const weekly = await compute(weeklyExp)
    
    return {
      asset: assetName,
      timestamp: Date.now(),
      futures: F,
      headline: { weekly: weekly ? weekly.indiv : 0 },
      weekly
    }

  } catch (e) {
    console.error(`Error ${assetName}:`, e.message)
    return null
  }
}

async function run() {
  await tv.setup()
  
  const results = {}
  // List assets you want to track
  const targets = ["NIFTY", "BANKNIFTY", "CRUDEOIL", "GOLD"]

  for (const t of targets) {
    const res = await processAsset(t)
    if (res) results[t] = res
  }

  fs.writeFileSync("indiv_data.json", JSON.stringify(results, null, 2))
  console.log("Data saved to indiv_data.json")

  tv.cleanup()
  process.exit(0)
}

run()
