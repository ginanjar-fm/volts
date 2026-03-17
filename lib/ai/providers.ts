import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

export const models = {
  "gpt-4o": openai("gpt-4o"),
  "gpt-4o-mini": openai("gpt-4o-mini"),
  "claude-sonnet-4-5": anthropic("claude-sonnet-4-5-20250929"),
  "claude-haiku-3.5": anthropic("claude-3-5-haiku-20241022"),
} as const;

export type ModelId = keyof typeof models;

export const defaultModel: ModelId = "gpt-4o-mini";

export function getModel(modelId?: string) {
  if (!modelId || !(modelId in models)) return models[defaultModel];
  return models[modelId as ModelId];
}
