"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Users,
  Building2,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <Shield className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-lg font-bold tracking-tight">Admin</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to App</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
