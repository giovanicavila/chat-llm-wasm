import {
  TextStreamer,
  env,
  pipeline,
  type TextGenerationPipeline,
} from "@huggingface/transformers";

env.useBrowserCache = true;
env.allowLocalModels = false;

// ---------------------------------------------------------------------------
// Message types shared between the main thread and this worker
// ---------------------------------------------------------------------------

export type WorkerInMessage =
  | { type: "load" }
  | { type: "generate"; messages: Array<{ role: string; content: string }> };

export type WorkerOutMessage =
  | { type: "loading"; progress: number; text: string }
  | { type: "ready" }
  | { type: "token"; token: string }
  | { type: "done" }
  | { type: "error"; message: string };

// ---------------------------------------------------------------------------
// Model configuration
// ---------------------------------------------------------------------------
const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";

let generator: TextGenerationPipeline | null = null;

// ---------------------------------------------------------------------------
// WebGPU detection — check before trying, avoid silent failures
// ---------------------------------------------------------------------------
async function detectDevice(): Promise<"webgpu" | "wasm"> {
  if (!("gpu" in navigator)) {
    console.info("[LLM Worker] WebGPU not in navigator, using WASM.");
    return "wasm";
  }
  try {
    // biome-ignore lint: navigator.gpu is not in all TS lib types
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      console.info("[LLM Worker] WebGPU adapter is null, using WASM.");
      return "wasm";
    }
    console.info("[LLM Worker] WebGPU available.");
    return "webgpu";
  } catch (e) {
    console.info("[LLM Worker] WebGPU requestAdapter threw, using WASM.", e);
    return "wasm";
  }
}

// ---------------------------------------------------------------------------
// Progress callback — Transformers.js v4 uses status: 'progress' (0-100)
// ---------------------------------------------------------------------------
type ProgressEvent = {
  status: string;
  progress?: number;
  file?: string;
  name?: string;
};

function makeProgressCallback() {
  return (evt: ProgressEvent) => {
    console.debug("[LLM Worker] progress event:", evt);

    if (evt.status === "initiate") {
      const file = (evt.file ?? evt.name ?? "").split("/").pop() ?? "";
      send({ type: "loading", progress: 0, text: `Starting ${file}…` });
    } else if (evt.status === "progress") {
      const pct = evt.progress ?? 0;
      const file = (evt.file ?? evt.name ?? "").split("/").pop() ?? "";
      send({ type: "loading", progress: pct, text: `Downloading ${file}…` });
    } else if (evt.status === "done") {
      const file = (evt.file ?? evt.name ?? "").split("/").pop() ?? "";
      send({ type: "loading", progress: 100, text: `Loaded ${file}` });
    }
  };
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------
async function loadModel() {
  const device = await detectDevice();
  send({ type: "loading", progress: 0, text: `Initializing on ${device.toUpperCase()}…` });

  try {
    console.info(`[LLM Worker] Loading model on ${device}…`);
    generator = await pipeline("text-generation", MODEL_ID, {
      dtype: "q4",
      device,
      progress_callback: makeProgressCallback(),
    });
    console.info("[LLM Worker] Model ready.");
    send({ type: "ready" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[LLM Worker] Failed to load model:", err);

    if (device === "webgpu") {
      // Explicit fallback if detection still let WebGPU through but init failed
      send({ type: "loading", progress: 0, text: "Falling back to WASM…" });
      try {
        generator = await pipeline("text-generation", MODEL_ID, {
          dtype: "q4",
          device: "wasm",
          progress_callback: makeProgressCallback(),
        });
        console.info("[LLM Worker] Model ready (WASM fallback).");
        send({ type: "ready" });
      } catch (wasmErr) {
        const wasmMsg = wasmErr instanceof Error ? wasmErr.message : String(wasmErr);
        console.error("[LLM Worker] WASM fallback also failed:", wasmErr);
        send({ type: "error", message: wasmMsg });
      }
    } else {
      send({ type: "error", message: msg });
    }
  }
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------
async function generate(messages: Array<{ role: string; content: string }>) {
  if (!generator) {
    send({ type: "error", message: "Model not loaded yet." });
    return;
  }

  try {
    // TextStreamer is the correct streaming API for Transformers.js v4
    const streamer = new TextStreamer(
      (generator as unknown as { tokenizer: ConstructorParameters<typeof TextStreamer>[0] }).tokenizer,
      {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (chunk: string) => {
          send({ type: "token", token: chunk });
        },
      },
    );

    console.info("[LLM Worker] Starting generation…");
    await generator(messages as Parameters<TextGenerationPipeline>[0], {
      max_new_tokens: 512,
      do_sample: false,
      streamer,
    });
    console.info("[LLM Worker] Generation complete.");
    send({ type: "done" });
  } catch (err) {
    console.error("[LLM Worker] Generation error:", err);
    send({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

// ---------------------------------------------------------------------------
// Worker message bus
// ---------------------------------------------------------------------------

function send(msg: WorkerOutMessage) {
  self.postMessage(msg);
}

self.addEventListener("message", (event: MessageEvent<WorkerInMessage>) => {
  const { data } = event;
  if (data.type === "load") {
    loadModel();
  } else if (data.type === "generate") {
    generate(data.messages);
  }
});
