"use client";

import { useEffect, useState } from "react";
import { Users, Building2, UserPlus, CreditCard } from "lucide-react";
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

interface AnalyticsData {
  totalUsers: number;
  totalOrgs: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  recentSignups: {
    id: string;
    name: string;
    email: string;
    systemRole: string;
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
];

export function AdminOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silently fail, data stays null
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          System-wide metrics and recent activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  {data?.[stat.key]?.toLocaleString() ?? "—"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>Last 5 users who joined the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recentSignups?.length ? (
                  data.recentSignups.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.systemRole === "admin"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {user.systemRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No recent signups.
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
