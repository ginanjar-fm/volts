"use client";

import { useState, useCallback } from "react";

export function useAICompletion(options?: { model?: string }) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const complete = useCallback(
    async (prompt: string, system?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/completion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, system, model: options?.model }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setText(data.text);
        return data.text;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options?.model],
  );

  return { text, isLoading, error, complete };
}
