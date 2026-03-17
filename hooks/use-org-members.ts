"use client";

import { useState, useEffect, useCallback } from "react";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export function useOrgMembers(orgId: string | null) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/organizations/${orgId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  const fetchInvites = useCallback(async () => {
    if (!orgId) return;
    const res = await fetch(`/api/organizations/${orgId}/invites`);
    if (!res.ok) return;
    const data: Invite[] = await res.json();
    setInvites(data);
  }, [orgId]);

  useEffect(() => {
    fetchMembers();
    fetchInvites();
  }, [fetchMembers, fetchInvites]);

  const inviteMember = useCallback(
    async (email: string, role: "admin" | "member" = "member") => {
      if (!orgId) return null;
      const res = await fetch(`/api/organizations/${orgId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) return null;
      const invite = await res.json();
      await fetchInvites();
      return invite;
    },
    [orgId, fetchInvites],
  );

  const removeMember = useCallback(
    async (userId: string) => {
      if (!orgId) return false;
      const res = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) return false;
      await fetchMembers();
      return true;
    },
    [orgId, fetchMembers],
  );

  const updateRole = useCallback(
    async (userId: string, role: "admin" | "member") => {
      if (!orgId) return false;
      const res = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) return false;
      await fetchMembers();
      return true;
    },
    [orgId, fetchMembers],
  );

  return {
    members,
    invites,
    isLoading,
    inviteMember,
    removeMember,
    updateRole,
    refreshMembers: fetchMembers,
    refreshInvites: fetchInvites,
  };
}
