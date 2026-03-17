import { and, between, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiUsage } from "@/lib/db/schema";

interface TrackUsageParams {
  userId: string;
  organizationId?: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  costCents?: number;
  endpoint?: string;
}

export async function trackUsage(params: TrackUsageParams) {
  const inputTokens = params.inputTokens ?? 0;
  const outputTokens = params.outputTokens ?? 0;

  const [record] = await db
    .insert(aiUsage)
    .values({
      userId: params.userId,
      organizationId: params.organizationId,
      provider: params.provider,
      model: params.model,
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens: inputTokens + outputTokens,
      costCents: params.costCents ?? 0,
      endpoint: params.endpoint,
    })
    .returning();

  return record;
}

interface GetUsageParams {
  userId: string;
  organizationId?: string;
  startDate: Date;
  endDate: Date;
}

export async function getUsageForPeriod(params: GetUsageParams) {
  const conditions = [
    eq(aiUsage.userId, params.userId),
    between(aiUsage.createdAt, params.startDate, params.endDate),
  ];

  if (params.organizationId) {
    conditions.push(eq(aiUsage.organizationId, params.organizationId));
  }

  const [result] = await db
    .select({
      totalPromptTokens: sql<number>`coalesce(sum(${aiUsage.promptTokens}), 0)`,
      totalCompletionTokens: sql<number>`coalesce(sum(${aiUsage.completionTokens}), 0)`,
      totalTokens: sql<number>`coalesce(sum(${aiUsage.totalTokens}), 0)`,
      totalCostCents: sql<number>`coalesce(sum(${aiUsage.costCents}), 0)`,
      requestCount: sql<number>`count(*)`,
    })
    .from(aiUsage)
    .where(and(...conditions));

  return result;
}
