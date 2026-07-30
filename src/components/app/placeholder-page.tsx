import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "./page-header";
import { Card } from "@/components/ui/card";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  panels,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  panels: { title: string; hint: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />

      <Card className="glass overflow-hidden rounded-2xl border-border/60 p-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-6 sm:p-8">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
              Coming soon
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Module scaffolded</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              This surface is wired into the CareerOS shell. Feature UI and data will land here in a
              future iteration.
            </p>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary/20 to-accent/20 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {panels.map((p) => (
          <Card
            key={p.title}
            className="glass rounded-2xl border-border/60 p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="text-sm font-semibold">{p.title}</div>
            <p className="mt-1.5 text-sm text-muted-foreground">{p.hint}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
