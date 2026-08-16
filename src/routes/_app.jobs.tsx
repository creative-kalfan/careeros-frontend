import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { List, FileText, Sparkles, PanelLeftClose, PanelRightClose, AlertTriangle, WifiOff, Lock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { FiltersPane } from "@/components/jobs/filters-pane";
import { JobList } from "@/components/jobs/job-list";
import { JobDetails, JobDetailsEmpty } from "@/components/jobs/job-details";
import { AIInsights } from "@/components/jobs/ai-insights";
import { JobSearch } from "@/components/jobs/job-search";
import { Button } from "@/components/ui/button";
import { usePersonalizedJobs, jobsQueryKeys } from "@/hooks/api/useJobs";
import { useSaveJob } from "@/hooks/api/useSaveJob";
import { useMatchJobs } from "@/hooks/api/useMatchJobs";
import { buildSearchFilters } from "@/lib/jobs";
import { getErrorMessage } from "@/utils/api-error";
import type { Job, JobSearchFilters } from "@/types/jobs";

export const Route = createFileRoute("/_app/jobs")({
  head: () => ({
    meta: [
      { title: "Job Intelligence · CareerOS" },
      {
        name: "description",
        content:
          "AI-powered job workspace: smart filters, deep role briefs and instant fit analysis against your resume.",
      },
    ],
  }),
  component: JobsPage,
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

const PAGE_SIZE = 20;

function JobsPage() {
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  // The personalized endpoint always sorts by match score — no sort param is supported.
  const sort: JobSearchFilters["sort"] = "best-match";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showInsights, setShowInsights] = useState(true);
  const [mobileTab, setMobileTab] = useState<"list" | "details" | "insights">("list");

  // Debounce search input to avoid a network request per keystroke.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleQueryChange(v: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setQuery(v);
      setPage(1);
      setSelectedId(null);
    }, 300);
  }
  function handleLocationChange(v: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setLocation(v);
      setPage(1);
      setSelectedId(null);
    }, 300);
  }
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const isXL = useMediaQuery("(min-width: 1280px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const filters: JobSearchFilters = useMemo(
    () => buildSearchFilters({ query, location, sort, page, pageSize: PAGE_SIZE }),
    [query, location, sort, page],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = usePersonalizedJobs({ ...filters, includeAts: true });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Prefetch the next page when there is more data.
  useEffect(() => {
    if (!data?.hasNext) return;
    const nextFilters = { ...filters, page: page + 1, includeAts: true };
    queryClient.prefetchQuery({
      queryKey: jobsQueryKeys.personalized(nextFilters),
      queryFn: () => import("@/api/jobs").then((m) => m.jobsApi.getPersonalizedJobs(nextFilters)),
    });
  }, [data?.hasNext, filters, page, queryClient]);

  const selected = useMemo(
    () => jobs.find((j) => j.id === selectedId) ?? jobs[0] ?? null,
    [jobs, selectedId],
  );

  // Keep a valid selection as the list changes.
  useEffect(() => {
    if (!selected && jobs.length > 0) {
      setSelectedId(jobs[0].id);
    }
  }, [selected, jobs]);

  const { saveJob, unsaveJob } = useSaveJob();
  const { matchJobAsync, isMatching, matchResult } = useMatchJobs();

  function toggleBookmark(id: string) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    if (job.bookmarked) unsaveJob(id);
    else saveJob(id);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (!selected) return;
      const idx = jobs.findIndex((j) => j.id === selected.id);
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const n = jobs[Math.min(jobs.length - 1, idx + 1)];
        if (n) setSelectedId(n.id);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const n = jobs[Math.max(0, idx - 1)];
        if (n) setSelectedId(n.id);
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleBookmark(selected.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, jobs]);

  function handleSelect(id: string) {
    setSelectedId(id);
    if (!isDesktop) setMobileTab("details");
  }


  // Sorting is not supported by the personalized endpoint — it always returns
  // jobs sorted by match score. The sort button is removed to avoid pretending
  // that "newest"/"oldest" sorting works.

  const gridCols = isXL
    ? `${showFilters ? "260px" : "0px"} minmax(340px, 400px) minmax(0, 1fr) ${
        showInsights ? "360px" : "0px"
      }`
    : `minmax(320px, 380px) minmax(0, 1fr)`;

  const loading = isLoading;
  const showError = isError;

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-background/60 px-3 py-2.5 backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Intelligence
            </div>
            <h1 className="truncate text-sm font-semibold">Job Intelligence</h1>
          </div>
          <div className="hidden min-w-0 flex-1 sm:block">
            <JobSearch value={query} onChange={handleQueryChange} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isFetching && !isLoading && (
            <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-primary" aria-label="Loading" />
          )}
          {isXL && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-lg ${showFilters ? "text-primary" : ""}`}
                onClick={() => setShowFilters((v) => !v)}
                aria-label="Toggle filters"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-lg ${showInsights ? "text-primary" : ""}`}
                onClick={() => setShowInsights((v) => !v)}
                aria-label="Toggle insights"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="border-b border-border/60 px-3 py-2 sm:hidden">
        <JobSearch value={query} onChange={handleQueryChange} />
      </div>

      {showError ? (
        <ErrorState error={error} />
      ) : (
        <div className={isDesktop ? "grid min-h-0 flex-1" : "flex min-h-0 flex-1 flex-col"} style={isDesktop ? { gridTemplateColumns: gridCols } : undefined}>
          {isDesktop && isXL && showFilters && (
            <div className="min-h-0 animate-fade-in border-r border-border/60 bg-sidebar/40">
              <FiltersPane onApply={(filters) => {
                const nextRole = filters.role?.[0] ?? "";
                const nextLocation = filters.location?.[0] ?? "";
                if (nextRole) handleQueryChange(nextRole);
                if (nextLocation) handleLocationChange(nextLocation);
              }} />
            </div>
          )}
          {isDesktop && isXL && !showFilters && <div />}

          <div className="min-h-0 min-w-0 border-r border-border/60 bg-background/40">
            <JobList
              jobs={jobs}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
              loading={loading}
              onToggleBookmark={toggleBookmark}
              query={query}
            />
            {!loading && totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            )}
          </div>

          <div className="min-h-0 min-w-0 bg-background/20">
            {selected ? (
              <JobDetails job={selected} onToggleBookmark={() => toggleBookmark(selected.id)} />
            ) : (
              !loading && <JobDetailsEmpty />
            )}
          </div>

          {isDesktop && isXL && showInsights && selected && (
            <div className="min-h-0 animate-fade-in border-l border-border/60 bg-sidebar/30">
              <AIInsights
                job={selected}
                matchResult={matchResult}
                isMatching={isMatching}
                onRunMatch={() =>
                  matchJobAsync({
                    resumeText: "",
                    job: { title: selected.role, companyName: selected.company },
                  })
                }
              />
            </div>
          )}
          {isDesktop && isXL && !showInsights && <div />}
        </div>
      )}

      {!isDesktop && !showError && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">
            {mobileTab === "list" && (
              <JobList
                jobs={jobs}
                selectedId={selected?.id ?? null}
                onSelect={handleSelect}
                loading={loading}
                onToggleBookmark={toggleBookmark}
                query={query}
              />
            )}
            {mobileTab === "details" && selected && (
              <JobDetails job={selected} onToggleBookmark={() => toggleBookmark(selected.id)} />
            )}
            {mobileTab === "details" && !selected && !loading && <JobDetailsEmpty />}
            {mobileTab === "insights" && selected && (
              <AIInsights
                job={selected}
                matchResult={matchResult}
                isMatching={isMatching}
                onRunMatch={() =>
                  matchJobAsync({
                    resumeText: "",
                    job: { title: selected.role, companyName: selected.company },
                  })
                }
              />
            )}
            {mobileTab === "insights" && !selected && <JobDetailsEmpty />}
          </div>

          {!loading && totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          )}

          <nav className="glass-topbar grid grid-cols-3 border-t border-border/60">
            {[
              { id: "list" as const, label: "Jobs", icon: List },
              { id: "details" as const, label: "Details", icon: FileText },
              { id: "insights" as const, label: "AI", icon: Sparkles },
            ].map((t) => {
              const Icon = t.icon;
              const active = mobileTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMobileTab(t.id)}
                  className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
      <span>{total.toLocaleString()} roles</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={onPrev} disabled={page <= 1}>
          Prev
        </Button>
        <span className="px-1 font-mono">
          {page} / {totalPages}
        </span>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={onNext} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: unknown }) {
  const message = getErrorMessage(error);
  const isUnauthorized = message.toLowerCase().includes("unauthorized");
  const isNetwork = message.toLowerCase().includes("network") || message.toLowerCase().includes("timeout");

  const Icon = isUnauthorized ? Lock : isNetwork ? WifiOff : AlertTriangle;
  const title = isUnauthorized
    ? "Sign in to view jobs"
    : isNetwork
      ? "Network error"
      : "Couldn't load jobs";

  return (
    <div className="grid flex-1 place-items-center p-10 text-center">
      <div className="max-w-[320px]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-destructive/25 to-destructive/10">
          <Icon className="h-6 w-6 text-destructive" />
        </div>
        <div className="mt-4 text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{message}</div>
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
  );
}