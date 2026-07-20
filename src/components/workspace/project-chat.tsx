"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

export function ProjectChat({
  projectId,
  initialMessages,
  onReply,
}: {
  projectId: string;
  initialMessages: ChatMessage[];
  onReply?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || pending) return;

    const optimisticUser: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: "USER",
      content,
    };

    setMessages((prev) => [...prev, optimisticUser]);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Failed to reach the AI architect.");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUser.id),
        { id: data.userMessage.id, role: "USER", content: data.userMessage.content },
        { id: data.assistantMessage.id, role: "ASSISTANT", content: data.assistantMessage.content },
      ]);
      onReply?.();
    } catch {
      setError("Something went wrong sending your message. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setInput(content);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted">
            <Sparkles className="h-8 w-8 text-brand" />
            <p className="max-w-sm text-sm">
              Tell the AI architect what you want to build. Be as specific or as vague as you like —
              it will ask questions to fill in the gaps.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "USER" ? "flex-row-reverse text-right" : ""
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                message.role === "USER" ? "bg-surface-hover" : "brand-gradient text-brand-foreground"
              )}
            >
              {message.role === "USER" ? <UserIcon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </span>
            <div
              className={cn(
                "max-w-[75%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm",
                message.role === "USER"
                  ? "bg-surface-hover text-foreground"
                  : "border border-border bg-surface text-foreground"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Sparkles className="h-4 w-4 animate-pulse text-brand" />
            Thinking...
          </div>
        )}
      </div>
      {error && <p className="px-6 text-xs text-danger">{error}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-end gap-2 border-t border-border p-4"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Describe what you want to build or ask a follow-up question..."
          rows={2}
          className="resize-none"
        />
        <Button type="submit" disabled={pending || !input.trim()} size="icon" aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
