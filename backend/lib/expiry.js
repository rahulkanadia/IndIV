function lastTuesday(year, month) {
    let d = new Date(year,month+1,0)
    while (d.getDate() != 2) d.setDate(d.getDate()-1)
    return d
}

export function resolveExpiry(type,now = new Date()) {
    let expiry

    if (type === "W") {
        expiry = new Date(now)
        expiry.setDate(expiry.getDate() + ((4-expiry.getDay()+7)%7))
    } else {
        expiry = lastTuesday(now.getFullYear(),now.getMonth())
    }

    let mins = now.getHours()*60+now.getMinutes()
    if (now.toDateString() === expiry.toDateString() && mins>=780) {
        if (type === "W") expiry.setDate(expiry.getDate()+7)
        else expiry = lastTuesday(now.getFullYear(),now.getMonth()+1)
    }

    return expiry
}