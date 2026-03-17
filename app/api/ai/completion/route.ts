import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { getModel } from "@/lib/ai/providers";
import { trackUsage } from "@/lib/ai/usage";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const {
    prompt,
    model: modelId,
    system,
  }: { prompt: string; model?: string; system?: string } = await req.json();

  const rateCheck = checkRateLimit(userId, "starter");
  if (!rateCheck.allowed) {
    return Response.json(
      { error: "Rate limit exceeded", resetAt: rateCheck.resetAt },
      { status: 429 },
    );
  }

  const model = getModel(modelId);
  const result = await generateText({ model, system, prompt });

  await trackUsage({
    userId,
    provider: modelId?.startsWith("claude") ? "anthropic" : "openai",
    model: modelId || "gpt-4o-mini",
    inputTokens: result.usage.inputTokens ?? 0,
    outputTokens: result.usage.outputTokens ?? 0,
    endpoint: "completion",
  });

  return Response.json({ text: result.text });
}
