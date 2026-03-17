"use client";

import Link from "next/link";
import { Zap, Settings, CreditCard, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { OrgSwitcher } from "@/components/org-switcher";
import { useUser } from "@/hooks/use-user";

export function DashboardNav() {
  const { user } = useUser();

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="text-lg font-bold tracking-tight">Volts</span>
          </Link>
          <OrgSwitcher />
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/members"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </Link>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <ThemeToggle />
          {user && (
            <span className="ml-2 text-xs text-muted-foreground">
              {user.name || user.email}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
