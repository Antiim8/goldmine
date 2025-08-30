import { useMemo, useState } from "react";

export default function MarketplaceComparison() {
  const [primaryMarket, setPrimaryMarket] = useState("Buff163");
  const [secondaryMarket, setSecondaryMarket] = useState("CSGOTm");
  const marketplaces = useMemo(() => ["Buff163", "Steam Market", "CSGOTm", "Youpin", "DMarket"], []);

  return (
    <section className="bg-secondary rounded-xl p-6 mb-6 border border-custom overflow-hidden">
      <h3 className="mb-4 text-lg font-semibold text-primary">Compare Marketplaces</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-secondary">Primary Marketplace</label>
          <select value={primaryMarket} onChange={(e) => setPrimaryMarket(e.target.value)}
                  className="w-full bg-tertiary border border-custom rounded-lg px-3 py-2 text-primary">
            {marketplaces.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-secondary">Secondary Marketplace</label>
          <select value={secondaryMarket} onChange={(e) => setSecondaryMarket(e.target.value)}
                  className="w-full bg-tertiary border border-custom rounded-lg px-3 py-2 text-primary">
            {marketplaces.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
