export function dealPriceFloor(d) {
    return Math.min(d.buff, d.csgoTm, d.youpin, d.target);
}
