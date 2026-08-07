import { OllamaProvider } from "./OllamaProvider.js";
import type { AIProvider } from "./AIProvider.js";

const host = process.env.OLLAMA_HOST ?? "http://localhost:11434";

export const interactiveAI: AIProvider = new OllamaProvider(
  host,
  process.env.OLLAMA_MODEL_INTERACTIVE ?? "qwen2.5:3b-instruct-q4_K_M",
);

export const backgroundAI: AIProvider = new OllamaProvider(
  host,
  process.env.OLLAMA_MODEL_BACKGROUND ?? "qwen2.5:7b-instruct-q4_K_M",
);

export type { AIProvider } from "./AIProvider.js";
