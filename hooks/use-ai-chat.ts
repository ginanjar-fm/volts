"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function useAIModelChat(options?: { model?: string; api?: string }) {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: options?.api ?? "/api/ai/chat",
      body: { model: options?.model },
    }),
  });
  return chat;
}
