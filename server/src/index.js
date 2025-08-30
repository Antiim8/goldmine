import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { dealKey } from "./util/key.js";
import { dealPriceFloor } from "./util/price.js";
import { purgeExpiredBlacklists } from "./cron/purge.js";
const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? "http://localhost:5173";
app.use(cors({ origin: ALLOW_ORIGIN }));
app.use(express.json());
let clients = [];
let nextClientId = 1;
function sseBroadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.forEach((c) => c.res.write(payload));
}
app.get("/api/stream", (req, res) => {
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });
    res.flushHeaders();
    const id = nextClientId++;
    clients.push({ id, res });
    res.write(`event: connected\ndata: {"ok":true}\n\n`);
    const hb = setInterval(() => {
        res.write(`event: ping\ndata: {}\n\n`);
    }, 15000);
    req.on("close", () => {
        clearInterval(hb);
        clients = clients.filter((c) => c.id !== id);
    });
});
// --- REST ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/deals", async (_req, res) => {
    const deals = await prisma.deal.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
    });
    res.json(deals);
});
app.delete("/api/deals/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ error: "Not found" });
    await prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
    const key = dealKey(existing);
    const price = dealPriceFloor(existing);
    const extendTo = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const active = await prisma.dealBlacklist.findFirst({
        where: { key, expiresAt: { gt: new Date() } },
        orderBy: { expiresAt: "desc" },
    });
    if (!active) {
        await prisma.dealBlacklist.create({ data: { key, price, expiresAt: extendTo } });
    }
    else {
        await prisma.dealBlacklist.update({
            where: { id: active.id },
            data: {
                price: Math.min(active.price, price),
                expiresAt: active.expiresAt > extendTo ? active.expiresAt : extendTo,
            },
        });
    }
    sseBroadcast("deal_deleted", { id });
    res.json({ ok: true });
});
app.post("/api/deals", async (req, res) => {
    const d = req.body;
    if (!d || typeof d.id !== "number" || !d.name) {
        return res.status(400).json({ error: "bad payload" });
    }
    const key = dealKey(d);
    const price = dealPriceFloor(d);
    const bl = await prisma.dealBlacklist.findFirst({
        where: { key, expiresAt: { gt: new Date() } },
        orderBy: { expiresAt: "desc" },
    });
    if (bl && price >= bl.price) {
        return res.status(202).json({ suppressed: true, threshold: bl.price });
    }
    const saved = await prisma.deal.upsert({
        where: { id: d.id },
        update: { ...d, deletedAt: null },
        create: d,
    });
    if (bl && price < bl.price) {
        await prisma.dealBlacklist.update({ where: { id: bl.id }, data: { price } });
    }
    sseBroadcast("deal_upserted", saved);
    res.json(saved);
});
// --- housekeeping ---
(async () => {
    try {
        const n = await purgeExpiredBlacklists();
        if (n)
            console.log(`Purged ${n} expired blacklist entries`);
    }
    catch (err) {
        console.error("Initial purge failed:", err);
    }
})();
setInterval(async () => {
    try {
        const n = await purgeExpiredBlacklists();
        if (n)
            console.log(`Purged ${n} expired blacklist entries`);
    }
    catch (err) {
        console.error("Scheduled purge failed:", err);
    }
}, 6 * 60 * 60 * 1000);
// --- start ---
app.listen(PORT, HOST, () => {
    console.log(`API on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
    console.log(`Allow-Origin: ${ALLOW_ORIGIN}`);
});
