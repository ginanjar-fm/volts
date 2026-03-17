"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function useAITools(options?: { model?: string }) {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/tools",
      body: { model: options?.model },
    }),
  });
  return chat;
}
