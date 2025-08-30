import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { dealSchema } from "./validators/deal.js";

const prisma = new PrismaClient();

// ---- Env ----
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? "http://localhost:5173";
const API_KEY = process.env.API_KEY ?? "";

// Streamer (optional)
const STREAMER_URL = process.env.STREAMER_URL || "http://localhost:3100/emit";
const STREAMER_AUTH_TOKEN = process.env.STREAMER_AUTH_TOKEN || "change-me";

// ---- Helpers ----
function parseOrigins(src: string): (string | RegExp)[] | "*" {
  const s = src.trim();
  if (s === "*" || s === "") return "*";
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

async function publishRow(payload: {
  type: "insert" | "update" | "delete";
  table: string;
  row?: unknown;
  id?: string | number;
}) {
  if (!STREAMER_AUTH_TOKEN) return;
  try {
    const res = await fetch(STREAMER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STREAMER_AUTH_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[streamer] failed: ${res.status} ${text}`);
    }
  } catch (e) {
    console.warn("[streamer] error:", (e as Error).message);
  }
}

// ---- App & middleware ----
const app = express();

app.use(
  cors({
    origin: parseOrigins(ALLOW_ORIGIN),
    credentials: false,
  })
);
app.use(express.json());

// ---- Root (so GET / doesn’t show “Cannot GET /”) ----
app.get("/", (_req, res) => {
  res.type("json").send(
    JSON.stringify(
      {
        ok: true,
        service: "goldmine-server",
        health: "/api/health",
        routes: ["/api/health", "/api/deals (GET, POST with x-api-key)"],
      },
      null,
      2
    )
  );
});

// ---- Routes ----

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// List deals (latest first)
app.get("/api/deals", async (_req, res, next) => {
  try {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    res.json(deals);
  } catch (err) {
    next(err);
  }
});

// API key guard
function requireKey(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!API_KEY) return res.status(500).json({ error: "Server missing API_KEY" });
  const hdr = req.header("x-api-key");
  if (hdr !== API_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// Upsert deal with validation (+ publish to streamer)
app.post("/api/deals", requireKey, async (req, res, next) => {
  try {
    const parsed = dealSchema.parse(req.body);

    // detect insert vs update
    const existed = await prisma.deal.findUnique({
      where: { id: parsed.id },
      select: { id: true },
    });

    const saved = await prisma.deal.upsert({
      where: { id: parsed.id },
      update: {
        name: parsed.name,
        liquidity: parsed.liquidity,
        buff: parsed.buff,
        csgoTm: parsed.csgoTm,
        vol7d: parsed.vol7d,
        purch: parsed.purch,
        target: parsed.target,
        youpin: parsed.youpin,
        margin: parsed.margin,
        sku: parsed.sku ?? null,
      },
      create: {
        id: parsed.id,
        name: parsed.name,
        liquidity: parsed.liquidity,
        buff: parsed.buff,
        csgoTm: parsed.csgoTm,
        vol7d: parsed.vol7d,
        purch: parsed.purch,
        target: parsed.target,
        youpin: parsed.youpin,
        margin: parsed.margin,
        sku: parsed.sku ?? null,
      },
    });

    // fire-and-forget publish (optional)
    publishRow({
      type: existed ? "update" : "insert",
      table: "deals",
      row: saved,
    });

    res.status(201).json(saved);
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", issues: err.issues });
    }
    next(err);
  }
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, HOST, () => {
  console.log(`API on http://${HOST}:${PORT}`);
  console.log(`Allow-Origin: ${ALLOW_ORIGIN}`);
});
