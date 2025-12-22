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
  console.log(`\n🟦 Starting ${assetName}...`)

  // Construct Symbol
  const futuresTicker = `${cfg.exchange}:${cfg.futuresSymbol}`
  console.log(`   Asking TradingView for: ${futuresTicker}`)
  
  try {
    const futTicker = await tv.getTicker(futuresTicker)
    const futData = await futTicker.fetch()
    
    // DEBUG LOG: See what we actually got back
    if (!futData || !futData.last) {
      console.log(`   ❌ FAILED to get price for ${futuresTicker}`)
      console.log(`   🔍 Raw Response:`, JSON.stringify(futData || "null"))
      return null
    }

    const F = futData.last
    console.log(`   ✅ Futures Price: ${F}`)

    const now = new Date()
    const { weekly: weeklyExp, monthly: monthlyExp } = resolveExpiry(cfg, now)

    // Compute Helper
    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      if (T <= 0) {
        console.log(`   ⚠️ Expiry ${expiry.toISOString()} is in the past or today. Skipping.`)
        return null
      }

      console.log(`   ⏳ Processing Expiry: ${expiry.toISOString().slice(0,10)} (T=${T.toFixed(4)})`)

      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep
      const symbols = buildOptionSymbols(cfg.optionPrefix, expiry, atm, cfg.strikeStep, cfg.strikesEachSide)

      let rows = []
      
      // Batch processing to be gentle
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

      if (rows.length === 0) {
        console.log(`   ❌ No Options Data found for ${expiry.toISOString().slice(0,10)}`)
        return null
      }
      
      // Calculate Variance IV
      rows = applyVegaWeights(rows, atm)
      let atmRow = rows.find(r => r.strike === atm) || rows[0]
      const variance = straddleVariance(atmRow.call.price, atmRow.put.price, F, T)

      return {
        expiry: expiry.toISOString().slice(0, 10),
        atmStrike: atm,
        indiv: Math.sqrt(variance),
        rows
      }
    }

    const weekly = await compute(weeklyExp)
    
    if (weekly) {
        console.log(`   🎉 Success! Calculated IV: ${(weekly.indiv*100).toFixed(2)}%`)
    }

    return {
      asset: assetName,
      timestamp: Date.now(),
      futures: F,
      headline: { weekly: weekly ? weekly.indiv : 0 },
      weekly
    }

  } catch (e) {
    console.error(`   🛑 CRASH ${assetName}:`, e.message)
    return null
  }
}

async function run() {
  console.log("🚀 Worker Started")
  await tv.setup()
  
  const results = {}
  const targets = ["NIFTY", "BANKNIFTY", "CRUDEOIL", "GOLD"]

  for (const t of targets) {
    const res = await processAsset(t)
    if (res) results[t] = res
  }

  // Debug: Print final object keys
  console.log("\n📦 Final Data Keys:", Object.keys(results))

  fs.writeFileSync("indiv_data.json", JSON.stringify(results, null, 2))
  console.log("💾 Saved to indiv_data.json")

  tv.cleanup()
  process.exit(0)
}

run()
