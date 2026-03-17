"use client";

import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useOrgMembers } from "@/hooks/use-org-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, Shield, User, Crown } from "lucide-react";
import { toast } from "sonner";

function RoleIcon({ role }: { role: string }) {
  if (role === "owner") return <Crown className="h-3.5 w-3.5 text-amber-500" />;
  if (role === "admin") return <Shield className="h-3.5 w-3.5 text-cyan-500" />;
  return <User className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function MembersPage() {
  const { currentOrg } = useOrganization();
  const { members, invites, inviteMember, removeMember, updateRole } =
    useOrgMembers(currentOrg?.id ?? null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [sending, setSending] = useState(false);

  if (!currentOrg) {
    return (
      <div className="text-center text-muted-foreground py-16">
        No organization selected.
      </div>
    );
  }

  const canManage = currentOrg.role === "owner" || currentOrg.role === "admin";

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setSending(true);
    const invite = await inviteMember(inviteEmail.trim(), inviteRole);
    if (invite) {
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvite(false);
    } else {
      toast.error("Failed to send invite");
    }
    setSending(false);
  }

  async function handleRemove(userId: string, userName: string) {
    const ok = await removeMember(userId);
    if (ok) toast.success(`Removed ${userName}`);
    else toast.error("Failed to remove member");
  }

  async function handleRoleChange(userId: string, role: "admin" | "member") {
    const ok = await updateRole(userId, role);
    if (ok) toast.success("Role updated");
    else toast.error("Failed to update role");
  }

  const pendingInvites = invites.filter((i) => !i.acceptedAt);

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        {canManage && (
          <Button onClick={() => setShowInvite(true)} size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite member
          </Button>
        )}
      </div>

      <div className="rounded-xl border divide-y">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {(member.user.name?.[0] || member.user.email[0]).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium">
                  {member.user.name || member.user.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {member.user.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                <RoleIcon role={member.role} />
                {member.role}
              </span>

              {canManage && member.role !== "owner" && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-lg p-1 hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role !== "admin" && (
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.userId, "admin")}
                      >
                        Make admin
                      </DropdownMenuItem>
                    )}
                    {member.role !== "member" && (
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.userId, "member")}
                      >
                        Make member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        handleRemove(
                          member.userId,
                          member.user.name || member.user.email,
                        )
                      }
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>

      {pendingInvites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending Invites</h2>
          <div className="rounded-xl border divide-y">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <div className="text-sm">{invite.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {invite.role} &middot; Expires{" "}
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              Send an invite to join {currentOrg.name}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInvite();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inviteRole === "member" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInviteRole("member")}
                >
                  Member
                </Button>
                <Button
                  type="button"
                  variant={inviteRole === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInviteRole("admin")}
                >
                  Admin
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInvite(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sending || !inviteEmail.trim()}>
                {sending ? "Sending..." : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
