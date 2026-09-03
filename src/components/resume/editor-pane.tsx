import { useState, useEffect } from "react";
import {
  GripVertical,
  Trash2,
  Plus,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Heading2,
  AlignLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ResumeData, ResumeSection } from "@/types/resume";

function Toolbar() {
  const items = [
    { icon: Heading2, label: "Heading" },
    { icon: Bold, label: "Bold  ⌘B" },
    { icon: Italic, label: "Italic  ⌘I" },
    { icon: Underline, label: "Underline  ⌘U" },
    { icon: AlignLeft, label: "Align" },
    { icon: List, label: "Bulleted list" },
    { icon: ListOrdered, label: "Numbered list" },
    { icon: Link2, label: "Insert link" },
  ];
  return (
    <TooltipProvider delayDuration={150}>
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-1 border-b border-border/60 bg-background/70 px-4 py-2 backdrop-blur">
        {items.map((it, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                aria-label={it.label}
              >
                <it.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">{it.label}</TooltipContent>
          </Tooltip>
        ))}
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs">
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
          Improve with AI
        </Button>
      </div>
    </TooltipProvider>
  );
}

function SectionShell({
  section,
  onDragStart,
  onDragOver,
  onDrop,
  onDelete,
  dragging,
  children,
}: {
  section: ResumeSection;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string) => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(section.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDrop={() => onDrop(section.id)}
      className={`group relative rounded-2xl border border-border/60 bg-surface-elevated/40 p-5 transition ${
        dragging ? "opacity-50" : "hover:border-border"
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <button
          className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-background/60"
          aria-label="Reorder section"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {section.title}
        </h3>
        <div className="ml-auto flex items-center opacity-0 transition group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete section"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

export function EditorPane({
  resume,
  onChange,
  onImproveBullet,
}: {
  resume: ResumeData;
  onChange?: (data: ResumeData) => void;
  onImproveBullet?: (entryId: string, bulletId: string, bulletText: string) => void;
}) {
  const [sections, setSections] = useState(resume.sections);
  const [dragId, setDragId] = useState<string | null>(null);
  const [data, setData] = useState(resume);

  useEffect(() => {
    setSections(resume.sections);
    setData(resume);
  }, [resume.sections, resume]);

  useEffect(() => {
    onChange?.(data);
  }, [data, onChange]);

  const move = (from: string, to: string) => {
    if (from === to) return;
    const next = [...sections];
    const fromIdx = next.findIndex((s) => s.id === from);
    const toIdx = next.findIndex((s) => s.id === to);
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    setSections(next);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 px-6 pb-4 pt-5">
        <Input
          value={data.contact.fullName}
          onChange={(e) =>
            setData({ ...data, contact: { ...data.contact, fullName: e.target.value } })
          }
          className="h-auto border-0 bg-transparent px-0 py-1 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
        />
        <Input
          value={data.contact.headline}
          onChange={(e) =>
            setData({ ...data, contact: { ...data.contact, headline: e.target.value } })
          }
          className="h-auto border-0 bg-transparent px-0 py-0.5 text-sm text-muted-foreground shadow-none focus-visible:ring-0"
        />
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          {(["email", "phone", "location", "website"] as const).map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] opacity-70">{k}</span>
              <Input
                value={data.contact[k]}
                onChange={(e) =>
                  setData({ ...data, contact: { ...data.contact, [k]: e.target.value } })
                }
                className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
              />
            </div>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-6 pb-24">
          <Toolbar />
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionShell
                key={section.id}
                section={section}
                dragging={dragId === section.id}
                onDragStart={setDragId}
                onDragOver={() => {}}
                onDrop={(target) => {
                  if (dragId) move(dragId, target);
                  setDragId(null);
                }}
                onDelete={() => setSections(sections.filter((s) => s.id !== section.id))}
              >
                {section.type === "summary" && (
                  <Textarea
                    value={data.summary}
                    onChange={(e) => setData({ ...data, summary: e.target.value })}
                    rows={4}
                    className="resize-none border-0 bg-transparent px-0 text-[13.5px] leading-relaxed shadow-none focus-visible:ring-0"
                  />
                )}

                {section.type === "experience" && (
                  <div className="space-y-5">
                    {data.experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="rounded-xl border border-border/50 bg-background/30 p-4"
                      >
                        <div className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <div className="min-w-0">
                            <Input
                              value={exp.role}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  experience: data.experience.map((x) =>
                                    x.id === exp.id ? { ...x, role: e.target.value } : x,
                                  ),
                                })
                              }
                              className="h-auto border-0 bg-transparent px-0 py-0.5 text-sm font-semibold shadow-none focus-visible:ring-0"
                            />
                            <div className="text-xs text-muted-foreground">
                              {exp.company} · {exp.location}
                            </div>
                          </div>
                          <div className="shrink-0 font-mono text-xs text-muted-foreground">
                            {exp.start} — {exp.end}
                          </div>
                        </div>
                        <ul className="mt-3 space-y-1.5">
                          {exp.bullets.map((b) => (
                            <li
                              key={b.id}
                              className="group/bullet flex gap-2 text-[13px] leading-relaxed"
                            >
                              <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground/70" />
                              <span className="flex-1">{b.text}</span>
                              {onImproveBullet && (
                                <button
                                  className="mt-0.5 shrink-0 opacity-0 transition group-hover/bullet:opacity-100 text-muted-foreground hover:text-primary"
                                  onClick={() => onImproveBullet(exp.id, b.id, b.text)}
                                  aria-label="Improve this bullet with AI"
                                >
                                  <Sparkles className="h-3 w-3" />
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg text-xs text-muted-foreground"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add role
                    </Button>
                  </div>
                )}

                {section.type === "skills" && (
                  <div className="flex flex-wrap gap-1.5">
                    {data.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs"
                      >
                        {s}
                      </span>
                    ))}
                    <button className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary">
                      + Add skill
                    </button>
                  </div>
                )}

                {section.type === "projects" && (
                  <div className="space-y-3">
                    {data.projects.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-border/50 bg-background/30 p-3"
                      >
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="mt-1 text-[13px] text-muted-foreground">
                          {p.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.type === "education" && (
                  <div className="space-y-3">
                    {data.education.map((ed) => (
                      <div key={ed.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{ed.school}</div>
                          <div className="truncate text-xs text-muted-foreground">{ed.degree}</div>
                        </div>
                        <div className="shrink-0 font-mono text-xs text-muted-foreground">
                          {ed.start} — {ed.end}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionShell>
            ))}

            <Button variant="outline" className="mt-2 h-10 w-full rounded-xl border-dashed text-sm">
              <Plus className="mr-1.5 h-4 w-4" /> Add section
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
