import type { PlanKey } from "@/lib/stripe";

const MONTHLY_LIMITS: Record<PlanKey, number> = {
  starter: 5000,
  pro: 50000,
  team: Infinity,
};

interface WindowEntry {
  count: number;
  resetAt: Date;
}

const windows = new Map<string, WindowEntry>();

function getMonthEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function getOrCreateWindow(userId: string): WindowEntry {
  const existing = windows.get(userId);
  const now = new Date();

  if (existing && existing.resetAt > now) {
    return existing;
  }

  const entry: WindowEntry = { count: 0, resetAt: getMonthEnd() };
  windows.set(userId, entry);
  return entry;
}

export function checkRateLimit(
  userId: string,
  tier: PlanKey,
): { allowed: boolean; remaining: number; resetAt: Date } {
  const limit = MONTHLY_LIMITS[tier];
  const window = getOrCreateWindow(userId);

  const remaining = Math.max(0, limit - window.count);
  const allowed = window.count < limit;

  if (allowed) {
    window.count++;
  }

  return { allowed, remaining: allowed ? remaining - 1 : 0, resetAt: window.resetAt };
}
