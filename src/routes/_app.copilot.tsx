import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot · CareerOS" },
      {
        name: "description",
        content: "Your personal AI career assistant for job search, resume optimization, and interview prep.",
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
  { icon: "💼", label: "Find jobs matching my profile", prompt: "Find jobs that match my profile and skills" },
  { icon: "📊", label: "Improve my ATS score", prompt: "How can I improve my ATS score?" },
  { icon: "📝", label: "Explain this job description", prompt: "Can you explain this job description?" },
  { icon: "🎯", label: "Prepare for interview", prompt: "Help me prepare for an interview" },
  { icon: "✉️", label: "Generate referral message", prompt: "Write a referral message" },
  { icon: "📈", label: "Track my applications", prompt: "Show me my application status" },
];

function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI career assistant. I can help you with:\n\n• Finding jobs that match your profile\n• Improving your ATS score\n• Preparing for interviews\n• Tracking your applications\n• Generating referral messages\n\nWhat would you like help with today?",
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
      // Call the copilot API
      const response = await fetch("/api/copilot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

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
      <div className="border-b border-border/60 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI Copilot</h1>
            <p className="text-xs text-muted-foreground">Your personal career assistant</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="mr-1 h-3 w-3" />
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
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <Card
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-elevated/40"
                }`}
              >
                <CardContent className="p-3">
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </CardContent>
              </Card>
              {message.role === "user" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                  <MessageSquare className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="bg-surface-elevated/40">
                <CardContent className="p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Prompts */}
      {messages.length === 1 && (
        <div className="border-t border-border/60 p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Suggested actions</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SUGGESTED_PROMPTS.map((suggestion) => (
              <Button
                key={suggestion.label}
                variant="outline"
                className="h-auto justify-start gap-2 p-3 text-left"
                onClick={() => handleSend(suggestion.prompt)}
              >
                <span className="text-lg">{suggestion.icon}</span>
                <span className="text-xs">{suggestion.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/60 p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your career..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
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