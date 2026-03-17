import {
  convertToModelMessages,
  streamText,
  tool,
  UIMessage,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getModel } from "@/lib/ai/providers";
import { trackUsage } from "@/lib/ai/usage";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const maxDuration = 60;

const exampleTools = {
  getWeather: tool({
    description: "Get the current weather for a location",
    inputSchema: z.object({
      city: z.string().describe("City name"),
      unit: z.enum(["C", "F"]).default("C").describe("Temperature unit"),
    }),
    execute: async ({ city, unit }) => {
      return { city, temperature: 22, unit, condition: "Sunny" };
    },
  }),
  calculate: tool({
    description: "Perform a mathematical calculation",
    inputSchema: z.object({
      expression: z.string().describe("Math expression to evaluate"),
    }),
    execute: async ({ expression }) => {
      try {
        const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
        const result = Function(`"use strict"; return (${sanitized})`)();
        return { expression, result: Number(result) };
      } catch {
        return { expression, error: "Invalid expression" };
      }
    },
  }),
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const {
    messages,
    model: modelId,
  }: { messages: UIMessage[]; model?: string } = await req.json();

  const rateCheck = checkRateLimit(userId, "starter");
  if (!rateCheck.allowed) {
    return Response.json(
      { error: "Rate limit exceeded", resetAt: rateCheck.resetAt },
      { status: 429 },
    );
  }

  const model = getModel(modelId);

  const result = streamText({
    model,
    system:
      "You are a helpful assistant with access to tools. Use them when appropriate.",
    messages: await convertToModelMessages(messages),
    tools: exampleTools,
    stopWhen: stepCountIs(5),
    onFinish: async ({ usage }) => {
      await trackUsage({
        userId,
        provider: modelId?.startsWith("claude") ? "anthropic" : "openai",
        model: modelId || "gpt-4o-mini",
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        endpoint: "tool-call",
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
