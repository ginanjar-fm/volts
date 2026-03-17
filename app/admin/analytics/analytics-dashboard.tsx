"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  UserPlus,
  CreditCard,
  Cpu,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface AnalyticsData {
  totalUsers: number;
  totalOrgs: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  totalAiTokens: number;
  estimatedRevenue: number;
  auditLog: {
    id: string;
    action: string;
    actor: string;
    target: string;
    createdAt: string;
  }[];
}

const statCards = [
  {
    key: "totalUsers" as const,
    label: "Total Users",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "totalOrgs" as const,
    label: "Total Organizations",
    icon: Building2,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    key: "newUsersThisMonth" as const,
    label: "New This Month",
    icon: UserPlus,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    key: "activeSubscriptions" as const,
    label: "Active Subscriptions",
    icon: CreditCard,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    key: "totalAiTokens" as const,
    label: "Total AI Tokens Used",
    icon: Cpu,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    format: "compact",
  },
  {
    key: "estimatedRevenue" as const,
    label: "Estimated Revenue",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    format: "currency",
  },
];

function formatValue(value: number, format?: string): string {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  }
  if (format === "compact") {
    return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
  }
  return value.toLocaleString();
}

const actionColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "user.created": "default",
  "user.updated": "secondary",
  "user.disabled": "destructive",
  "org.created": "default",
  "role.changed": "outline",
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/analytics?detailed=true");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Detailed platform metrics and audit trail.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium">
                {stat.label}
              </CardDescription>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-3xl font-bold">
                  {data?.[stat.key] != null
                    ? formatValue(data[stat.key], stat.format)
                    : "—"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Recent admin actions and system events.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.auditLog?.length ? (
                  data.auditLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge
                          variant={actionColors[entry.action] ?? "secondary"}
                          className="font-mono text-xs"
                        >
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.actor}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.target}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No audit events recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
