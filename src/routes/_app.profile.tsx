import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { request } from "../utils/request";

import { PageHeader } from "@/components/app/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile · CareerOS" },
      {
        name: "description",
        content: "Manage your CareerOS profile.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;
      try {
        const res = await request<{ success: boolean; data: Profile }>({
          method: "GET",
          path: "/api/profile/me",
        });
        if (res?.success && res?.data) {
          setProfile(res.data);
          setFullName(res.data.full_name || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMessage("");

    try {
      const res = await request<{ success: boolean; data: Profile }>({
        method: "PATCH",
        path: "/api/profile/me",
        body: {
          full_name: fullName,
        },
      });

      if (!res?.success) throw new Error("Failed to update profile");
      setSaveMessage("Profile updated successfully");
    } catch (err: any) {
      setSaveMessage(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const loading = isLoading || profileLoading;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        eyebrow="Personal"
        title="Profile"
        description="Manage your personal information and preferences."
      />

      <Card className="glass rounded-xl border border-border/80 p-5 sm:p-6 shadow-xs">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {saveMessage && (
              <div
                className={`rounded-lg border px-3.5 py-2.5 text-xs ${
                  saveMessage.includes("success")
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {saveMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="h-9 rounded-lg border-border/60 bg-muted text-xs text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-medium text-foreground">
                Full name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="h-9 rounded-lg border-border/80 bg-surface-elevated text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Role</label>
              <Input
                type="text"
                value={profile?.role || "user"}
                disabled
                className="h-9 rounded-lg border-border/60 bg-muted text-xs text-muted-foreground"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                size="sm"
                className="rounded-lg text-xs font-medium shadow-xs"
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
