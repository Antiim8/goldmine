import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRowStream } from "@/hooks/useRowStream";

export type Deal = Record<string, any>;
type Props = {
  rows?: Deal[];
  data?: Deal[];
  deals?: Deal[];
  items?: Deal[];
};

export default function DealsTable(props: Props) {
  // If parent doesn't pass rows, we fetch ourselves.
  const passed = props.rows || props.data || props.deals || props.items || [];
  const shouldFetch = passed.length === 0;

  // keep SSE connected (no UI change)
  useRowStream();

  const { data: fetched = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals");
      if (!res.ok) throw new Error(`Failed to load deals: ${res.status}`);
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
    enabled: shouldFetch,
    initialData: [],
    refetchOnWindowFocus: false,
  });

  const rowsInput = (shouldFetch ? fetched : passed) as Deal[];

  const toNum = (v: unknown): number =>
    typeof v === "number" ? v : (typeof v === "string" ? (Number(v) || 0) : 0);
  const fmt = (n: number, digits = 2) =>
    Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : "–";

  // newest first (safe even if createdAt missing)
  const rows = React.useMemo(() => {
    const list = rowsInput.slice();
    list.sort((a, b) => {
      const at = a?.createdAt ? Date.parse(a.createdAt) : 0;
      const bt = b?.createdAt ? Date.parse(b.createdAt) : 0;
      return bt - at;
    });
    return list;
  }, [rowsInput]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-800">
        <thead className="bg-tertiary">
          <tr>
            <Th>#</Th>
            <Th>Market Hash Name</Th>
            <Th right>Liquidity</Th>
            <Th right>Buff</Th>
            <Th right>CSGOTM</Th>
            <Th right>CSGOTM Sales (7d)</Th>
            <Th right>Bought (3d)</Th>
            <Th right>Target Max</Th>
            <Th right>Youpin</Th>
            <Th right>Margin on selected</Th>
            <Th>Action</Th>
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-800">
          {rows.map((r, idx) => {
            const liquidity = toNum(r.liquidity);
            const buff = toNum(r.buff);
            const csgoTm = toNum(r.csgoTm);
            const vol7d = Math.max(0, Math.trunc(toNum(r.vol7d))); // CSGOTM Sales (7d)
            const bought3d = r.bought3d ?? null;                    // may be missing -> "–"
            const target = toNum(r.target);                          // Target Max
            const youpin = toNum(r.youpin);
            const marginSel = toNum(r.margin);                       // “Margin on selected”

            return (
              <tr key={String(r.id) + "-" + idx} className="bg-transparent">
                <Td>{idx + 1}</Td>
                <Td title={r.sku || r.name} className="font-semibold">
                  {r.name || "–"}
                </Td>

                <Td right>{fmt(liquidity)}</Td>
                <Td right>{fmt(buff)}</Td>
                <Td right>{fmt(csgoTm)}</Td>
                <Td right>{Number.isFinite(vol7d) ? vol7d : "–"}</Td>
                <Td right>{bought3d == null || bought3d === "" ? "–" : String(bought3d)}</Td>
                <Td right>{fmt(target)}</Td>
                <Td right>{fmt(youpin)}</Td>
                <Td right className={marginSel >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {fmt(marginSel)}
                </Td>

                <Td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard?.writeText(String(r.name || ""))}
                      className="px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
                      title="Copy Market Hash Name"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://steamcommunity.com/market/search?q=${encodeURIComponent(r.name || "")}`,
                          "_blank"
                        )
                      }
                      className="px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
                      title="Open on Steam (search)"
                    >
                      Open
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={11} className="px-3 py-4 text-center opacity-70">
                No deals yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* --- keep your existing look --- */
function Th({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={[
        "px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider table-text-white",
        right ? "text-right" : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

type TdProps = React.TdHTMLAttributes<HTMLTableCellElement> & { right?: boolean };
function Td({ children, className = "", right = false, ...rest }: TdProps) {
  return (
    <td
      {...rest}
      className={[
        "px-3 py-2 whitespace-nowrap align-middle",
        right ? "text-right" : "text-left",
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}
