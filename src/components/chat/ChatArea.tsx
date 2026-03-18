"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useTranslations } from "next-intl";

export function ChatArea() {
  const t = useTranslations("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const chat = useMemo(
    () =>
      new Chat({
        transport: new TextStreamChatTransport({ api: "/api/chat" }),
        messages: [
          {
            id: "greeting",
            role: "assistant",
            parts: [{ type: "text", text: t("greeting") + " 😊" }],
          },
        ],
      }),
    [t]
  );

  const { messages, sendMessage, status } = useChat({ chat });
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const getMessageText = (msg: (typeof messages)[number]) => {
    if ("content" in msg && typeof msg.content === "string") return msg.content;
    if ("parts" in msg && Array.isArray(msg.parts)) {
      return msg.parts
        .filter((p: { type: string }) => p.type === "text")
        .map((p: { type: string; text: string }) => p.text)
        .join("");
    }
    return "";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-12 px-5 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <div className="text-[13px] font-bold text-[var(--text)]">KotikGo AI</div>
        <div className="text-[11px] font-semibold text-[var(--green)] flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[var(--green)] rounded-full" />
          {t("online")}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-7">
        <div className="max-w-[700px] mx-auto px-5 flex flex-col gap-5">
          {messages.map((msg) => {
            const text = getMessageText(msg);
            const role = (msg as { role: string }).role;
            if (!text) return null;
            return (
              <div key={msg.id} className={`flex ${role === "user" ? "justify-end" : "gap-2.5 items-start"}`}>
                {role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs text-white shrink-0 mt-0.5">
                    🐱
                  </div>
                )}
                <div className="max-w-[580px]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      role === "user"
                        ? "bg-[var(--accent)] text-white rounded-br-sm"
                        : "bg-[var(--bg)] text-[var(--text)] rounded-bl-sm"
                    }`}
                  >
                    {text}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (messages[messages.length - 1] as { role: string })?.role === "user" && (
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs text-white shrink-0 mt-0.5">
                🐱
              </div>
              <div className="bg-[var(--bg)] rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--text-3)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-[var(--text-3)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-[var(--text-3)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-[var(--border)] shrink-0">
        <form onSubmit={onSubmit} className="max-w-[700px] mx-auto flex gap-2 items-end">
          <div className="flex-1 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl flex items-end transition-colors focus-within:border-[var(--accent)] p-1">
            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text)] px-3 py-2.5 resize-none max-h-24 leading-relaxed placeholder:text-[var(--text-3)]"
              rows={1}
              placeholder={t("placeholder")}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 flex items-center justify-center shrink-0 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
        <div className="text-center text-[10px] text-[var(--text-3)] mt-1.5 max-w-[700px] mx-auto">
          {t("disclaimer")}
        </div>
      </div>
    </div>
  );
}
