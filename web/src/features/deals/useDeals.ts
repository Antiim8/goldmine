// web/src/features/deals/useDeals.ts
import { useQuery } from "@tanstack/react-query";
import { fetchDeals, type DealsResponse, type Deal } from "@/lib/api";

/**
 * Deals hook that matches our normalized API shape.
 * Returns items + react-query state. No streaming from the browser.
 */
export function useDeals(page = 1, pageSize = 25) {
  const query = useQuery<DealsResponse, Error>({
    queryKey: ["deals", page, pageSize],
    queryFn: () => fetchDeals(page, pageSize),
    staleTime: 10_000,        // keep fresh for 10s
    refetchInterval: 15_000,  // background refresh
  });

  const items: Deal[] = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return {
    ...query,
    items,
    total,
    page,
    pageSize,
  };
}
