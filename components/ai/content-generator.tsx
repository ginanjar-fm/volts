"use client";

import { useAICompletion } from "@/hooks/use-ai-completion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  { id: "claude-haiku-3.5", label: "Claude Haiku 3.5" },
];

export function ContentGenerator() {
  const [model, setModel] = useState("gpt-4o-mini");
  const [prompt, setPrompt] = useState("");
  const [system, setSystem] = useState("");
  const [showSystem, setShowSystem] = useState(false);
  const [copied, setCopied] = useState(false);
  const { text, isLoading, error, complete } = useAICompletion({ model });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await complete(prompt, system || undefined);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-background p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Content Generator
        </h3>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => setShowSystem(!showSystem)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        System prompt
        {showSystem ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {showSystem && (
        <textarea
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          placeholder="Optional system instructions..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring min-h-[60px] resize-y"
        />
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to generate..."
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y"
      />

      <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
        ) : (
          <><Sparkles className="mr-2 h-4 w-4" /> Generate</>
        )}
      </Button>

      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}

      {text && (
        <div className="relative rounded-md border bg-muted p-4">
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-2 top-2 rounded-md p-1.5 hover:bg-background"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <p className="pr-10 text-sm whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  );
}
