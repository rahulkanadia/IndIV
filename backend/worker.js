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
const MAX_HISTORY_POINTS = 75; // Approx 1 full trading day
const tv = new TradingViewAPI();

// --- STATE MANAGEMENT ---
function loadState() {
    try {
        if (fs.existsSync(FILE_PATH)) {
            return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
        }
    } catch (e) { console.error("⚠️ Failed to load state:", e.message); }
    return {};
}

function saveState(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// --- HELPER: FORMATTERS ---
function fmt(num, decimals = 2) {
    if (num === null || num === undefined) return '-';
    return num.toFixed(decimals);
}

function formatChg(price, prevPrice) {
    if (!prevPrice || !price) return { txt: "-", cls: "neutral" };
    const diff = price - prevPrice;
    const pct = (diff / prevPrice) * 100;
    const cls = diff > 0 ? "up" : (diff < 0 ? "down" : "neutral");
    const sign = diff > 0 ? "+" : "";
    return {
        txt: `${sign}${diff.toFixed(2)} (${pct.toFixed(2)}%)`,
        cls: cls
    };
}

// --- LOGIC: FETCH PRICE & OI ---
async function fetchTickerData(ticker) {
    try {
        const t = await tv.getTicker(ticker);
        const d = await t.fetch();
        if (!d) return null;
        
        // Try to capture Price and Open Interest
        // Note: Field names vary by exchange/TV data source. 
        // We look for common fields: lp (last price), ch (change), open_interest, etc.
        return {
            price: d.lp || d.last_price || d.close_price,
            oi: d.open_interest || d.oi || 0, // Fallback 0 if API doesn't provide OI
            volume: d.volume || 0
        };
    } catch (e) { return null; }
}

// --- LOGIC: CALCULATE SD LEVELS ---
function calculateSDLevels(spot, ivPercent) {
    // Formula: Range = Spot * (IV/100) * sqrt(Days/365)
    const iv = ivPercent / 100;
    
    const getRange = (days) => spot * iv * Math.sqrt(days / 365);
    
    // 1. Weekly (7 Days)
    const wRange = getRange(7);
    // 2. Monthly (30 Days)
    const mRange = getRange(30);
    
    // Formatting helper
    const f = (n) => Math.round(n).toLocaleString();

    return {
        spot: spot,
        iv: ivPercent,
        weekly: {
            range: Math.round(wRange),
            levels: {
                sd1: { low: f(spot - wRange), high: f(spot + wRange) },
                sd2: { low: f(spot - (2*wRange)), high: f(spot + (2*wRange)) }
            }
        },
        monthly: {
            range: Math.round(mRange),
            levels: {
                sd1: { low: f(spot - mRange), high: f(spot + mRange) },
                sd2: { low: f(spot - (2*mRange)), high: f(spot + (2*mRange)) }
            }
        }
    };
}

// --- MAIN PROCESSOR ---
async function processAsset(assetName, previousData) {
    const cfg = ASSETS[assetName];
    const logMessages = [];
    const pushLog = (msg) => { console.log(msg); logMessages.push(msg); };
    
    pushLog(`🟦 Processing ${assetName}...`);

    // 1. FETCH UNDERLYING
    const futuresSymbol = `${cfg.exchange}:${cfg.futuresSymbol}`;
    const futData = await fetchTickerData(futuresSymbol);
    
    if (!futData || !futData.price) {
        pushLog(`❌ CRITICAL: No data for ${futuresSymbol}`);
        return null;
    }
    const F = futData.price;
    const now = new Date();
    
    // 2. RESOLVE EXPIRIES
    const expiries = resolveExpiries(cfg);
    
    // 3. ANALYZE EXPIRIES (Loop)
    const termX = [];
    const termY = [];
    let greeksData = { rows: [] };
    
    // Accumulators for PCR
    let totalCallOI = 0;
    let totalPutOI = 0;
    
    // Accumulators for Grid (ATM Values)
    let atmCallPrice = 0;
    let atmPutPrice = 0;
    let atmStraddlePrice = 0;
    let frontMonthIV = 0;
    
    for (const exp of expiries.list) {
        const isWeekly = exp.getTime() === expiries.weekly.getTime();
        const T = tradingTimeToExpiry(now, exp);
        
        if (T <= 0) continue;

        const atmStrike = Math.round(F / cfg.strikeStep) * cfg.strikeStep;
        
        // Detailed chain for nearest expiry (Weekly)
        const count = isWeekly ? cfg.strikesEachSide : 0; 
        const symbols = buildOptionSymbols(cfg.optionPrefix, exp, atmStrike, cfg.strikeStep, count);
        
        let sumIV = 0;
        let cntIV = 0;
        let rows = [];

        for (const s of symbols) {
            const cData = await fetchTickerData(`${cfg.exchange}:${s.call}`);
            const pData = await fetchTickerData(`${cfg.exchange}:${s.put}`);

            if (!cData || !pData) continue;
            
            // Capture PCR Data (If available)
            totalCallOI += (cData.oi || 0);
            totalPutOI += (pData.oi || 0);

            // Capture ATM Data for Grid
            if (isWeekly && s.strike === atmStrike) {
                atmCallPrice = cData.price;
                atmPutPrice = pData.price;
                atmStraddlePrice = atmCallPrice + atmPutPrice;
            }

            const civ = solveIV({ price: cData.price, F, K: s.strike, T, isCall: true });
            const piv = solveIV({ price: pData.price, F, K: s.strike, T, isCall: false });

            if (civ && piv) {
                const cGreeks = greeks(F, s.strike, T, civ, true);
                const pGreeks = greeks(F, s.strike, T, piv, false);
                
                rows.push({
                    strike: s.strike,
                    call: { price: cData.price, iv: civ * 100, greeks: cGreeks, oi: cData.oi, oiChg: 0 },
                    put:  { price: pData.price, iv: piv * 100, greeks: pGreeks, oi: pData.oi, oiChg: 0 }
                });
                
                sumIV += (civ + piv) / 2;
                cntIV++;
            }
        }
        
        const avgIV = cntIV > 0 ? (sumIV / cntIV) * 100 : 0;
        
        if (avgIV > 0) {
            termX.push(exp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));
            termY.push(avgIV);
            
            if (isWeekly) {
                frontMonthIV = avgIV;
                greeksData = { rows, atmStrike };
            }
        }
    }

    // 4. HISTORY UPDATES
    const prevAsset = previousData[assetName] || {};
    const prevIntraday = prevAsset.charts?.intraday || { time: [], wk: [] };
    const prevPCR = prevAsset.charts?.pcr || { history: [] };
    
    // Calculate PCR
    const currentPCR = totalCallOI > 0 ? (totalPutOI / totalCallOI) : 0.8; // Default 0.8 if 0
    
    // Time Strings
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' });
    
    // Append History (Max 75)
    const newTime = [...prevIntraday.time, timeStr].slice(-MAX_HISTORY_POINTS);
    const newIV = [...prevIntraday.wk, frontMonthIV].slice(-MAX_HISTORY_POINTS);
    const newPCRHist = [...prevPCR.history, currentPCR].slice(-MAX_HISTORY_POINTS);

    // 5. CALCULATE DERIVED DATA (SD & GRID)
    const sdData = calculateSDLevels(F, frontMonthIV);
    
    // IV Rank (Simple Min/Max from history)
    const allIVs = [...newIV];
    const maxIV = Math.max(...allIVs, frontMonthIV + 5); // Fallback buffer
    const minIV = Math.min(...allIVs, frontMonthIV - 5);
    const ivRank = allIVs.length > 0 ? ((frontMonthIV - minIV) / (maxIV - minIV)) * 100 : 50;

    // 6. BUILD FINAL UI DATA
    const uiData = {
        meta: { timestamp: Date.now(), log: logMessages },
        header: {
            spot: F,
            futures: F,
            futuresChange: formatChg(F, prevAsset.header?.futures)
        },
        gridWeekly: [
            { label: 'ATM CALL', value: fmt(atmCallPrice), chg: '-', color: 'up' },
            { label: 'CALL IV', value: '-', chg: '-', color: 'neutral' }, // Todo: Calc specific IVs
            { label: 'ATM PUT', value: fmt(atmPutPrice), chg: '-', color: 'down' },
            { label: 'PUT IV', value: '-', chg: '-', color: 'neutral' },
            { label: 'STRADDLE', value: fmt(atmStraddlePrice), chg: '-', color: 'neutral' },
            { label: 'IV', value: `${fmt(frontMonthIV)}%`, chg: '-', color: 'up' },
            { label: 'RV (20D)', value: '-', chg: '-', color: 'neutral' },
            { label: 'IVR', value: fmt(ivRank, 0), chg: '', color: 'neutral' },
            { label: 'IVP', value: '-', chg: '', color: 'neutral' }
        ],
        gridMonthly: [], // Can duplicate GridWeekly if needed
        charts: {
            intraday: {
                time: newTime,
                wk: newIV,
                wkRv: newIV.map(x => x * 0.8),
                mo: newIV, moRv: newIV
            },
            pcr: {
                current: currentPCR,
                time: newTime,
                history: newPCRHist
            },
            term: { expiries: termX, weekly: termY, monthly: termY },
            greeks: greeksData,
            skew: { strikes: [], weekly: [] }, 
            surface: { expiriesWeekly: [], zWk: [] } 
        },
        sdTable: {
            levels: ["+2 SD", "+1 SD", "Mean", "-1 SD", "-2 SD"],
            call: [
                sdData.weekly.levels.sd2.high, 
                sdData.weekly.levels.sd1.high, 
                sdData.spot.toLocaleString(), 
                sdData.weekly.levels.sd1.low, 
                sdData.weekly.levels.sd2.low
            ],
            put: [
                sdData.weekly.levels.sd2.low, 
                sdData.weekly.levels.sd1.low, 
                sdData.spot.toLocaleString(), 
                sdData.weekly.levels.sd1.high, 
                sdData.weekly.levels.sd2.high
            ]
        }
    };

    return uiData;
}

// --- RUNNER ---
async function run() {
    console.log("🚀 Worker Started");
    await tv.setup();
    const oldState = loadState();
    const newState = { ...oldState };

    // Process List (Add more from CSV later)
    const targets = ["NIFTY"]; 
    
    for(const t of targets) {
        const res = await processAsset(t, oldState);
        if(res) newState[t] = res;
    }

    saveState(newState);
    console.log("💾 Saved Data.");
    tv.cleanup();
    process.exit(0);
}

run();
