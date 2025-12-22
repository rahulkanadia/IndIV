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

// Helper: Tries to fetch price 3 times. Essential for MCX which is slow to start.
async function getPrice(tickerObj) {
    for (let i = 0; i < 4; i++) {
        const data = await tickerObj.fetch()
        // Check for 'lp' (Last Price) OR 'ask'/'bid' if lp is missing
        if (data && (data.lp || data.last_price || data.close_price)) {
            return data.lp || data.last_price || data.close_price
        }
        // Wait 1 second before retrying
        await new Promise(r => setTimeout(r, 1000))
    }
    return null
}

async function processAsset(assetName) {
  const cfg = ASSETS[assetName]
  console.log(`\n🟦 Starting ${assetName}...`)

  const futuresTicker = `${cfg.exchange}:${cfg.futuresSymbol}`
  
  try {
    const futTicker = await tv.getTicker(futuresTicker)
    const F = await getPrice(futTicker)
    
    if (!F) {
      console.log(`   ❌ FAILED to get price for ${futuresTicker} (Timed out)`)
      return null
    }

    console.log(`   ✅ Futures Price: ${F}`)

    const now = new Date()
    const { weekly: weeklyExp, monthly: monthlyExp } = resolveExpiry(cfg, now)

    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      if (T <= 0) {
        console.log(`   ⚠️ Expiry ${expiry.toISOString()} is passed. Skipping.`)
        return null
      }

      console.log(`   ⏳ Processing Expiry: ${expiry.toISOString().slice(0,10)} (T=${T.toFixed(4)})`)

      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep
      const symbols = buildOptionSymbols(cfg.optionPrefix, expiry, atm, cfg.strikeStep, cfg.strikesEachSide)

      let rows = []
      
      for (const s of symbols) {
         const cTicker = await tv.getTicker(`${cfg.exchange}:${s.call}`)
         const pTicker = await tv.getTicker(`${cfg.exchange}:${s.put}`)
         
         // Fetch pair (Retries are built into getPrice, but we use strict check here)
         const cPrice = await getPrice(cTicker)
         const pPrice = await getPrice(pTicker)

         if (!cPrice || !pPrice) continue

         const civ = solveIV({ price: cPrice, F, K: s.strike, T, isCall: true })
         const piv = solveIV({ price: pPrice, F, K: s.strike, T, isCall: false })
         if (!civ || !piv) continue

         rows.push({
            strike: s.strike,
            call: { price: cPrice, iv: civ },
            put: { price: pPrice, iv: piv }
         })
      }

      if (rows.length === 0) {
        console.log(`   ❌ No Options Data found for ${expiry.toISOString().slice(0,10)}`)
        return null
      }
      
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
  // NIFTY and BANKNIFTY are proven working. 
  // CRUDE/GOLD should now work thanks to the Retry loop.
  const targets = ["NIFTY", "BANKNIFTY", "CRUDEOIL", "GOLD"]

  for (const t of targets) {
    const res = await processAsset(t)
    if (res) results[t] = res
  }

  const keys = Object.keys(results)
  console.log("\n📦 Final Data Keys:", keys)

  if (keys.length > 0) {
      fs.writeFileSync("indiv_data.json", JSON.stringify(results, null, 2))
      console.log("💾 Saved to indiv_data.json")
  } else {
      console.log("⚠️ No data collected. File not saved.")
  }

  tv.cleanup()
  process.exit(0)
}

run()
