export function dealPriceFloor(d: { buff: number; csgoTm: number; youpin: number; target: number }) {
  return Math.min(d.buff, d.csgoTm, d.youpin, d.target);
}
