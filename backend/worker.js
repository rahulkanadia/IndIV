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

// Helper: Very Patient Fetcher for GitHub Actions
async function getPrice(tickerObj) {
    // Try 8 times (approx 30 seconds total max wait)
    for (let i = 0; i < 8; i++) {
        try {
            const data = await tickerObj.fetch()
            if (data && (data.lp || data.last_price || data.close_price)) {
                return data.lp || data.last_price || data.close_price
            }
        } catch (e) {}
        
        // Wait 4 seconds between tries (High latency tolerance)
        await new Promise(r => setTimeout(r, 4000))
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

    console.log(`   ✅ Futures: ${F}`)

    const now = new Date()
    const { weekly: weeklyExp, monthly: monthlyExp } = resolveExpiry(cfg, now)

    async function compute(expiry) {
      const T = tradingTimeToExpiry(now, expiry)
      if (T <= 0) return null

      console.log(`   ⏳ Expiry: ${expiry.toISOString().slice(0,10)}`)

      const atm = Math.round(F / cfg.strikeStep) * cfg.strikeStep
      
      // Safety check: Ensure strikesEachSide exists
      if (!cfg.strikesEachSide || !cfg.optionPrefix) {
          console.log(`   🛑 CONFIG ERROR: Missing 'strikesEachSide' or 'optionPrefix' for ${assetName}`)
          return null
      }

      const symbols = buildOptionSymbols(cfg.optionPrefix, expiry, atm, cfg.strikeStep, cfg.strikesEachSide)

      // DEBUG: Verify symbol construction
      if (symbols.length > 0) {
        console.log(`   🔎 Trying First Symbol: ${cfg.exchange}:${symbols[0].call}`)
      } else {
        console.log(`   🛑 ERROR: No symbols generated. Check config.`)
        return null
      }

      let rows = []
      
      for (const s of symbols) {
         const cTicker = await tv.getTicker(`${cfg.exchange}:${s.call}`)
         const pTicker = await tv.getTicker(`${cfg.exchange}:${s.put}`)
         
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
        console.log(`   ❌ No Options Data found`)
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
        console.log(`   🎉 Success! IV: ${(weekly.indiv*100).toFixed(2)}%`)
    }

    return {
      asset: assetName,
      timestamp: Date.now(),
      futures: F,
      headline: { weekly: weekly ? weekly.indiv : 0 },
      weekly
    }

  } catch (e) {
    console.error(`   🛑 CRASH ${assetName}:`, e.message, e.stack)
    return null
  }
}

async function run() {
  console.log("🚀 Worker Started")
  await tv.setup()
  
  const results = {}
  // Reduced target list to debug faster (optional)
  const targets = ["NIFTY", "BANKNIFTY", "CRUDEOIL", "GOLD"]

  for (const t of targets) {
    const res = await processAsset(t)
    if (res) results[t] = res
  }

  const keys = Object.keys(results)
  
  if (keys.length > 0) {
      fs.writeFileSync("indiv_data.json", JSON.stringify(results, null, 2))
      console.log(`\n💾 Saved ${keys.length} assets to indiv_data.json`)
  } else {
      console.log("\n⚠️ No data collected.")
  }

  tv.cleanup()
  process.exit(0)
}

run()
