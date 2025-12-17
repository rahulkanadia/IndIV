export function atmStraddleIV(call,put,fut,expiry) {
    let now = new Date()
    let T = (expiry-now)/(365*24*60*60*1000)
    if (T <= 0) throw "Invalid expiry"
    return (call+put)/(fut*Math.sqrt(T))
}