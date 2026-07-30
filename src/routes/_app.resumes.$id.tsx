import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MoreHorizontal, Save, Send, PanelLeft, PanelRight, Command as CmdIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LeftPane } from "@/components/resume/left-pane";
import { EditorPane } from "@/components/resume/editor-pane";
import { PreviewPane } from "@/components/resume/preview-pane";
import { useResume, useUpdateResume } from "@/hooks/api/useResumes";
import { getErrorMessage } from "@/utils/api-error";

export const Route = createFileRoute("/_app/resumes/$id")({
  head: () => ({
    meta: [
      { title: "Resume Builder · CareerOS" },
      { name: "description", content: "Three-pane resume workspace with AI suggestions, live ATS score and PDF-ready preview." },
    ],
  }),
  component: ResumeWorkspace,
});

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

function ResumeWorkspace() {
  const { id } = Route.useParams();
  const { data: resume, isLoading, isError, error } = useResume(id);
  const updateMutation = useUpdateResume();
  const isDesktop = useMediaQuery("(min-width: 1100px)");
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        if (resume) {
          updateMutation.mutate({ id, title: resume.name, content: resume as unknown as Record<string, unknown> });
          toast.success("Draft saved", { description: "Your resume is up to date." });
        }
      } else if (k === "\\") {
        e.preventDefault();
        setShowLeft((v) => !v);
      } else if (k === "/") {
        e.preventDefault();
        setShowRight((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.id]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-56px)] flex-col">
        <div className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 sm:px-5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid min-h-0 flex-1 place-items-center p-10">
          <div className="text-sm text-muted-foreground">Loading resume…</div>
        </div>
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="flex h-[calc(100dvh-56px)] flex-col">
        <div className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 sm:px-5">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
            <Link to="/resumes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid min-h-0 flex-1 place-items-center p-10 text-center">
          <div className="max-w-[320px]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-destructive/25 to-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="mt-4 text-sm font-semibold">Couldn't load resume</div>
            <div className="mt-1 text-xs text-muted-foreground">{getErrorMessage(error)}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-lg text-xs"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col">
      <WorkspaceHeader
        resumeName={resume.name}
        target={resume.targetRole}
        updated={resume.updatedAt}
        atsScore={resume.atsScore}
        showLeft={showLeft}
        showRight={showRight}
        onToggleLeft={() => setShowLeft((v) => !v)}
        onToggleRight={() => setShowRight((v) => !v)}
        isDesktop={isDesktop}
        onSave={() => {
          updateMutation.mutate({ id, title: resume.name, content: resume as unknown as Record<string, unknown> });
          toast.success("Draft saved", { description: "Your resume is up to date." });
        }}
        isSaving={updateMutation.isPending}
      />

      {isDesktop ? (
        <div
          className="grid min-h-0 flex-1"
          style={{
            gridTemplateColumns: `${showLeft ? "minmax(280px, 340px)" : "0px"} minmax(0, 1fr) ${
              showRight ? "minmax(360px, 440px)" : "0px"
            }`,
          }}
        >
          {showLeft ? (
            <div className="min-h-0 min-w-0 animate-fade-in overflow-hidden border-r border-border/60 bg-sidebar/40">
              <LeftPane atsScore={resume.atsScore} currentId={resume.id} />
            </div>
          ) : (
            <div />
          )}

          <div className="min-h-0 min-w-0 overflow-hidden bg-background/40">
            <EditorPane resume={resume} />
          </div>

          {showRight ? (
            <div className="min-h-0 min-w-0 animate-fade-in overflow-hidden border-l border-border/60 bg-sidebar/30">
              <PreviewPane resume={resume} />
            </div>
          ) : (
            <div />
          )}
        </div>
      ) : (
        <Tabs defaultValue="editor" className="flex flex-1 flex-col">
          <TabsList className="mx-3 mt-2 grid w-[calc(100%-1.5rem)] grid-cols-3 rounded-xl bg-surface-elevated/60">
            <TabsTrigger value="ai" className="rounded-lg text-xs">AI & ATS</TabsTrigger>
            <TabsTrigger value="editor" className="rounded-lg text-xs">Editor</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-lg text-xs">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="mt-2 flex-1 overflow-hidden">
            <LeftPane atsScore={resume.atsScore} currentId={resume.id} />
          </TabsContent>
          <TabsContent value="editor" className="mt-2 flex-1 overflow-hidden">
            <EditorPane resume={resume} />
          </TabsContent>
          <TabsContent value="preview" className="mt-2 flex-1 overflow-hidden">
            <PreviewPane resume={resume} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function WorkspaceHeader({
  resumeName,
  target,
  updated,
  atsScore,
  showLeft,
  showRight,
  onToggleLeft,
  onToggleRight,
  isDesktop,
  onSave,
  isSaving,
}: {
  resumeName: string;
  target: string;
  updated: string;
  atsScore: number;
  showLeft: boolean;
  showRight: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  isDesktop: boolean;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-background/60 px-3 py-2.5 backdrop-blur sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg" aria-label="Back to resumes">
          <Link to="/resumes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold">{resumeName}</h1>
            <Badge variant="secondary" className="hidden shrink-0 rounded-full text-[10px] sm:inline-flex">
              {target || "No target"}
            </Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            Autosaved · {updated}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="mr-2 hidden items-center gap-1.5 rounded-lg border border-border/60 bg-surface-elevated/40 px-2 py-1 sm:flex">
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">ATS</span>
          <span className="font-mono text-xs font-semibold">{atsScore}</span>
        </div>
        {isDesktop && (
          <>
            <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${showLeft ? "text-primary" : ""}`} onClick={onToggleLeft} aria-label="Toggle left pane">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${showRight ? "text-primary" : ""}`} onClick={onToggleRight} aria-label="Toggle right pane">
              <PanelRight className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="More">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={onSave} disabled={isSaving}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isSaving ? "Saving…" : "Save"}</span>
          <kbd className="ml-1.5 hidden rounded-md border border-border/60 bg-background/70 px-1 py-px font-mono text-[9px] text-muted-foreground sm:inline-flex items-center gap-0.5">
            <CmdIcon className="h-2.5 w-2.5" />S
          </kbd>
        </Button>
        <Button size="sm" className="h-8 rounded-lg text-xs shadow-[var(--shadow-glow)]">
          <Send className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden sm:inline">Apply</span>
        </Button>
      </div>
    </div>
  );
}