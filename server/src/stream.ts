import { Router, Request, Response } from "express";
import { EventEmitter } from "node:events";

export const streamBus = new EventEmitter(); // emit('row', payload)

const router = Router();

router.get("/stream", (req: Request, res: Response) => {
  // (Optional) check auth via cookie/session here; no secrets in browser needed.
  // if (!req.user) return res.sendStatus(401);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.(); // if compression is enabled

  const keepAlive = setInterval(() => {
    res.write(`: ping\n\n`); // comment line to keep connection alive
  }, 25000);

  const onRow = (payload: unknown) => {
    res.write(`event: row\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  streamBus.on("row", onRow);

  req.on("close", () => {
    clearInterval(keepAlive);
    streamBus.off("row", onRow);
    res.end();
  });
});

export default router;
