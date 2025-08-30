import { useMemo } from "react";
import type { FiltersState } from "./types";

export default function Filters({
  value,
  onChange,
}: {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
}) {
  const contracts = useMemo(
    () => ["All Contracts", "AK-47", "AWP", "M4A4", "Glock-18", "Knife", "Gloves"],
    []
  );

  const set = (k: keyof FiltersState, v: string | boolean) =>
    onChange({ ...value, [k]: v } as FiltersState);

  const input = "w-full bg-tertiary border border-custom rounded-lg px-3 py-2 text-primary placeholder-muted";
  const label = "block text-sm font-medium text-secondary mb-2";

  return (
    <section className="bg-secondary rounded-xl border border-custom mb-6">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Deal Filters</h3>

        {/* --- Row 1: Search + Contract --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className={label}>Include</label>
            <input className={input} value={value.include} placeholder="Keywords to include..."
                   onChange={(e) => set("include", e.target.value)} />
          </div>
          <div>
            <label className={label}>Exclude</label>
            <input className={input} value={value.exclude} placeholder="Keywords to exclude..."
                   onChange={(e) => set("exclude", e.target.value)} />
          </div>
          <div>
            <label className={label}>Select Contract</label>
            <select className={input} value={value.contract}
                    onChange={(e) => set("contract", e.target.value)}>
              {contracts.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* --- Row 2: Price/Liquidity/Sales --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <div>
            <label className={label}>Min Price (Target)</label>
            <input type="number" className={input} value={value.minPrice} placeholder="0"
                   onChange={(e) => set("minPrice", e.target.value)} />
          </div>
          <div>
            <label className={label}>Max Price (Target)</label>
            <input type="number" className={input} value={value.maxPrice} placeholder="1000"
                   onChange={(e) => set("maxPrice", e.target.value)} />
          </div>
          <div>
            <label className={label}>Min Liquidity</label>
            <input type="number" className={input} value={value.minLiquidity} placeholder="0"
                   onChange={(e) => set("minLiquidity", e.target.value)} />
          </div>
          <div>
            <label className={label}>Max Liquidity</label>
            <input type="number" className={input} value={value.maxLiquidity} placeholder="100"
                   onChange={(e) => set("maxLiquidity", e.target.value)} />
          </div>
          <div>
            <label className={label}>Min Market CSGO Sales 7d</label>
            <input type="number" className={input} value={value.minSales} placeholder="0"
                   onChange={(e) => set("minSales", e.target.value)} />
          </div>
          <div>
            <label className={label}>Min Profit ($)</label>
            <input type="number" className={input} value={value.minProfit} placeholder="0"
                   onChange={(e) => set("minProfit", e.target.value)} />
          </div>
        </div>

        {/* --- Row 3: Margin % + per-market price ranges --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <div>
            <label className={label}>Margin % Min</label>
            <input type="number" className={input} value={value.marginMin} placeholder="0"
                   onChange={(e) => set("marginMin", e.target.value)} />
          </div>
          <div>
            <label className={label}>Margin % Max</label>
            <input type="number" className={input} value={value.marginMax} placeholder="100"
                   onChange={(e) => set("marginMax", e.target.value)} />
          </div>
          <div>
            <label className={label}>Buff Min</label>
            <input type="number" className={input} value={value.buffMin} placeholder="0"
                   onChange={(e) => set("buffMin", e.target.value)} />
          </div>
          <div>
            <label className={label}>Buff Max</label>
            <input type="number" className={input} value={value.buffMax} placeholder="∞"
                   onChange={(e) => set("buffMax", e.target.value)} />
          </div>
          <div>
            <label className={label}>CSGOTm Min</label>
            <input type="number" className={input} value={value.csgoTmMin} placeholder="0"
                   onChange={(e) => set("csgoTmMin", e.target.value)} />
          </div>
          <div>
            <label className={label}>CSGOTm Max</label>
            <input type="number" className={input} value={value.csgoTmMax} placeholder="∞"
                   onChange={(e) => set("csgoTmMax", e.target.value)} />
          </div>
        </div>

        {/* --- Row 4: Youpin + Volume range --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <div>
            <label className={label}>Youpin Min</label>
            <input type="number" className={input} value={value.youpinMin} placeholder="0"
                   onChange={(e) => set("youpinMin", e.target.value)} />
          </div>
          <div>
            <label className={label}>Youpin Max</label>
            <input type="number" className={input} value={value.youpinMax} placeholder="∞"
                   onChange={(e) => set("youpinMax", e.target.value)} />
          </div>
          <div>
            <label className={label}>Vol 7d Min</label>
            <input type="number" className={input} value={value.vol7dMin} placeholder="0"
                   onChange={(e) => set("vol7dMin", e.target.value)} />
          </div>
          <div>
            <label className={label}>Vol 7d Max</label>
            <input type="number" className={input} value={value.vol7dMax} placeholder="∞"
                   onChange={(e) => set("vol7dMax", e.target.value)} />
          </div>

          <div>
            <label className={label}>Max Price Age (days)</label>
            <input type="number" className={input} value={value.maxPriceAge} placeholder="7"
                   onChange={(e) => set("maxPriceAge", e.target.value)} />
          </div>
          <div>
            <label className={label}>Market CSGO Fee (%)</label>
            <input type="number" step="0.1" className={input} value={value.marketFee} placeholder="5"
                   onChange={(e) => set("marketFee", e.target.value)} />
          </div>
        </div>

        {/* --- Row 5: Toggles --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <label className="inline-flex items-center gap-2 text-secondary">
            <input type="checkbox" checked={value.onlyProfitable}
                   onChange={(e)=>set("onlyProfitable", e.target.checked)} />
            Only profitable (margin &gt; 0)
          </label>

          <label className="inline-flex items-center gap-2 text-secondary">
            <input type="checkbox" checked={value.onlyArbitrage}
                   onChange={(e)=>set("onlyArbitrage", e.target.checked)} />
            Only arbitrage (Buff &gt; CSGOTm)
          </label>
        </div>
      </div>
    </section>
  );
}
