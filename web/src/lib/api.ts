// src/lib/api.ts
import type { Deal } from "@/features/deals/types";
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchDeals(): Promise<Deal[]> {
  const r = await fetch(`${API_URL}/api/deals`);
  if (!r.ok) throw new Error(`Failed to fetch deals (${r.status})`);
  return r.json();
}

export async function deleteDeal(id: number): Promise<void> {
  const r = await fetch(`${API_URL}/api/deals/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete failed (${r.status})`);
}

type StreamEvent =
  | { type: "deal_upserted"; data: Deal }
  | { type: "deal_deleted"; data: { id: number } }
  | { type: "connected"; data: { ok: boolean } }
  | { type: "ping"; data: Record<string, never> };

export function connectDealsStream(onEvent: (ev: StreamEvent) => void): EventSource {
  const es = new EventSource(`${API_URL}/api/stream`);
  es.addEventListener("connected", (e) =>
    onEvent({ type: "connected", data: JSON.parse((e as MessageEvent).data) })
  );
  es.addEventListener("ping", (e) =>
    onEvent({ type: "ping", data: JSON.parse((e as MessageEvent).data) })
  );
  es.addEventListener("deal_upserted", (e) =>
    onEvent({ type: "deal_upserted", data: JSON.parse((e as MessageEvent).data) })
  );
  es.addEventListener("deal_deleted", (e) =>
    onEvent({ type: "deal_deleted", data: JSON.parse((e as MessageEvent).data) })
  );
  return es;
}
