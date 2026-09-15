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

      <Card className="rounded-lg border-2 border-border bg-card p-5 sm:p-6 shadow-brutal-sm">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded border-2 border-border/40" />
            <Skeleton className="h-10 w-full rounded border-2 border-border/40" />
            <Skeleton className="h-10 w-full rounded border-2 border-border/40" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {saveMessage && (
              <div
                className={`rounded border-2 px-3.5 py-2 text-xs font-mono font-bold uppercase ${
                  saveMessage.includes("success")
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                }`}
              >
                {saveMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-muted-foreground uppercase">Email (Primary Credential)</label>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="h-10 rounded border-2 border-border/60 bg-muted/60 text-xs font-mono text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-mono font-medium text-foreground uppercase">
                Full name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="h-10 rounded border-2 border-border bg-background text-xs sm:text-sm font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-muted-foreground uppercase">System Role</label>
              <Input
                type="text"
                value={profile?.role || "user"}
                disabled
                className="h-10 rounded border-2 border-border/60 bg-muted/60 text-xs font-mono uppercase text-muted-foreground"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                size="sm"
                className="rounded border-2 border-primary shadow-brutal-primary font-mono text-xs uppercase tracking-wider"
              >
                {saving ? "Saving Telemetry..." : "Save Profile"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
