import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type InsertEv<T = any> = { type: "insert"; table: string; row: T };
type UpdateEv<T = any> = { type: "update"; table: string; row: T };
type DeleteEv = { type: "delete"; table: string; id: string | number; tableIdField?: string };
type RowEvent<T = any> = InsertEv<T> | UpdateEv<T> | DeleteEv;

export function useRowStream(streamUrl = "http://localhost:3100/stream") {
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(streamUrl); // no credentials; CORS '*' OK
    esRef.current = es;

    const onOpen = () => setConnected(true);
    const onError = () => setConnected(false);

    const onRow = (evt: MessageEvent) => {
      try {
        const payload: RowEvent = JSON.parse(evt.data);

        if (payload.table === "deals" && payload.type === "insert" && payload.row) {
          qc.setQueryData<any[]>(["deals"], (old) => {
            if (!old) return [payload.row];
            const id = (payload.row as any)?.id;
            if (id != null && old.some((r) => r?.id === id)) return old;
            return [payload.row, ...old];
          });
        }

        if (payload.table === "deals" && payload.type === "update" && payload.row) {
          const id = (payload.row as any)?.id;
          if (id == null) return;
          qc.setQueryData<any[]>(["deals"], (old) =>
            old ? old.map((r) => (r?.id === id ? payload.row : r)) : old
          );
        }

        if (payload.table === "deals" && payload.type === "delete") {
          const id = payload.id;
          qc.setQueryData<any[]>(["deals"], (old) => (old ? old.filter((r) => r?.id !== id) : old));
        }
      } catch {}
    };

    es.addEventListener("open", onOpen as any);
    es.addEventListener("error", onError as any);
    es.addEventListener("row", onRow as any);

    return () => {
      es.removeEventListener("open", onOpen as any);
      es.removeEventListener("error", onError as any);
      es.removeEventListener("row", onRow as any);
      es.close();
    };
  }, [qc, streamUrl]);

  return { connected };
}
