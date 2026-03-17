import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function logAuditEvent(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    actorId: params.actorId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
  });
}
