import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, organizationMembers } from "@/lib/db/schema";
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
    ? sql`(${users.name} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`
    : undefined;

  const [userRows, totalResult] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        systemRole: users.systemRole,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        membershipCount: count(organizationMembers.id),
      })
      .from(users)
      .leftJoin(organizationMembers, eq(users.id, organizationMembers.userId))
      .where(searchCondition)
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(users)
      .where(searchCondition),
  ]);

  return NextResponse.json({
    users: userRows,
    total: totalResult[0].total,
    page,
    limit,
  });
}
