// server/src/index.ts
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { dealSchema } from "./validators/deal.js";

const prisma = new PrismaClient();

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? "http://localhost";
const API_KEY = process.env.API_KEY ?? "";

// App & middleware
const app = express();
app.use(
  cors({
    origin: ALLOW_ORIGIN,
    credentials: false,
  })
);
app.use(express.json());

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

// Upsert deal with validation
app.post("/api/deals", requireKey, async (req, res, next) => {
  try {
    const parsed = dealSchema.parse(req.body);

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

    res.status(201).json(saved);
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Validation failed", issues: err.issues });
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
