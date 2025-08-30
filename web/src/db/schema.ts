// src/db/schema.ts
import { z } from 'zod'

export const dealSchema = z.object({
  id: z.number(),
  name: z.string(),
  liquidity: z.number(),
  buff: z.number(),
  csgoTm: z.number(),
  vol7d: z.number(),
  purch: z.number(),
  target: z.number(),
  youpin: z.number(),
  margin: z.number(),
  sku: z.string().optional().nullable(),
  deletedAt: z.string().datetime().optional().nullable(),
  updatedAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime().optional().nullable(),
})
export type Deal = z.infer<typeof dealSchema>
