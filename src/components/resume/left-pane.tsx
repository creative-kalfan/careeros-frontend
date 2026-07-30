import { Sparkles, Gauge, Target, History, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumes } from "@/hooks/api/useResumes";

function PaneSection({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-in">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
  const size = 84;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="fill-none stroke-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="fill-none stroke-[url(#ring-grad)] transition-[stroke-dashoffset] duration-700"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(0.62 0.22 260)" />
            <stop offset="1" stopColor="oklch(0.68 0.20 305)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="text-xl font-semibold tracking-tight">{score}</div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">score</div>
        </div>
      </div>
    </div>
  );
}

export function LeftPane({ atsScore, currentId }: { atsScore: number; currentId: string }) {
  const { data: resumesData, isLoading: resumesLoading } = useResumes();
  const versions = resumesData?.resumes ?? [];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        <PaneSection icon={Gauge} title="ATS Score" action={<Badge variant="secondary" className="rounded-full text-[10px]">Live</Badge>}>
          <Card className="glass rounded-2xl border-border/60 p-4">
            <div className="flex items-center gap-4">
              <ScoreRing score={atsScore} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{atsScore >= 70 ? "Strong match" : "Needs improvement"}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Overall ATS compatibility</div>
                <div className="mt-3 space-y-2">
                  {[
                    { label: "Keywords", value: Math.min(100, atsScore + 5) },
                    { label: "Semantic", value: Math.max(0, atsScore - 10) },
                    { label: "Format", value: Math.min(100, atsScore + 8) },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{r.label}</span>
                        <span className="font-mono">{r.value}%</span>
                      </div>
                      <Progress value={r.value} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </PaneSection>

        <PaneSection icon={Sparkles} title="AI Suggestions" action={<Badge variant="secondary" className="rounded-full text-[10px]">0</Badge>}>
          <Card className="glass rounded-2xl border-border/60 p-4 text-center">
            <div className="text-xs text-muted-foreground">
              Upload and parse your resume to get AI-powered suggestions.
            </div>
          </Card>
        </PaneSection>

        <PaneSection icon={Target} title="Missing Keywords">
          <Card className="glass rounded-2xl border-border/60 p-4 text-center">
            <div className="text-xs text-muted-foreground">
              Compare your resume against a job description to find missing keywords.
            </div>
          </Card>
        </PaneSection>

        <PaneSection icon={AlertCircle} title="Job Match">
          <Card className="glass rounded-2xl border-border/60 p-4 text-center">
            <div className="text-xs text-muted-foreground">
              Run a match analysis against a specific job to see your fit score.
            </div>
            <Button variant="outline" size="sm" className="mt-3 h-8 w-full rounded-lg text-xs">
              Compare against role
            </Button>
          </Card>
        </PaneSection>

        <PaneSection icon={History} title="Resume Versions">
          {resumesLoading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <Card className="glass rounded-2xl border-border/60 p-4 text-center">
              <div className="text-xs text-muted-foreground">No versions yet.</div>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {versions.map((r) => {
                const active = r.id === currentId;
                return (
                  <button
                    key={r.id}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/60 bg-surface-elevated/40 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">{r.name}</div>
                        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{r.updatedAt}</div>
                      </div>
                      <span className="shrink-0 rounded-md bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">
                        {r.atsScore}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </PaneSection>
      </div>
    </ScrollArea>
  );
}