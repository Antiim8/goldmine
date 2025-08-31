import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRowStream } from "@/hooks/useRowStream";

type Deal = Record<string, any>;
const toNum = (v: unknown): number => (typeof v === "number" ? v : (typeof v === "string" ? (Number(v) || 0) : 0));
const fmt = (n: number, digits = 2) => (Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : "–");

export default function MarketplaceComparison() {
  useRowStream();
  const { data = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals");
      if (!res.ok) throw new Error(`Failed to load deals: ${res.status}`);
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });

  const rows = useMemo(() => {
    const list = (data as Deal[]).slice();
    list.sort((a, b) => {
      const at = a?.createdAt ? Date.parse(a.createdAt) : 0;
      const bt = b?.createdAt ? Date.parse(b.createdAt) : 0;
      return bt - at;
    });
    return list.map((d) => ({
      id: d.id ?? "",
      name: d.name ?? "",
      liquidity: toNum(d.liquidity),
      buff: toNum(d.buff),
      csgoTm: toNum(d.csgoTm),
      vol7d: Math.max(0, Math.trunc(toNum(d.vol7d))), // CSGOTM Sales (7d)
      bought3d: d.bought3d ?? null, // not in API -> show "–"
      target: toNum(d.target),      // Target Max
      youpin: toNum(d.youpin),
      marginSelected: toNum(d.margin), // “Margin on selected”
      sku: d.sku ?? "",
    }));
  }, [data]);

  return (
    <div style={{ width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>Market Hash Name</Th>
            <Th align="right">Liquidity</Th>
            <Th align="right">Buff</Th>
            <Th align="right">CSGOTM</Th>
            <Th align="right">CSGOTM Sales (7d)</Th>
            <Th align="right">Bought (3d)</Th>
            <Th align="right">Target Max</Th>
            <Th align="right">Youpin</Th>
            <Th align="right">Margin on selected</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={String(r.id) + "-" + idx}>
              <Td>{idx + 1}</Td>
              <Td title={r.sku || r.name} style={{ fontWeight: 600 }}>{r.name || "–"}</Td>
              <Td align="right">{fmt(r.liquidity)}</Td>
              <Td align="right">{fmt(r.buff)}</Td>
              <Td align="right">{fmt(r.csgoTm)}</Td>
              <Td align="right">{Number.isFinite(r.vol7d) ? r.vol7d : "–"}</Td>
              <Td align="right">{r.bought3d == null || r.bought3d === "" ? "–" : String(r.bought3d)}</Td>
              <Td align="right">{fmt(r.target)}</Td>
              <Td align="right">{fmt(r.youpin)}</Td>
              <Td align="right" style={{ color: r.marginSelected >= 0 ? "#4ade80" : "#f87171" }}>{fmt(r.marginSelected)}</Td>
              <Td>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => navigator.clipboard?.writeText(String(r.name || ""))} style={btn} title="Copy Market Hash Name">Copy</button>
                  <button onClick={() => window.open(`https://steamcommunity.com/market/search?q=${encodeURIComponent(r.name || "")}`, "_blank")} style={btn} title="Open on Steam (search)">Open</button>
                </div>
              </Td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={11} style={{ padding: 16, textAlign: "center", opacity: 0.7 }}>No deals yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right"; }) {
  return <th style={{ textAlign: align, padding: "10px 12px", whiteSpace: "nowrap" }}>{children}</th>;
}

type TdProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  align?: "left" | "right";
} & Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align">;

function Td({ children, style, align = "left", ...rest }: TdProps) {
  return <td {...rest} style={{ padding: "10px 12px", textAlign: align, ...style }}>{children}</td>;
}

const btn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};
