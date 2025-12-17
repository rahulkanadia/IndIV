import tv from "tradingview-scraper"
import {ASSETS} from "../lib/assets.js"
import {resolveExpiry} from "../lib/expiry.js"
import {tvOptionSymbols} from "../lib/symbols.js"
import {atmStraddleIV} from "../lib/iv.js"
import {checkIlliquidity} from "../lib/liquidity.js"
import {cache} from "../lib/cache.js"
import {storeSnapshot} from "../lib/store.js"

export default async function handler(req,res) {
    const asset = (req.query.asset || "NIFTY").toUpperCase()
    const cfg = ASSETS[asset]

    if (!cfg) return res.status(400).json({error: "Unsupported asset"})

    if(cache[asset] && Date.now()-cache[asset].ts < 25*60*1000)
        returnres.json(cache[asset].data)

    let now = new Date()
    let weeklyExp = resolveExpiry("W",now)
    let monthlyExp = resolveExpiry("M",now)

    let fut = await tv.getQuote(cfg.futuresSymbol)
    let futPrice = fut.futPrice
    let futVolume = fut.volume ?? 0

    let strike = Math.round(futPrice/cfg.strikeStep)*cfg.strikeStep

    async function compute(epiry,prevIV,prevFut) {
        let T = (expiry-now)/(365*24*60*60*1000)

        let s = tvOptionSymbols(asset,expiry,strike)
        let ce = await tv.getQuote(s.ce)
        let pe = await tv.getQuote(s.pe)

        let {illiquid} = checkIlliquidity({
            ivNow,
            ivPrev: prevIV,
            futNow: futPrice,
            futPre: prevFut,
            T,
            optVolume,
            futVolume,
            strikeStep: cfg.strikeStep
        })

        return {
            iv: illiquid ? prevIV : ivNow,
            illiquid,
            rawIV: ivNow
        }
    }

    let prev = cache[asset]?.data

    let weekly = await compute (
        weeklyExp,
        prev?.iv?.weekly,
        prev?.futures
    )

    let monthly = await compute (
        monthlyExp,
        prev?.iv?.monthly,
        prev?.futures
    )

    let response = {
        asset,
        futuers: Math.round(futPrice),
        iv: {
            weekly: weekly.iv,
            monthly: monthly.iv
        },
        flags: {
            weekly: weekly.illiquid ? "#":"",
            monthly: monthly.illiquid ? "#":""
        },
        expiry: {
            weekly: weeklyExp.toISOString().slice(0,10),
            monthly: monthlyExp.toISOString().slice(0,10)
        },
        timestamp: Date.now()
    }

    cache[asset] = {ts: Date.now(), data:response}
    await storeSnapshot(response)

    res.json(response)
}