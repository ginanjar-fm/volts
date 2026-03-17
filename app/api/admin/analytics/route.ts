import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  organizations,
  subscriptions,
  aiUsage,
} from "@/lib/db/schema";
import { eq, count, sql, gte, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.systemRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalUsersResult,
    totalOrgsResult,
    newUsersResult,
    newOrgsResult,
    activeSubsResult,
    revenueResult,
    recentSignups,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(organizations),
    db
      .select({ total: count() })
      .from(users)
      .where(gte(users.createdAt, startOfMonth)),
    db
      .select({ total: count() })
      .from(organizations)
      .where(gte(organizations.createdAt, startOfMonth)),
    db
      .select({ total: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active")),
    db
      .select({
        total: sql<number>`coalesce(sum(${aiUsage.costCents}), 0)::int`,
      })
      .from(aiUsage),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5),
  ]);

  return NextResponse.json({
    totalUsers: totalUsersResult[0].total,
    totalOrganizations: totalOrgsResult[0].total,
    newUsersThisMonth: newUsersResult[0].total,
    newOrgsThisMonth: newOrgsResult[0].total,
    activeSubscriptions: activeSubsResult[0].total,
    totalRevenueCents: revenueResult[0].total,
    recentSignups,
  });
}
