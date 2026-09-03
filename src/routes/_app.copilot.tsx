import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  MessageSquare,
  Target,
  FileText,
  Users,
  Mail,
  KanbanSquare,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/constants/api";

export const Route = createFileRoute("/_app/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot · CareerOS" },
      {
        name: "description",
        content:
          "Your personal AI career assistant for job search, resume optimization, and interview prep.",
      },
    ],
  }),
  component: CopilotPage,
} as any);

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const SUGGESTED_PROMPTS = [
  {
    icon: Target,
    label: "Find matching jobs",
    prompt: "Find jobs that match my profile and skills",
  },
  {
    icon: BarChart3,
    label: "Improve ATS score",
    prompt: "How can I improve my ATS score?",
  },
  {
    icon: FileText,
    label: "Analyze job description",
    prompt: "Can you explain this job description and key requirements?",
  },
  {
    icon: Users,
    label: "Interview prep",
    prompt: "Help me prepare for an interview for my target role",
  },
  {
    icon: Mail,
    label: "Draft referral note",
    prompt: "Write a professional referral request message",
  },
  {
    icon: KanbanSquare,
    label: "Pipeline status",
    prompt: "Show me a summary of my application status",
  },
];

function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI career assistant. I can help you with:\n\n• Finding jobs that match your profile\n• Improving your ATS score\n• Preparing for interviews\n• Tracking your applications\n• Generating referral messages\n\nWhat would you like help with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await request<{ response: string; message: string }>({
        method: "POST",
        path: API_ENDPOINTS.COPILOT.SEND_MESSAGE,
        body: { message: messageText },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.message || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-56px)] max-w-4xl flex-col">
      {/* Header */}
      <div className="border-b border-border/70 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">AI Copilot</h1>
            <p className="text-[11px] text-muted-foreground">Context-aware career assistant</p>
          </div>
          <Badge variant="outline" className="ml-auto rounded-md border-border/80 text-[10px]">
            <Sparkles className="mr-1 h-3 w-3 text-primary" />
            Online
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <Card
                className={`max-w-[80%] rounded-xl shadow-xs ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "glass border-border/80"
                }`}
              >
                <CardContent className="p-3">
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{message.content}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
              {message.role === "user" && (
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-elevated text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <Card className="glass rounded-xl border-border/80">
                <CardContent className="p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Prompts */}
      {messages.length === 1 && (
        <div className="border-t border-border/70 p-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Suggested actions
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SUGGESTED_PROMPTS.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.label}
                  type="button"
                  className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-surface p-2.5 text-left transition-colors hover:border-border hover:bg-surface-elevated"
                  onClick={() => handleSend(suggestion.prompt)}
                >
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate text-xs font-medium text-foreground">
                    {suggestion.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/70 p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your career..."
            className="h-9 flex-1 rounded-lg border-border/80 bg-surface text-xs"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-9 w-9 shrink-0 rounded-lg p-0 shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
