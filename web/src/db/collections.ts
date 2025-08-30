// web/src/db/collections.ts
import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { dealSchema, type Deal } from './schema'
import { queryClient } from '@/lib/queryClient'

export const dealsCollection = createCollection(
  queryCollectionOptions<Deal>({
    id: 'deals',
    queryKey: ['deals'],
    queryClient, // ✅ required
    queryFn: async () => {
      const res = await fetch('/api/deals')
      if (!res.ok) throw new Error(`Failed to fetch deals: ${res.status}`)
      const raw = (await res.json()) as unknown
      return dealSchema.array().parse(raw)
    },
    getKey: (d) => d.id,
    startSync: true, // optional; fine to keep on
  })
)
