import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings · CareerOS" },
      { name: "description", content: "Account, appearance, integrations and workspace preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Personal"
      title="Settings"
      description="Account, appearance, integrations and workspace preferences."
      icon={Settings}
      panels={[{ title: "Account", hint: "Email, password and security." }, { title: "Appearance", hint: "Theme, density and typography." }, { title: "Integrations", hint: "Connect job boards, calendars and ATS platforms." }]}
    />
  );
}
