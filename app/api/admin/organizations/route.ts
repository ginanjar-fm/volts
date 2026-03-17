import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  organizations,
  organizationMembers,
  subscriptions,
} from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.systemRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? 20)));
  const offset = (page - 1) * limit;

  const searchCondition = search
    ? sql`(${organizations.name} ILIKE ${`%${search}%`} OR ${organizations.slug} ILIKE ${`%${search}%`})`
    : undefined;

  const [orgRows, totalResult] = await Promise.all([
    db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        logo: organizations.logo,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        memberCount: count(organizationMembers.id),
        subscriptionStatus: subscriptions.status,
      })
      .from(organizations)
      .leftJoin(
        organizationMembers,
        eq(organizations.id, organizationMembers.organizationId),
      )
      .leftJoin(
        subscriptions,
        eq(organizations.id, subscriptions.organizationId),
      )
      .where(searchCondition)
      .groupBy(organizations.id, subscriptions.status)
      .orderBy(desc(organizations.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(organizations)
      .where(searchCondition),
  ]);

  return NextResponse.json({
    organizations: orgRows,
    total: totalResult[0].total,
    page,
    limit,
  });
}
