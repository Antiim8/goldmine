// src/features/deals/useDeals.ts
import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { connectDealsStream, deleteDeal as apiDelete, fetchDeals } from "@/lib/api";
import type { Deal } from "./types";

// central query key
export const dealsKey = ["deals"];

export function useDeals() {
  const qc = useQueryClient();

  // 1) Load all deals, cached
  const dealsQuery = useQuery({
    queryKey: dealsKey,
    queryFn: fetchDeals,
    initialData: [] as Deal[],
  });

  // 2) Optimistic delete
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: dealsKey });
      const prev = qc.getQueryData<Deal[]>(dealsKey) || [];
      qc.setQueryData<Deal[]>(dealsKey, prev.filter((d) => d.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(dealsKey, ctx.prev);
    },
    // optional: onSettled: () => qc.invalidateQueries({ queryKey: dealsKey }),
  });

  // 3) Keep cache in sync with SSE
  useEffect(() => {
    const es = connectDealsStream((ev) => {
      if (ev.type === "deal_upserted") {
        const d = ev.data;
        qc.setQueryData<Deal[]>(dealsKey, (rows = []) => {
          const i = rows.findIndex((r) => r.id === d.id);
          if (i >= 0) {
            const copy = rows.slice();
            copy[i] = d;
            return copy;
          }
          return [d, ...rows];
        });
      } else if (ev.type === "deal_deleted") {
        qc.setQueryData<Deal[]>(dealsKey, (rows = []) => rows.filter((r) => r.id !== ev.data.id));
      }
    });
    return () => es.close();
  }, [qc]);

  return {
    deals: dealsQuery.data || [],
    isLoading: dealsQuery.isLoading,
    isError: dealsQuery.isError,
    refetch: dealsQuery.refetch,
    deleteDeal: (id: number) => deleteMutation.mutate(id),
    deleting: deleteMutation.isPending,
  };
}
