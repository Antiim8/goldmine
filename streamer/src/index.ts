import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { EventEmitter } from "node:events";

const PORT = Number(process.env.PORT || 3100);
const ORIGIN = process.env.STREAMER_CORS_ORIGIN || "*";
const AUTH_TOKEN = process.env.STREAMER_AUTH_TOKEN || "";

type RowEvent =
  | { type: "insert"; table: string; row: unknown }
  | { type: "update"; table: string; row: unknown }
  | { type: "delete"; table: string; id: string | number; tableIdField?: string };

const bus = new EventEmitter();
const app = express();
app.set("trust proxy", true);

app.use(
  cors({
    origin: ORIGIN === "*" ? true : ORIGIN.split(",").map((s) => s.trim()),
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

// --- Friendly root so "/" doesn't say "Cannot GET /"
app.get("/", (_req, res) => {
  res.type("json").send(
    JSON.stringify(
      {
        ok: true,
        service: "goldmine-streamer",
        health: "/health",
        stream: "/stream",
        emit: { method: "POST", path: "/emit", auth: "Authorization: Bearer <token>" }
      },
      null,
      2
    )
  );
});

// --- Health
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, ts: Date.now() });
});

// --- SSE stream
app.get("/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`: connected ${Date.now()}\n\n`);

  const keepAlive = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, 25000);

  const onRow = (payload: RowEvent) => {
    res.write(`event: row\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  bus.on("row", onRow);

  req.on("close", () => {
    clearInterval(keepAlive);
    bus.off("row", onRow);
    res.end();
  });
});

// --- Publish (server -> streamer)
app.post("/emit", (req: Request, res: Response) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!AUTH_TOKEN || token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const payload = req.body as RowEvent;
  if (!payload || typeof payload !== "object" || !("type" in payload) || !("table" in payload)) {
    return res.status(400).json({ error: "invalid payload" });
  }

  bus.emit("row", payload);
  return res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`[streamer] listening on :${PORT}, origin=${ORIGIN}`);
});
