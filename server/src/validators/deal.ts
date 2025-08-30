import { z } from "zod";

export const dealSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    name: z.string().min(1),
    liquidity: z.coerce.number(),
    buff: z.coerce.number(),
    csgoTm: z.coerce.number(),
    vol7d: z.coerce.number().int(),
    purch: z.coerce.number().int(),
    target: z.coerce.number(),
    youpin: z.coerce.number(),
    margin: z.coerce.number(),
    sku: z.string().min(1).optional().nullable(),
  })
  .strict();

export type DealInput = z.infer<typeof dealSchema>;
