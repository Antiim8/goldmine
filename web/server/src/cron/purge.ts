import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Deletes expired blacklist rows (expiresAt < now).
 * Returns the number of deleted rows.
 */
export async function purgeExpiredBlacklists(): Promise<number> {
  const res = await prisma.dealBlacklist.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return res.count;
}
