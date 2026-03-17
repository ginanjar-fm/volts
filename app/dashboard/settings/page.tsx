"use client";

import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function OrgSettingsPage() {
  const { currentOrg, refreshOrgs } = useOrganization();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  // Sync form with current org
  const orgName = name || currentOrg?.name || "";
  const orgSlug = slug || currentOrg?.slug || "";

  if (!currentOrg) {
    return (
      <div className="text-center text-muted-foreground py-16">
        No organization selected. Create one first.
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/organizations/${currentOrg!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || undefined,
        slug: slug || undefined,
      }),
    });
    if (res.ok) {
      toast.success("Organization updated");
      await refreshOrgs();
      setName("");
      setSlug("");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (confirmDelete !== currentOrg!.name) return;
    setDeleting(true);
    const res = await fetch(`/api/organizations/${currentOrg!.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Organization deleted");
      window.location.href = "/dashboard";
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete");
    }
    setDeleting(false);
  }

  const isOwner = currentOrg.role === "owner";

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Organization Settings
      </h1>

      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">General</h2>
        <div className="space-y-2">
          <Label htmlFor="org-name">Name</Label>
          <Input
            id="org-name"
            value={orgName}
            onChange={(e) => setName(e.target.value)}
            disabled={!isOwner && currentOrg.role !== "admin"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-slug">Slug</Label>
          <Input
            id="org-slug"
            value={orgSlug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={!isOwner && currentOrg.role !== "admin"}
          />
        </div>
        {(isOwner || currentOrg.role === "admin") && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        )}
      </div>

      {isOwner && (
        <div className="rounded-xl border border-destructive/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-destructive">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            Deleting an organization is permanent and cannot be undone. All
            members will lose access.
          </p>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <strong>{currentOrg.name}</strong> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              placeholder={currentOrg.name}
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || confirmDelete !== currentOrg.name}
          >
            {deleting ? "Deleting..." : "Delete organization"}
          </Button>
        </div>
      )}
    </div>
  );
}
