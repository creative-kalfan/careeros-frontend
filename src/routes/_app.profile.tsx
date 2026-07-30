import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";

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
        // First, ensure a profile row exists (auto-create)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (existingProfile) {
          setProfile(existingProfile);
          setFullName(existingProfile.full_name || "");
        } else {
          // Auto-create profile if missing (first login)
          const newProfile = {
            id: user.id,
            email: user.email,
            full_name: user.name || null,
            avatar_url: user.avatar || null,
            role: "user",
          };

          const { data: createdProfile } = await supabase
            .from("profiles")
            .upsert(newProfile)
            .select()
            .single();

          if (createdProfile) {
            setProfile(createdProfile);
            setFullName(createdProfile.full_name || "");
          }
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
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          role: "user",
        });

      if (error) throw error;
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {saveMessage && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                saveMessage.includes("success")
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-destructive/50 bg-destructive/10 text-destructive"
              }`}
            >
              {saveMessage}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <input
              type="text"
              value={profile?.role || "user"}
              disabled
              className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
}