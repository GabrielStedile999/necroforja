"use client";

import { useChat } from "@ai-sdk/react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "How is the Gang Rating calculated?",
  "How many credits do I have to found the gang?",
  "How do Sympathisers work?",
  "How many cycles does the campaign have?",
];

export function RulesChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
  } = useChat({ api: "/api/assistant" });

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-8 text-center">
            <Bot className="h-10 w-10 text-hazard" aria-hidden />
            <p className="max-w-md text-sm text-muted">
              Ask about the campaign rules. Answers are based on the loaded rule
              notes, with source citations.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    handleInputChange({
                      target: { value: s },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="rounded-sm border border-rivet bg-elevated px-3 py-1.5 text-xs text-muted hover:border-hazard hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                {m.role === "user" ? (
                  <User className="h-5 w-5 text-cyan" aria-hidden />
                ) : (
                  <Bot className="h-5 w-5 text-hazard" aria-hidden />
                )}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {m.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 text-sm text-muted">
            <Bot className="h-5 w-5 text-hazard" aria-hidden />
            <span className="animate-pulse">consulting the rules...</span>
          </div>
        )}
        {error && (
          <div className="flex flex-col gap-2 rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
            <span>Failed to respond: {error.message}</span>
            <button
              onClick={() => reload()}
              className="self-start rounded-sm border border-blood/40 px-2 py-1 text-xs hover:bg-blood/20"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-rivet pt-4"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about a rule..."
          aria-label="Question"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
