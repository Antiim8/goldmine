// web/src/lib/api.ts

export type Deal = {
  id: number;
  name: string;
  liquidity: number;
  buff: number;
  csgoTm: number;
  vol7d: number;
  purch: number;
  target: number;
  youpin: number;
  margin: number;
  sku?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DealsResponse = {
  items: Deal[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Fetch deals from the API.
 * Accepts both shapes:
 *  - Array:            [{...}, ...]
 *  - Object wrapper:   { items: [...], total, page, pageSize }
 * Always returns { items, total, page, pageSize }.
 */
export async function fetchDeals(page = 1, pageSize = 25): Promise<DealsResponse> {
  // We proxy /api to the backend (Caddy), so use a relative path in the browser.
  const url = `/api/deals?page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(
    pageSize
  )}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /api/deals ${res.status}: ${text}`);
  }

  const data = await res.json();

  // If the server returns a plain array, normalize it.
  if (Array.isArray(data)) {
    const items = data as Deal[];
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length || pageSize,
    };
  }

  // Otherwise assume a wrapped object.
  return {
    items: Array.isArray(data.items) ? (data.items as Deal[]) : [],
    total: typeof data.total === "number" ? data.total : 0,
    page: typeof data.page === "number" ? data.page : page,
    pageSize: typeof data.pageSize === "number" ? data.pageSize : pageSize,
  };
}
