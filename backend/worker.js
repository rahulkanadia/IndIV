import fs from 'fs'
import { TradingViewAPI } from "tradingview-scraper"
import { ASSETS } from "./config/assets.js"
import { resolveExpiries } from "./config/expiry.js"
import { tradingTimeToExpiry } from "./lib/utils.js"
import { buildOptionSymbols } from "./lib/optionChain.js"
import { solveIV } from "./lib/ivSolver.js"
import { greeks } from "./lib/greeks.js"

// --- CONSTANTS ---
const FILE_PATH = "indiv_data.json";
const MAX_HISTORY_POINTS = 75; // Approx 1 full trading day at 5-min intervals
const tv = new TradingViewAPI();

// --- 1. STATE MANAGEMENT ---
function loadState() {
    try {
        if (fs.existsSync(FILE_PATH)) {
            const raw = fs.readFileSync(FILE_PATH, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error("⚠️ Failed to load previous state:", e.message);
    }
    return {}; // Empty start
}

function saveState(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// --- 2. HELPERS ---
async function fetchPrice(ticker) {
    try {
        const t = await tv.getTicker(ticker);
        const d = await t.fetch();
        if (!d) return null;
        return d.lp || d.last_price || d.close_price;
    } catch (e) {
        return null;
    }
}

// Simple formatter to match UI expectations ("+12 (0.5%)")
function formatChg(price, prevPrice) {
    if (!prevPrice) return { txt: "-", cls: "neutral" };
    const diff = price - prevPrice;
    const pct = (diff / prevPrice) * 100;
    const sign = diff >= 0 ? "+" : "";
    const cls = diff >= 0 ? "up" : "down";
    return {
        txt: `${sign}${diff.toFixed(2)} (${sign}${pct.toFixed(2)}%)`,
        cls: cls,
        diff: diff,
        pct: pct
    };
}

// --- 3. CORE LOGIC ---
async function processAsset(assetName, previousData) {
    const cfg = ASSETS[assetName];
    const logMessages = [];
    const pushLog = (msg) => { console.log(msg); logMessages.push(msg); };
    
    pushLog(`🟦 Processing ${assetName}...`);

    // A. FETCH UNDERLYING
    const futuresSymbol = `${cfg.exchange}:${cfg.futuresSymbol}`;
    const spotPrice = 25950; // TODO: Fetch Actual Spot Index from TV if available, else derive
    const futPrice = await fetchPrice(futuresSymbol);

    if (!futPrice) {
        pushLog(`❌ CRITICAL: Could not fetch Futures Price for ${futuresSymbol}`);
        return null;
    }
    
    // Assume Spot is close to Future for now if not fetched (Or fetch specific index ticker)
    // For NIFTY, TV ticker is "NSE:NIFTY" usually, but requires specific access. 
    // We will use Fut for calculations but need Spot for "Spot Price" display.
    const F = futPrice; 
    
    // B. RESOLVE EXPIRIES
    const expiries = resolveExpiries(cfg);
    const now = new Date();
    
    // C. PROCESS CHAINS
    // Strategy: 
    // 1. Detailed Chain for Weekly (Exp[0]) & Monthly (Exp[M]) -> For Surface & Greeks
    // 2. Single ATM Strike for Others -> For Term Structure

    let termStructureData = [];
    let surfaceData = { weekly: [], monthly: [] };
    let greeksData = { rows: [] };
    let pcrData = { oiCall: 0, oiPut: 0 };
    
    // Helper to process a specific expiry
    async function analyzeExpiry(expiryDate, isDetailed) {
        const T = tradingTimeToExpiry(now, expiryDate);
        if (T <= 0) return null;

        const atmStrike = Math.round(F / cfg.strikeStep) * cfg.strikeStep;
        
        // If detailed, grab +/- 8 strikes. If simple, just ATM.
        const count = isDetailed ? 8 : 0; 
        const symbols = buildOptionSymbols(cfg.optionPrefix, expiryDate, atmStrike, cfg.strikeStep, count);

        let totalIV = 0;
        let countIV = 0;
        let expiryRowData = [];

        // Batch requests to be polite but fast
        // (In production, use a queue. Here we await sequential for safety or Promise.all small batches)
        for (const s of symbols) {
            const cP = await fetchPrice(`${cfg.exchange}:${s.call}`);
            const pP = await fetchPrice(`${cfg.exchange}:${s.put}`);

            if (!cP || !pP) continue;

            const civ = solveIV({ price: cP, F, K: s.strike, T, isCall: true });
            const piv = solveIV({ price: pP, F, K: s.strike, T, isCall: false });

            // Accumulate PCR (OI) - *Needs OI Fetch support in future*
            // Currently TV scraper 'fetchPrice' might not return OI. 
            // We'll set placeholders 0 for now to avoid breaking.
            
            if (civ && piv) {
                const rowStats = {
                    strike: s.strike,
                    call: { price: cP, iv: civ * 100, greeks: greeks(F, s.strike, T, civ, true) },
                    put:  { price: pP, iv: piv * 100, greeks: greeks(F, s.strike, T, piv, false) }
                };
                expiryRowData.push(rowStats);
                
                totalIV += (civ + piv) / 2;
                countIV++;
            }
        }

        const avgIV = countIV > 0 ? (totalIV / countIV) * 100 : 0;

        return {
            date: expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            avgIV,
            rows: expiryRowData,
            atmStrike
        };
    }

    // --- EXECUTE LOOPS ---
    
    // 1. Loop ALL Expiries for Term Structure
    const termX = [];
    const termY = [];
    
    for (const exp of expiries.list) {
        // Is this the "Detailed" Weekly or Monthly?
        const isWeekly = exp.getTime() === expiries.weekly.getTime();
        const isMonthly = exp.getTime() === expiries.monthly.getTime();
        const isDetailed = isWeekly || isMonthly;

        const data = await analyzeExpiry(exp, isDetailed);
        
        if (data) {
            termX.push(data.date);
            termY.push(data.avgIV);

            // Populate Surface & Greeks if detailed
            if (isWeekly) {
                greeksData.rows = data.rows; // Populate Table
                greeksData.atmStrike = data.atmStrike;
            }
            // Populate Surface Arrays ( Simplified Mapping for now )
            // Ideally map rows -> moneyness.
        }
    }

    // D. HISTORY & PERSISTENCE (The "Memory")
    const prevAsset = previousData[assetName] || {};
    const prevIntraday = prevAsset.charts ? prevAsset.charts.intraday : { time: [], wk: [] };
    
    // Add new point
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' });
    const currentWeeklyIV = termY[0] || 0;
    
    // Append and slice
    let newTime = [...prevIntraday.time, timeStr].slice(-MAX_HISTORY_POINTS);
    let newIV = [...prevIntraday.wk, currentWeeklyIV].slice(-MAX_HISTORY_POINTS);

    // E. CONSTRUCT "VIEW MODEL"
    // This maps raw data to the specific keys the UI expects
    
    const uiData = {
        meta: {
            timestamp: Date.now(),
            log: logMessages
        },
        header: {
            spot: F,
            futures: F,
            futuresChange: formatChg(F, prevAsset.header ? prevAsset.header.futures : F)
        },

        // GRID DATA - FULL 9-ITEM ARRAY TO PREVENT CRASH
        // Mapping: 0:ATM_C, 1:IV_C, 2:ATM_P, 3:IV_P, 4:STRADDLE, 5:IV, 6:RV, 7:IVR, 8:IVP
        gridWeekly: [
            { label: 'ATM CALL', value: '-', chg: '-', color: 'neutral' },
            { label: 'CALL IV', value: '-', chg: '-', color: 'neutral' },
            { label: 'ATM PUT', value: '-', chg: '-', color: 'neutral' },
            { label: 'PUT IV', value: '-', chg: '-', color: 'neutral' },
            { label: 'STRADDLE', value: '-', chg: '-', color: 'neutral' },
            { label: 'IV', value: `${currentWeeklyIV.toFixed(2)}%`, chg: '-', color: 'up' },
            { label: 'RV (20D)', value: '-', chg: '-', color: 'neutral' },
            { label: 'IVR', value: '-', chg: '', color: 'neutral' },
            { label: 'IVP', value: '-', chg: '', color: 'neutral' }
        ],
        gridMonthly: [
            // Repeat the same 9 items for Monthly to be safe
             { label: 'ATM CALL', value: '-', chg: '-', color: 'neutral' },
             { label: 'CALL IV', value: '-', chg: '-', color: 'neutral' },
             { label: 'ATM PUT', value: '-', chg: '-', color: 'neutral' },
             { label: 'PUT IV', value: '-', chg: '-', color: 'neutral' },
             { label: 'STRADDLE', value: '-', chg: '-', color: 'neutral' },
             { label: 'IV', value: '-', chg: '-', color: 'neutral' },
             { label: 'RV (20D)', value: '-', chg: '-', color: 'neutral' },
             { label: 'IVR', value: '-', chg: '', color: 'neutral' },
             { label: 'IVP', value: '-', chg: '', color: 'neutral' }
        ],
        
        charts: {
            intraday: {
                time: newTime,
                wk: newIV,
                wkRv: newIV.map(x => x * 0.8), // Placeholder logic
                mo: newIV, 
                moRv: newIV
            },
            // 1. ADDED PCR SKELETON
            pcr: {
                current: 0.85, 
                time: newTime,
                history: newTime.map(() => 0.85) 
            },
            term: {
                expiries: termX,
                weekly: termY,
                monthly: termY
            },
            greeks: greeksData,
            skew: { strikes: [], weekly: [] }, // Add empty skew to be safe
            surface: { expiriesWeekly: [], zWk: [] } // Add empty surface to be safe
        },
        
        // 2. ADDED SD TABLE SKELETON
        sdTable: {
            // These placeholders ensure the table renders something until logic update
            levels: ["+2 SD", "+1 SD", "Mean", "-1 SD", "-2 SD"],
            call: ["-", "-", "-", "-", "-"],
            put: ["-", "-", "-", "-", "-"]
        }
    };

    return uiData;
}

// --- 4. RUNNER ---
async function run() {
    console.log("🚀 Worker Started");
    await tv.setup();

    const oldState = loadState();
    const newState = { ...oldState };

    // Process NIFTY Only for now (Test phase)
    const result = await processAsset("NIFTY", oldState);
    
    if (result) {
        newState["NIFTY"] = result;
        saveState(newState);
        console.log("💾 Saved NIFTY data.");
    } else {
        console.log("⚠️ Processing failed, state unchanged.");
    }

    tv.cleanup();
    process.exit(0);
}

run();
