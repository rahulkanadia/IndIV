import {tradingHoursToExpiry} from "./time.js"
import {MARKETS} from "./markets.js"

export function atmStraddleIV({
    call,
    put,
    fut,
    now,
    expiry,
    market
}) {
    if (call <=0 || put <= 0 || fut <= 0) {
        throw "Invalid prices"
    }

    let remainingHours = tradingHoursToExpiry(now,expiry,market)
    let T = remainingHours/MARKETS[market].annualHours

    return (call+put)/(fut*Math.sqrt(T))
}