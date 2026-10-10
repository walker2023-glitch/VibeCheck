import type { AIProvider } from "./provider";
import { ClaudeProvider } from "./claude";

export function resolveProvider(): { provider: AIProvider; model: string } | null {
  if (!process.env.AI_API_KEY || !process.env.AI_MODEL_CONCEPT) return null;
  if (process.env.AI_PROVIDER && process.env.AI_PROVIDER !== "claude") throw new Error("AI_UNAVAILABLE");
  return { provider: new ClaudeProvider(process.env.AI_API_KEY), model: process.env.AI_MODEL_CONCEPT };
}
