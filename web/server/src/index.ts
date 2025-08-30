// server/src/index.ts
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { dealKey } from "./util/key.js";
import { dealPriceFloor } from "./util/price.js";
import { purgeExpiredBlacklists } from "./cron/purge.js";

const prisma = new PrismaClient();
const app = express();

/** ---- Config (envs) ---- */
const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? "http://localhost:5173";
const API_KEY = process.env.API_KEY ?? ""; // empty = disabled (dev)

/** ---- Middleware ---- */
app.use(cors({ origin: ALLOW_ORIGIN }));
app.use(express.json());

// Optional tiny logger (uncomment if wanted)
// app.use((req, _res, next) => { console.log(req.method, req.url); next(); });

/** ---- API-key guard for mutating routes ---- */
function requireApiKey(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!API_KEY) return next(); // allow in dev if not set
  const key = req.get("x-api-key");
  if (key !== API_KEY) return res.status(401).json({ error: "unauthorized" });
  next();
}

/** ---- SSE clients ---- */
type SSEClient = { id: number; res: express.Response };
let clients: SSEClient[] = [];
let nextClientId = 1;

function sseBroadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const c of clients) c.res.write(payload);
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

/** ---- Routes ---- */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/deals", async (_req, res) => {
  const deals = await prisma.deal.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  res.json(deals);
});

app.delete("/api/deals/:id", requireApiKey, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "not_found" });

  // soft delete
  await prisma.deal.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // add/extend blacklist for 24h
  const key = dealKey(existing); // accepts sku: string | null
  const price = dealPriceFloor(existing);
  const extendTo = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const active = await prisma.dealBlacklist.findFirst({
    where: { key, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "desc" },
  });

  if (!active) {
    await prisma.dealBlacklist.create({
      data: { key, price, expiresAt: extendTo },
    });
  } else {
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

type IncomingDeal = {
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
};

app.post("/api/deals", requireApiKey, async (req, res) => {
  const d = req.body as IncomingDeal;
  if (
    !d ||
    typeof d.id !== "number" ||
    typeof d.name !== "string" ||
    Number.isNaN(d.buff) ||
    Number.isNaN(d.csgoTm) ||
    Number.isNaN(d.youpin) ||
    Number.isNaN(d.target)
  ) {
    return res.status(400).json({ error: "bad_payload" });
  }

  const key = dealKey(d);
  const price = dealPriceFloor(d);

  // blacklist check
  const bl = await prisma.dealBlacklist.findFirst({
    where: { key, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "desc" },
  });

  if (bl && price >= bl.price) {
    // suppressed (not better than threshold)
    return res.status(202).json({ suppressed: true, threshold: bl.price });
  }

  // upsert (also clears soft-delete)
  const saved = await prisma.deal.upsert({
    where: { id: d.id },
    update: { ...d, deletedAt: null },
    create: d,
  });

  // if the new price is better, tighten the threshold
  if (bl && price < bl.price) {
    await prisma.dealBlacklist.update({
      where: { id: bl.id },
      data: { price },
    });
  }

  sseBroadcast("deal_upserted", saved);
  res.json(saved);
});

/** ---- Housekeeping ---- */
(async () => {
  try {
    const n = await purgeExpiredBlacklists();
    if (n) console.log(`Purged ${n} expired blacklist entries`);
  } catch (err) {
    console.error("Initial purge failed:", err);
  }
})();

setInterval(async () => {
  try {
    const n = await purgeExpiredBlacklists();
    if (n) console.log(`Purged ${n} expired blacklist entries`);
  } catch (err) {
    console.error("Scheduled purge failed:", err);
  }
}, 6 * 60 * 60 * 1000);

/** ---- Error handler (last) ---- */
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
);

/** ---- Start ---- */
app.listen(PORT, HOST, () => {
  console.log(
    `API on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`
  );
  console.log(`Allow-Origin: ${ALLOW_ORIGIN}`);
  console.log(`API key auth: ${API_KEY ? "ENABLED" : "DISABLED (dev)"}`);
});
