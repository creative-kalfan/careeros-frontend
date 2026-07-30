import { useState } from "react";
import { Minus, Plus, Maximize2, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ResumeData } from "@/types/resume";

const ZOOMS = [50, 65, 80, 100, 125, 150];

export function PreviewPane({ resume }: { resume: ResumeData }) {
  const [zoom, setZoom] = useState(80);

  const change = (dir: 1 | -1) => {
    const idx = ZOOMS.indexOf(zoom);
    const next = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, idx + dir))];
    setZoom(next);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-surface-elevated/40">
          <Button variant="ghost" size="icon" onClick={() => change(-1)} className="h-7 w-7 rounded-md" aria-label="Zoom out">
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <div className="w-12 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
            {zoom}%
          </div>
          <Button variant="ghost" size="icon" onClick={() => change(1)} className="h-7 w-7 rounded-md" aria-label="Zoom in">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setZoom(100)} aria-label="Actual size">
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <span className="text-[11px] text-muted-foreground">A4 · PDF-ready</span>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" aria-label="Print">
            <Printer className="h-4 w-4" />
          </Button>
          <Button size="sm" className="h-8 rounded-lg text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-linear-to-b from-background/40 to-background">
        <div className="grid place-items-start justify-center p-6">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
            className="transition-transform duration-200"
          >
            <A4Page resume={resume} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// 794 × 1123 px ≈ A4 at 96dpi
function A4Page({ resume }: { resume: ResumeData }) {
  return (
    <article
      className="mx-auto rounded-sm bg-white text-[#1a1a2e] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-black/5"
      style={{ width: 794, minHeight: 1123, padding: "56px 64px", fontFamily: "Inter Variable, Inter, sans-serif" }}
    >
      <header className="border-b border-black/10 pb-5">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#0a0a0f]">{resume.contact.fullName}</h1>
        <p className="mt-1 text-[13px] text-[#4a4a5a]">{resume.contact.headline}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#4a4a5a]">
          <span>{resume.contact.email}</span>
          <span>{resume.contact.phone}</span>
          <span>{resume.contact.location}</span>
          <span>{resume.contact.website}</span>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        <section>
          <SectionTitle>Summary</SectionTitle>
          <p className="text-[12.5px] leading-relaxed text-[#2a2a3a]">{resume.summary}</p>
        </section>

        <section>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {resume.experience.map((e) => (
              <div key={e.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-semibold text-[#0a0a0f]">{e.role}</div>
                    <div className="text-[11.5px] text-[#4a4a5a]">
                      {e.company} · {e.location}
                    </div>
                  </div>
                  <div className="shrink-0 font-mono text-[10.5px] text-[#666]">
                    {e.start} — {e.end}
                  </div>
                </div>
                <ul className="mt-2 space-y-1">
                  {e.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-[#2a2a3a]">
                      <span className="mt-[7px] inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-[#666]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Skills</SectionTitle>
          <div className="text-[12px] leading-relaxed text-[#2a2a3a]">{resume.skills.join(" · ")}</div>
        </section>

        <section>
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-2">
            {resume.projects.map((p) => (
              <div key={p.id}>
                <div className="text-[12.5px] font-semibold text-[#0a0a0f]">{p.name}</div>
                <div className="text-[12px] text-[#2a2a3a]">{p.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Education</SectionTitle>
          {resume.education.map((ed) => (
            <div key={ed.id} className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-[12.5px] font-semibold text-[#0a0a0f]">{ed.school}</div>
                <div className="text-[11.5px] text-[#4a4a5a]">{ed.degree}</div>
              </div>
              <div className="font-mono text-[10.5px] text-[#666]">
                {ed.start} — {ed.end}
              </div>
            </div>
          ))}
        </section>
      </div>
    </article>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-b border-black/10 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#0055ff]">
      {children}
    </h2>
  );
}
