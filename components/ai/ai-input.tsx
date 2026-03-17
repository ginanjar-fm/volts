"use client";

import { useState, useCallback } from "react";
import { Sparkles, Loader2, X } from "lucide-react";

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestPrompt?: string;
  className?: string;
}

export function AIInput({
  value,
  onChange,
  placeholder,
  suggestPrompt = "Suggest a better version of this text",
  className,
}: AIInputProps) {
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestion = useCallback(async () => {
    if (!value.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${suggestPrompt}: "${value}"`,
          system: "You are a writing assistant. Return only the improved text, nothing else.",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSuggestion(data.text);
    } catch {
      // Silently fail for suggestions
    } finally {
      setIsLoading(false);
    }
  }, [value, suggestPrompt]);

  const acceptSuggestion = () => {
    onChange(suggestion);
    setSuggestion("");
  };

  const dismissSuggestion = () => {
    setSuggestion("");
  };

  return (
    <div className={className}>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={getSuggestion}
          disabled={isLoading || !value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Get AI suggestion"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </button>
      </div>
      {suggestion && (
        <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 p-3">
          <p className="text-sm mb-2">{suggestion}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={acceptSuggestion}
              className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={dismissSuggestion}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 inline mr-1" />
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
