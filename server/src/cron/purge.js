import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function purgeExpiredBlacklists() {
    const res = await prisma.dealBlacklist.deleteMany({
        where: { expiresAt: { lt: new Date() } },
    });
    return res.count;
}
