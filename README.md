# Chat LLM WASM

A React + Vite template for running quantized LLMs directly in the browser using Transformers.js. Inference executes entirely client-side via a Web Worker — with WebGPU acceleration and automatic WASM fallback, streamed token output, and OPFS model caching. No backend, no API key, full privacy.

## How it works

```
Main Thread (React UI)
  └─ useLLM hook
       ├─ postMessage({ type: 'load' })   ──► Web Worker
       └─ postMessage({ type: 'generate' }) ──► Web Worker
                                                  │
                                          Transformers.js
                                                  │
                                     ┌────────────┴────────────┐
                                  WebGPU                      WASM
                               (GPU inference)          (CPU fallback)
                                                  │
                                    token by token via TextStreamer
                                                  │
                                         ◄── postMessage({ type: 'token' })
                                    React appends token to message state
```

1. On mount, `useLLM` spawns a `Worker` and sends `{ type: 'load' }`
2. The worker probes `navigator.gpu.requestAdapter()` — uses **WebGPU** if available, falls back to **WASM** silently
3. Model weights are downloaded once from HuggingFace Hub and persisted in **OPFS** (Origin Private File System)
4. On each user message, the full conversation history is sent to the worker for context-aware generation
5. Each token is streamed back via `postMessage` and appended to the UI in real time

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 (oxc + rolldown) |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Routing | React Router 7 |
| LLM runtime | Transformers.js v4 (`@huggingface/transformers`) |
| Inference backend | WebGPU → WASM fallback (onnxruntime-web) |
| Model | `onnx-community/Qwen2.5-0.5B-Instruct` (q4, ~400 MB) |
| Threading | Web Worker (`src/workers/llm.worker.ts`) |
| Model cache | Origin Private File System (OPFS) |
| Streaming | `TextStreamer` with per-token `postMessage` |
| State | TanStack Query v5 + React `useState` |
| Testing | Vitest |
| Linting | Biome + Ultracite |

## Browser Requirements

| Feature | Minimum |
|---|---|
| WebGPU | Chrome 113+ / Edge 113+ (optional — WASM fallback available) |
| WebAssembly | All modern browsers |
| OPFS | Chrome 86+ / Firefox 111+ / Safari 15.2+ |
| `SharedArrayBuffer` | Requires COOP + COEP headers (configured in `vite.config.ts`) |

## Project Structure

```
src/
├── @types/           # Shared TypeScript type declarations
├── api/              # API layer organized by feature
├── components/
│   ├── ui/           # shadcn/ui primitives
│   ├── animate-ui/   # Animated components
│   ├── sidebar/      # Sidebar layout
│   ├── app-sidebar.tsx
│   ├── input-chat.tsx
│   └── nav-chats.tsx # Pinned + recent chat history
├── hooks/
│   └── use-llm.ts    # Worker bridge — load, generate, stream
├── pages/
│   └── Home/
│       ├── home.tsx  # Chat state + LLM wiring
│       └── components/
│           ├── chat-conversation.tsx
│           ├── chat-message.tsx
│           ├── model-loading-banner.tsx
│           └── typing-indicator.tsx
├── workers/
│   └── llm.worker.ts # WebGPU/WASM inference, TextStreamer, OPFS cache
├── layout/
├── providers/
└── routes/
```

## Getting Started

```bash
git clone <repository-url>
cd chat-llm-wasm
bun install
bun dev
```

> **Recommendation:** Use [Bun](https://bun.sh) as the package manager. It is significantly faster than npm or pnpm for installs and script execution.

On first load, the model (~400 MB) is downloaded from HuggingFace Hub and cached in OPFS. Subsequent loads are near-instant.

## Choosing a Different Model

Change `MODEL_ID` in `src/workers/llm.worker.ts`:

| Model | Size (q4) | Quality | Notes |
|---|---|---|---|
| `onnx-community/Qwen2.5-0.5B-Instruct` | ~400 MB | Good | Default — best size/quality tradeoff |
| `HuggingFaceTB/SmolLM2-360M-Instruct` | ~200 MB | Moderate | Faster download, lower coherence |
| `onnx-community/Phi-3-mini-4k-instruct` | ~2.3 GB | High | Requires WebGPU + strong GPU |

Any model available on HuggingFace Hub in ONNX format is compatible.

## Key Configuration

**`vite.config.ts`** — COOP/COEP headers required for `SharedArrayBuffer` (used by the WASM runtime):
```ts
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  },
},
```

**`src/workers/llm.worker.ts`** — model ID, quantization dtype, and device selection.

**`src/hooks/use-llm.ts`** — worker lifecycle, progress state, and streaming bridge to React.

## Further Reading

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for a plain-language explanation of every concept used in this project: Web Workers, WASM, WebGPU, COOP/COEP, token streaming, quantization, and OPFS caching — with analogies and code examples.

