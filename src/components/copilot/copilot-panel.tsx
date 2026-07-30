import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  ArrowUp,
  ChevronDown,
  Pin,
  PinOff,
  Plus,
  Sparkles,
  X,
  History,
  Command as CommandIcon,
  PanelRightClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  generateMockResponse,
  mockConversations,
  moduleFromPath,
  moduleMeta,
  toolsForModule,
  type ChatMessage,
  type Conversation,
  type CopilotModule,
  type CopilotTool,
} from "@/lib/copilot-data";
import { useCopilot } from "./copilot-context";
import { ChatBubble } from "./chat-bubble";
import { ConversationList } from "./conversation-list";
import { WelcomeState } from "./welcome";
import { ThinkingIndicator } from "./thinking";

const MIN_W = 380;
const MAX_W = 640;

export function CopilotPanel() {
  const { open, setOpen, pinned, togglePinned, pendingPrompt, clearPendingPrompt } = useCopilot();
  const isMobile = useIsMobile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentModule = moduleFromPath(pathname);

  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string>(mockConversations[0].id);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [width, setWidth] = useState(460);
  const [resizing, setResizing] = useState(false);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, thinking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setOpen(!open);
      } else if (meta && e.key === "/") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === "Escape" && open && !pinned) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pinned, setOpen]);

  function submit(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: "now" };
    setConversations((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, userMsg], updatedAt: "now" } : c)),
    );
    setInput("");
    setThinking(true);
    // TODO(API): Replace with streaming request to backend Copilot endpoint.
    setTimeout(() => {
      const { content, card } = generateMockResponse(text);
      const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", content, card, timestamp: "now" };
      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, aiMsg], updatedAt: "now" } : c)),
      );
      setThinking(false);
    }, 900);
  }

  useEffect(() => {
    if (pendingPrompt && open) {
      submit(pendingPrompt);
      clearPendingPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, open]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const next = Math.min(MAX_W, Math.max(MIN_W, window.innerWidth - e.clientX));
      setWidth(next);
    };
    const onUp = () => setResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing]);

  function newConversation() {
    const id = `conv-${Date.now()}`;
    const conv: Conversation = {
      id,
      title: "New conversation",
      updatedAt: "now",
      module: currentModule,
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    setShowHistory(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const meta = moduleMeta[currentModule];
  const ModuleIcon = meta.icon;
  const tools = toolsForModule(currentModule);

  if (!open) return <CopilotLauncher />;

  const bodyProps = {
    active,
    mod: currentModule,
    thinking,
    input,
    setInput,
    onSubmit: () => submit(input),
    onPrompt: (p: string) => submit(p),
    inputRef,
    scrollRef,
    tools,
    showHistory,
    conversations,
    activeId,
    onSelectConversation: (id: string) => {
      setActiveId(id);
      setShowHistory(false);
    },
  };

  const headerProps = {
    ModuleIcon,
    moduleTitle: meta.title,
    active,
    pinned,
    togglePinned,
    onClose: () => setOpen(false),
    onNew: newConversation,
    onToggleHistory: () => setShowHistory((v) => !v),
    showHistory,
  };

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 animate-fade-in">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div className="glass-strong absolute inset-x-0 bottom-0 top-[10vh] flex animate-[slide-in-right_0.3s_ease-out] flex-col rounded-t-3xl shadow-elevation-3">
          <PanelHeader {...headerProps} mobile />
          <PanelBody {...bodyProps} />
        </div>
      </div>
    );
  }

  return (
    <>
      {!pinned && (
        <div
          className="fixed inset-0 z-40 animate-fade-in bg-background/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "glass-strong fixed bottom-3 right-3 top-3 z-50 flex flex-col overflow-hidden rounded-2xl shadow-elevation-3 animate-[scale-in_0.18s_ease-out]",
          resizing && "select-none",
        )}
        style={{ width }}
      >
        <div
          onMouseDown={() => setResizing(true)}
          className="group absolute left-0 top-0 z-10 h-full w-1.5 cursor-ew-resize"
        >
          <div className="absolute inset-y-0 left-0 w-px bg-border/60 transition group-hover:w-0.5 group-hover:bg-primary/60" />
        </div>
        <PanelHeader {...headerProps} />
        <PanelBody {...bodyProps} />
      </aside>
    </>
  );
}

function PanelHeader({
  ModuleIcon,
  moduleTitle,
  active,
  pinned,
  togglePinned,
  onClose,
  onNew,
  onToggleHistory,
  showHistory,
  mobile,
}: {
  ModuleIcon: typeof Sparkles;
  moduleTitle: string;
  active: Conversation;
  pinned: boolean;
  togglePinned: () => void;
  onClose: () => void;
  onNew: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
  mobile?: boolean;
}) {
  return (
    <header className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-primary-foreground shadow-elevation-1">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold tracking-tight">Career Copilot</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-1.5 py-0.5">
            <ModuleIcon className="h-2.5 w-2.5 text-primary" />
            <span className="uppercase tracking-wider">{moduleTitle}</span>
          </span>
          <span className="truncate">{active.title}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <IconBtn title="History" active={showHistory} onClick={onToggleHistory}>
          {showHistory ? <PanelRightClose className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
        </IconBtn>
        <IconBtn title="New conversation" onClick={onNew}>
          <Plus className="h-3.5 w-3.5" />
        </IconBtn>
        {!mobile && (
          <IconBtn title={pinned ? "Unpin" : "Pin"} active={pinned} onClick={togglePinned}>
            {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </IconBtn>
        )}
        <IconBtn title="Close" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </IconBtn>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-lg transition",
        active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PanelBody({
  active,
  mod,
  thinking,
  input,
  setInput,
  onSubmit,
  onPrompt,
  inputRef,
  scrollRef,
  tools,
  showHistory,
  conversations,
  activeId,
  onSelectConversation,
}: {
  active: Conversation;
  mod: CopilotModule;
  thinking: boolean;
  input: string;
  setInput: (v: string) => void;
  onSubmit: () => void;
  onPrompt: (p: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  tools: CopilotTool[];
  showHistory: boolean;
  conversations: Conversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
}) {
  const isEmpty = active.messages.length === 0;
  return (
    <div className="grid min-h-0 flex-1" style={{ gridTemplateColumns: showHistory ? "220px 1fr" : "1fr" }}>
      {showHistory && (
        <div className="min-h-0 border-r border-border/60 bg-sidebar/40">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={onSelectConversation}
          />
        </div>
      )}
      <div className="flex min-h-0 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {isEmpty ? (
            <WelcomeState module={mod} onPrompt={onPrompt} />
          ) : (
            <div className="space-y-4">
              {active.messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {thinking && <ThinkingIndicator />}
            </div>
          )}
        </div>
        {!isEmpty && (
          <div className="border-t border-border/60 px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {tools.slice(0, 8).map((t) => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => onPrompt(t.prompt)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-surface-elevated/40 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                  >
                    <TIcon className="h-3 w-3" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <Composer input={input} setInput={setInput} onSubmit={onSubmit} inputRef={inputRef} disabled={thinking} />
      </div>
    </div>
  );
}

function Composer({
  input,
  setInput,
  onSubmit,
  inputRef,
  disabled,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  disabled: boolean;
}) {
  return (
    <div className="border-t border-border/60 p-3">
      <div className="glass rounded-2xl p-2 shadow-elevation-1 transition focus-within:ring-2 focus-within:ring-primary/40">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          rows={2}
          placeholder="Ask about your resume, ATS, jobs, applications…"
          className="block w-full resize-none rounded-lg bg-transparent px-2 py-1 text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="mt-1 flex items-center justify-between px-1">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-background/60 px-1 py-0.5 font-mono">⌘</kbd>
            <kbd className="rounded border border-border bg-background/60 px-1 py-0.5 font-mono">/</kbd>
            <span>to focus · Shift+Enter for newline</span>
          </div>
          <button
            onClick={onSubmit}
            disabled={disabled || !input.trim()}
            className="grid h-8 w-8 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-primary-foreground shadow-elevation-1 transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CopilotLauncher() {
  const { setOpen } = useCopilot();
  return (
    <button
      onClick={() => setOpen(true)}
      title="Open Copilot (⌘I)"
      className="group fixed bottom-5 right-5 z-40 flex h-12 animate-[scale-in_0.2s_ease-out] items-center gap-2 rounded-full border border-border/60 bg-linear-to-br from-primary to-accent px-4 text-primary-foreground shadow-elevation-3 transition hover:scale-105"
    >
      <Sparkles className="h-4 w-4" />
      <span className="text-sm font-semibold">Copilot</span>
      <span className="ml-1 hidden items-center gap-0.5 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
        <CommandIcon className="h-2.5 w-2.5" />I
      </span>
    </button>
  );
}