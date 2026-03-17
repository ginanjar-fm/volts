"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Org {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  subscriptionStatus: string | null;
  createdAt: string;
}

interface OrgsResponse {
  organizations: Org[];
  total: number;
  page: number;
  pageSize: number;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  canceled: "destructive",
  past_due: "destructive",
  incomplete: "outline",
};

function statusLabel(status: string | null): string {
  if (!status) return "free";
  return status.replace(/_/g, " ");
}

export function OrgsTable() {
  const [data, setData] = useState<OrgsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/organizations?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all organizations on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Organizations</CardTitle>
              <CardDescription>
                {data ? `${data.total} total organizations` : "Loading..."}
              </CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Members</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.organizations?.length ? (
                    data.organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          {org.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {org.slug}
                        </TableCell>
                        <TableCell className="text-center">
                          {org.memberCount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              statusVariant[org.subscriptionStatus ?? ""] ??
                              "outline"
                            }
                            className={
                              org.subscriptionStatus === "active"
                                ? "border-green-500/30 bg-green-500/10 text-green-400"
                                : undefined
                            }
                          >
                            {statusLabel(org.subscriptionStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No organizations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
