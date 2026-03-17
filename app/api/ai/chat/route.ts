import { convertToModelMessages, streamText, UIMessage } from "ai";
import { auth } from "@/lib/auth";
import { getModel } from "@/lib/ai/providers";
import { trackUsage } from "@/lib/ai/usage";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const maxDuration = 60;

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
    system: "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
    onFinish: async ({ usage }) => {
      await trackUsage({
        userId,
        provider: modelId?.startsWith("claude") ? "anthropic" : "openai",
        model: modelId || "gpt-4o-mini",
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        endpoint: "chat",
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
