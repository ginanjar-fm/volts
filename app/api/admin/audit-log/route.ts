import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.systemRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.max(1, Math.min(200, Number(searchParams.get("limit") ?? 50)));
  const offset = (page - 1) * limit;

  const [entries, totalResult] = await Promise.all([
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        targetType: auditLogs.targetType,
        targetId: auditLogs.targetId,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
        actorId: auditLogs.actorId,
        actorName: users.name,
        actorEmail: users.email,
      })
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.actorId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(auditLogs),
  ]);

  return NextResponse.json({
    entries,
    total: totalResult[0].total,
    page,
    limit,
  });
}
