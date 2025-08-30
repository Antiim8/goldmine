import * as React from "react";
import { useDeals } from "@/features/deals/useDeals";
import type { Deal } from "@/lib/api";

export default function DealsTable() {
  // simple paging (wire real controls later if you want)
  const page = 1;
  const pageSize = 25;

  const { items, total, isLoading, isError, error, refetch, isFetching } =
    useDeals(page, pageSize);

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Copied:", text);
    } catch {
      console.warn("Copy failed");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-secondary rounded-xl border border-custom p-6">
        <p className="text-secondary">Loading deals…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-secondary rounded-xl border border-custom p-6">
        <div className="flex items-center justify-between">
          <p className="text-red-400">
            Failed to load deals: {(error as Error)?.message || "Unknown error"}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-accent-gold text-black px-3 py-1 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl border border-custom overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-custom">
        <h3 className="text-primary font-semibold">Deals</h3>
        <div className="flex items-center gap-3">
          {isFetching && <span className="text-muted text-sm">Refreshing…</span>}
          <button
            className="bg-tertiary hover-bg border border-custom px-3 py-1 rounded-lg text-secondary"
            onClick={() => refetch()}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-tertiary">
            <tr>
              <Th>Nr</Th>
              <Th>Item Name</Th>
              <Th>Liq</Th>
              <Th>Buff</Th>
              <Th>CSGOTm</Th>
              <Th>Vol 7d</Th>
              <Th>Purch</Th>
              <Th>Target</Th>
              <Th>Youpin</Th>
              <Th>Margin</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y border-custom">
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-secondary" colSpan={11}>
                  No deals yet.
                </td>
              </tr>
            ) : (
              items.map((d: Deal, i: number) => (
                <tr key={d.id} className="hover-bg transition-colors">
                  <Td>{i + 1 + (page - 1) * pageSize}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button
                        title="Copy item name"
                        onClick={() => onCopy(d.name)}
                        className="text-muted hover:accent-gold"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                        </svg>
                      </button>
                      <span className="truncate text-white">{d.name}</span>
                    </div>
                  </Td>
                  <Td>{d.liquidity}</Td>
                  <Td>${d.buff.toFixed(2)}</Td>
                  <Td>${d.csgoTm.toFixed(2)}</Td>
                  <Td>{d.vol7d}</Td>
                  <Td>{d.purch}</Td>
                  <Td>${d.target.toFixed(2)}</Td>
                  <Td>${d.youpin.toFixed(2)}</Td>
                  <Td>+{d.margin}%</Td>
                  <Td>
                    {/* Delete is disabled client-side (API key is server-side). */}
                    <button
                      disabled
                      title="Delete (server write requires API key)"
                      className="opacity-50 cursor-not-allowed text-red-500"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-custom text-secondary text-sm">
        Showing {items.length} {items.length === 1 ? "deal" : "deals"}
        {typeof total === "number" ? ` • Total: ${total}` : null}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider table-text-white">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-3 whitespace-nowrap text-sm text-white">{children}</td>;
}
