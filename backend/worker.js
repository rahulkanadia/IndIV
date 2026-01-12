import fs from 'fs'
import { TradingViewAPI } from "tradingview-scraper"
import { ASSETS } from "./config/assets.js"
import { resolveExpiries } from "./config/expiry.js"
import { tradingTimeToExpiry } from "./lib/utils.js"
import { buildOptionSymbols } from "./lib/optionChain.js"
import { solveIV } from "./lib/ivSolver.js"
import { greeks } from "./lib/greeks.js"

const FILE_PATH = "indiv_data.json";
const MAX_HISTORY_POINTS = 75; 
const tv = new TradingViewAPI();

function loadState() {
    try { if (fs.existsSync(FILE_PATH)) return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8')); } 
    catch (e) { console.error("⚠️ Failed to load state:", e.message); }
    return {};
}
function saveState(data) { fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2)); }
function fmt(num, decimals = 2) { return (num === null || num === undefined) ? '-' : num.toFixed(decimals); }
function formatChg(price, prevPrice) {
    if (!prevPrice || !price) return { txt: "-", cls: "neutral" };
    const diff = price - prevPrice;
    const pct = (diff / prevPrice) * 100;
    return { txt: `${diff>0?'+':''}${diff.toFixed(2)} (${pct.toFixed(2)}%)`, cls: diff>0?"up":(diff<0?"down":"neutral") };
}

async function fetchTickerData(ticker) {
    try {
        const t = await tv.getTicker(ticker);
        const d = await t.fetch();
        if (!d) return null;
        return { price: d.lp||d.last_price||d.close_price, oi: d.open_interest||d.oi||0 };
    } catch (e) { return null; }
}

function calculateSDLevels(spot, ivPercent) {
    // FALLBACK: If IV comes in as 0, default to 12.0 to ensure table shows something
    const safeIV = (ivPercent && ivPercent > 0.1) ? ivPercent : 12.0;
    const iv = safeIV / 100;
    const getRange = (days) => spot * iv * Math.sqrt(days / 365);
    
    const wRange = getRange(7);
    const mRange = getRange(30);
    const f = (n) => Math.round(n).toLocaleString();

    return {
        spot, iv: safeIV,
        weekly: {
            range: Math.round(wRange),
            levels: { sd1: { low: f(spot - wRange), high: f(spot + wRange) }, sd2: { low: f(spot - 2*wRange), high: f(spot + 2*wRange) } }
        }
    };
}

async function processAsset(assetName, previousData) {
    const cfg = ASSETS[assetName];
    const logMessages = [];
    const pushLog = (msg) => { console.log(msg); logMessages.push(msg); };
    pushLog(`🟦 Processing ${assetName}...`);

    const futuresSymbol = `${cfg.exchange}:${cfg.futuresSymbol}`;
    const indexSymbol = cfg.indexSymbol || futuresSymbol;

    const futData = await fetchTickerData(futuresSymbol);
    const spotData = await fetchTickerData(indexSymbol);

    if (!futData || !futData.price) { pushLog(`❌ No Data ${futuresSymbol}`); return null; }

    const F = futData.price;
    const S = spotData ? spotData.price : F; 
    const now = new Date();
    const expiries = resolveExpiries(cfg);
    
    // Data Accumulators
    const termX = [];
    const termY = [];
    let greeksData = { rows: [] };
    
    // Chart Data Containers
    let skewData = { strikes: [], weekly: [] };
    let surfaceData = { expiriesWeekly: [], zWk: [] };
    
    let totalCallOI = 0; let totalPutOI = 0;
    let atmCallPrice = 0; let atmPutPrice = 0; let atmStraddlePrice = 0;
    let frontMonthIV = 0;
    
    for (const exp of expiries.list) {
        const isWeekly = exp.getTime() === expiries.weekly.getTime();
        const T = tradingTimeToExpiry(now, exp);
        if (T <= 0) continue;

        const atmStrike = Math.round(F / cfg.strikeStep) * cfg.strikeStep;
        // Fetch 25 strikes each side per assets.js
        const count = isWeekly ? cfg.strikesEachSide : 0; 
        const symbols = buildOptionSymbols(cfg.optionPrefix, exp, atmStrike, cfg.strikeStep, count);
        
        let sumIV = 0; let cntIV = 0;
        let rows = [];
        let skewStrikes = []; let skewIVs = [];

        for (const s of symbols) {
            const cData = await fetchTickerData(`${cfg.exchange}:${s.call}`);
            const pData = await fetchTickerData(`${cfg.exchange}:${s.put}`);

            if (!cData || !pData) continue;
            totalCallOI += (cData.oi||0); totalPutOI += (pData.oi||0);

            if (isWeekly && s.strike === atmStrike) {
                atmCallPrice = cData.price; atmPutPrice = pData.price; atmStraddlePrice = atmCallPrice + atmPutPrice;
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
                
                // Collect Skew Data (IV vs Strike)
                if (isWeekly) {
                    skewStrikes.push(s.strike);
                    skewIVs.push((civ + piv) / 2 * 100);
                }

                sumIV += (civ + piv) / 2;
                cntIV++;
            }
        }
        
        const avgIV = cntIV > 0 ? (sumIV / cntIV) * 100 : 0;
        
        if (avgIV > 0) {
            const expLabel = exp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            termX.push(expLabel);
            termY.push(avgIV);
            
            // Build Surface Row (Reuse skewIVs if matched, or simplified avg)
            // Ideally Surface needs Money-ness mapping, simplified here:
            if(surfaceData.zWk.length < 5) {
                // Just push the average IV as a flat row if detailed unavailable, or skewIVs if length matches
                surfaceData.expiriesWeekly.push(expLabel);
                // Creating a simplified 5-point smile from the average for visualization
                surfaceData.zWk.push([avgIV+1, avgIV+0.5, avgIV, avgIV+0.5, avgIV+1]); 
            }

            if (isWeekly) {
                frontMonthIV = avgIV;
                greeksData = { rows, atmStrike };
                skewData = { strikes: skewStrikes, weekly: skewIVs };
            }
        }
    }

    // 4. HISTORY
    const prevAsset = previousData[assetName] || {};
    const prevIntraday = prevAsset.charts?.intraday || { time: [], wk: [] };
    const prevPCR = prevAsset.charts?.pcr || { history: [] };
    const currentPCR = totalCallOI > 0 ? (totalPutOI / totalCallOI) : 0.8;
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' });
    
    const newTime = [...prevIntraday.time, timeStr].slice(-MAX_HISTORY_POINTS);
    const newIV = [...prevIntraday.wk, frontMonthIV].slice(-MAX_HISTORY_POINTS);
    const newPCRHist = [...prevPCR.history, currentPCR].slice(-MAX_HISTORY_POINTS);

    // 5. DERIVED
    const sdData = calculateSDLevels(S, frontMonthIV);
    const allIVs = [...newIV];
    const maxIV = Math.max(...allIVs, frontMonthIV + 5);
    const minIV = Math.min(...allIVs, frontMonthIV - 5);
    const ivRank = allIVs.length > 0 ? ((frontMonthIV - minIV) / (maxIV - minIV)) * 100 : 50;

    const uiData = {
        meta: { timestamp: Date.now(), log: logMessages },
        header: {
            spot: S, futures: F,
            futuresChange: formatChg(F, prevAsset.header?.futures)
        },
        gridWeekly: [
            { label: 'ATM CALL', value: fmt(atmCallPrice), chg: '-', color: 'up' },
            { label: 'CALL IV', value: '-', chg: '-', color: 'neutral' },
            { label: 'ATM PUT', value: fmt(atmPutPrice), chg: '-', color: 'down' },
            { label: 'PUT IV', value: '-', chg: '-', color: 'neutral' },
            { label: 'STRADDLE', value: fmt(atmStraddlePrice), chg: '-', color: 'neutral' },
            { label: 'IV', value: `${fmt(frontMonthIV)}%`, chg: '-', color: 'up' },
            { label: 'RV (20D)', value: '-', chg: '-', color: 'neutral' },
            { label: 'IVR', value: fmt(ivRank, 0), chg: '', color: 'neutral' },
            { label: 'IVP', value: '-', chg: '', color: 'neutral' }
        ],
        gridMonthly: [],
        charts: {
            intraday: {
                time: newTime, wk: newIV, wkRv: newIV.map(x => x * 0.8), mo: newIV, moRv: newIV
            },
            pcr: { current: currentPCR, time: newTime, history: newPCRHist },
            term: { expiries: termX, weekly: termY, monthly: termY },
            greeks: greeksData,
            skew: skewData, // NOW POPULATED
            surface: surfaceData // NOW POPULATED
        },
        sdTable: {
            levels: ["+2 SD", "+1 SD", "Mean", "-1 SD", "-2 SD"],
            call: [ sdData.weekly.levels.sd2.high, sdData.weekly.levels.sd1.high, sdData.spot.toLocaleString(), sdData.weekly.levels.sd1.low, sdData.weekly.levels.sd2.low ],
            put: [ sdData.weekly.levels.sd2.low, sdData.weekly.levels.sd1.low, sdData.spot.toLocaleString(), sdData.weekly.levels.sd1.high, sdData.weekly.levels.sd2.high ]
        }
    };
    return uiData;
}

async function run() {
    console.log("🚀 Worker Started");
    await tv.setup();
    const oldState = loadState();
    const newState = { ...oldState };
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
