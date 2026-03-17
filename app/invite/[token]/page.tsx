"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

interface InviteDetails {
  organization: { name: string; slug: string };
  email: string;
  role: string;
  expiresAt: string;
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvite() {
      const res = await fetch(`/api/invites/${token}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid invite");
      } else {
        setInvite(await res.json());
      }
      setLoading(false);
    }
    fetchInvite();
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    const res = await fetch(`/api/invites/${token}`, { method: "POST" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to accept invite");
    }
    setAccepting(false);
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold">Invite Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Go home
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold">
            Join {invite?.organization.name}
          </h1>
          <p className="text-muted-foreground">
            You need to sign in to accept this invite.
          </p>
          <Button onClick={() => router.push(`/auth/signin?callbackUrl=/invite/${token}`)}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-sm rounded-xl border p-8 text-center space-y-4">
        <h1 className="text-xl font-bold">
          Join {invite?.organization.name}
        </h1>
        <p className="text-muted-foreground">
          You&apos;ve been invited to join as a{" "}
          <strong className="text-foreground">{invite?.role}</strong>.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={accepting}>
            {accepting ? "Joining..." : "Accept invite"}
          </Button>
        </div>
      </div>
    </div>
  );
}
