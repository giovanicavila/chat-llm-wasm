import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkerInMessage, WorkerOutMessage } from "@/workers/llm.worker";

export type ModelStatus = "idle" | "loading" | "ready" | "error";

export type LLMState = {
  status: ModelStatus;
  loadingProgress: number;
  loadingText: string;
  isGenerating: boolean;
  error: string | null;
};

type UseLLMReturn = LLMState & {
  send: (
    messages: Array<{ role: string; content: string }>,
    onToken: (token: string) => void,
    onDone: () => void,
  ) => void;
};

export function useLLM(): UseLLMReturn {
  const workerRef = useRef<Worker | null>(null);
  const onTokenRef = useRef<((token: string) => void) | null>(null);
  const onDoneRef = useRef<(() => void) | null>(null);

  const [state, setState] = useState<LLMState>({
    status: "idle",
    loadingProgress: 0,
    loadingText: "Initializing…",
    isGenerating: false,
    error: null,
  });

  useEffect(() => {
    const worker = new Worker(
      new URL("@/workers/llm.worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current = worker;

    worker.addEventListener("message", (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data;

      if (msg.type === "loading") {
        setState((s) => ({
          ...s,
          status: "loading",
          loadingProgress: msg.progress,
          loadingText: msg.text,
        }));
      } else if (msg.type === "ready") {
        setState((s) => ({ ...s, status: "ready", loadingProgress: 100 }));
      } else if (msg.type === "token") {
        onTokenRef.current?.(msg.token);
      } else if (msg.type === "done") {
        setState((s) => ({ ...s, isGenerating: false }));
        onDoneRef.current?.();
      } else if (msg.type === "error") {
        setState((s) => ({
          ...s,
          status: "error",
          isGenerating: false,
          error: msg.message,
        }));
      }
    });

    // Kick off model download immediately when the hook mounts
    const loadMsg: WorkerInMessage = { type: "load" };
    worker.postMessage(loadMsg);
    setState((s) => ({ ...s, status: "loading", loadingText: "Starting…" }));

    return () => {
      worker.terminate();
    };
  }, []);

  const send = useCallback(
    (
      messages: Array<{ role: string; content: string }>,
      onToken: (token: string) => void,
      onDone: () => void,
    ) => {
      if (!workerRef.current) return;
      onTokenRef.current = onToken;
      onDoneRef.current = onDone;
      setState((s) => ({ ...s, isGenerating: true }));
      const msg: WorkerInMessage = { type: "generate", messages };
      workerRef.current.postMessage(msg);
    },
    [],
  );

  return { ...state, send };
}
