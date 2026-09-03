import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Download,
  PanelLeftClose,
  PanelRightClose,
  RefreshCw,
  BarChart3,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/app/page-header";
import { LeftPane } from "@/components/ats/left-pane";
import { CenterPane } from "@/components/ats/center-pane";
import { RightPane } from "@/components/ats/right-pane";
import { useResumes } from "@/hooks/api";
import { useAnalyzeResume } from "@/hooks/api/useATS";

export const Route = createFileRoute("/_app/ats")({
  head: () => ({
    meta: [
      { title: "ATS Studio · CareerOS" },
      {
        name: "description",
        content: "Continuous, dual-engine scoring with keyword and semantic diagnostics.",
      },
    ],
  }),
  component: ATSPage,
});

function useMediaQuery(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(q);
    setM(mql.matches);
    const l = (e: MediaQueryListEvent) => setM(e.matches);
    mql.addEventListener("change", l);
    return () => mql.removeEventListener("change", l);
  }, [q]);
  return m;
}

function ATSPage() {
  const [activeSection, setActiveSection] = useState("analytics");
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isXL = useMediaQuery("(min-width: 1280px)");

  const { data: resumes } = useResumes();
  const currentResumeId = resumes?.resumes?.[0]?.id ?? null;
  const analyzeMutation = useAnalyzeResume();

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRescore = async () => {
    if (!currentResumeId) return;
    await analyzeMutation.mutateAsync({
      resumeId: currentResumeId,
      jobDescription: jobDescription || "General ATS optimization",
      persist: true,
    });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-border/60 px-4 py-4 md:px-6">
        <PageHeader
          eyebrow="Workspace"
          title="ATS Studio"
          description="Continuous, dual-engine scoring with keyword and semantic diagnostics."
          actions={
            <>
              {isDesktop && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLeft((v) => !v)}
                    className="h-8 gap-1.5 rounded-lg text-xs"
                    title="Toggle left pane"
                  >
                    <PanelLeftClose className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Overview</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRight((v) => !v)}
                    className="h-8 gap-1.5 rounded-lg text-xs"
                    title="Toggle right pane"
                  >
                    <PanelRightClose className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Recommendations</span>
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg text-xs"
                onClick={handleRescore}
                disabled={!currentResumeId || analyzeMutation.isPending}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${analyzeMutation.isPending ? "animate-spin" : ""}`}
                />
                {analyzeMutation.isPending ? "Scoring..." : "Rescore"}
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-xs text-primary-foreground shadow-xs"
              >
                <Download className="h-3.5 w-3.5" /> Export report
              </Button>
            </>
          }
        />
      </div>

      {isDesktop ? (
        <div
          className="grid min-h-0 flex-1"
          style={{
            gridTemplateColumns: [
              showLeft ? "minmax(280px, 320px)" : "0px",
              "minmax(0, 1fr)",
              showRight && isXL
                ? "minmax(320px, 380px)"
                : showRight
                  ? "minmax(300px, 340px)"
                  : "0px",
            ].join(" "),
          }}
        >
          {showLeft && (
            <aside className="min-h-0 border-r border-border/60 bg-sidebar/40">
              <LeftPane activeSection={activeSection} onSectionChange={handleSectionChange} />
            </aside>
          )}
          <main className="min-h-0 overflow-y-auto bg-app">
            <CenterPane activeSection={activeSection} />
          </main>
          {showRight && (
            <aside className="min-h-0 border-l border-border/60 bg-sidebar/40">
              <RightPane />
            </aside>
          )}
        </div>
      ) : (
        <Tabs defaultValue="analytics" className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border/60 px-2 py-2">
            <TabsList className="grid w-full grid-cols-3 rounded-lg">
              <TabsTrigger value="overview" className="gap-1.5 text-xs">
                <Layers className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5 text-xs">
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" /> AI
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-0 min-h-0 flex-1 overflow-hidden">
            <LeftPane activeSection={activeSection} onSectionChange={handleSectionChange} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0 min-h-0 flex-1 overflow-y-auto bg-app">
            <CenterPane activeSection={activeSection} />
          </TabsContent>
          <TabsContent value="ai" className="mt-0 min-h-0 flex-1 overflow-hidden">
            <RightPane />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
