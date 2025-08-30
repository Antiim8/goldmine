/// <reference types="node" />

// Uses the global fetch available in Node 18+ (no node-fetch dependency needed)
const STREAMER_URL = process.env.STREAMER_URL || "http://localhost:3100/emit";
const STREAMER_AUTH_TOKEN = process.env.STREAMER_AUTH_TOKEN || "change-me";

type RowEvent =
  | { type: "insert"; table: string; row: unknown }
  | { type: "update"; table: string; row: unknown }
  | { type: "delete"; table: string; id: string | number; tableIdField?: string };

export async function publishRow(payload: RowEvent) {
  const res = await fetch(STREAMER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STREAMER_AUTH_TOKEN}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`publish failed: ${res.status} ${text}`);
  }
}
