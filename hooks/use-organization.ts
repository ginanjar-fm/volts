"use client";

import { useState, useEffect, useCallback } from "react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export function useOrganization() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) return;
      const orgs: Organization[] = await res.json();
      setOrganizations(orgs);
      if (orgs.length > 0 && !currentOrg) {
        setCurrentOrg(orgs[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const switchOrg = useCallback(
    async (orgId: string) => {
      const res = await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });
      if (!res.ok) return false;

      const org = organizations.find((o) => o.id === orgId);
      if (org) setCurrentOrg(org);
      return true;
    },
    [organizations],
  );

  const createOrg = useCallback(
    async (name: string) => {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return null;

      const newOrg = await res.json();
      await fetchOrgs();
      return newOrg;
    },
    [fetchOrgs],
  );

  return {
    organizations,
    currentOrg,
    isLoading,
    switchOrg,
    createOrg,
    refreshOrgs: fetchOrgs,
  };
}
