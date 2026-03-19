"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { renderWidget } from "./widgets";
import Markdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function parseContent(content: string): Array<{ type: "text"; text: string } | { type: "widget"; kind: string; data: Record<string, unknown> } | { type: "loading" }> {
  const segments: Array<{ type: "text"; text: string } | { type: "widget"; kind: string; data: Record<string, unknown> } | { type: "loading" }> = [];
  const lines = content.split("\n");
  let textBuffer = "";

  for (const line of lines) {
    // Check if line starts with [widget: — could be complete or still streaming
    const widgetStart = line.match(/^\[widget:(\w+)\]/);
    if (widgetStart) {
      if (textBuffer.trim()) {
        segments.push({ type: "text", text: textBuffer.trim() });
        textBuffer = "";
      }

      const jsonPart = line.slice(widgetStart[0].length);
      if (!jsonPart) {
        // Widget tag without data yet — show loading
        segments.push({ type: "loading" });
        continue;
      }

      try {
        const data = JSON.parse(jsonPart);
        segments.push({ type: "widget", kind: widgetStart[1], data });
      } catch {
        // JSON incomplete — still streaming, show loading indicator
        segments.push({ type: "loading" });
      }
    } else if (line.includes("[widget:") && !line.startsWith("[widget:")) {
      // Widget tag in the middle of text — skip the widget part, keep text before
      const idx = line.indexOf("[widget:");
      const before = line.slice(0, idx);
      if (before.trim()) textBuffer += before + "\n";
      // Rest is incomplete widget — show loading
      segments.push({ type: "loading" });
    } else {
      textBuffer += line + "\n";
    }
  }

  if (textBuffer.trim()) {
    segments.push({ type: "text", text: textBuffer.trim() });
  }

  return segments;
}

export function ChatArea({
  chatId,
  onChatCreated,
  createChat,
}: {
  chatId: string | null;
  onChatCreated: (id: string) => void;
  createChat: () => Promise<string | null>;
}) {
  const t = useTranslations("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const justCreatedRef = useRef(false);

  // Load messages when chatId changes (but skip if we just created this chat)
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    if (justCreatedRef.current) {
      justCreatedRef.current = false;
      return;
    }

    fetch(`/api/chats/${chatId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.chat?.messages) {
          setMessages(
            data.chat.messages.map((m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        }
      })
      .catch(() => {});
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = useCallback(async (cId: string, role: string, content: string) => {
    try {
      await fetch(`/api/chats/${cId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content }),
      });
    } catch {}
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    // Create chat if none
    let cId = chatId;
    if (!cId) {
      cId = await createChat();
      if (!cId) return;
      justCreatedRef.current = true;
      onChatCreated(cId);
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Save user message
    saveMessage(cId, "user", text);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      const assistantId = (Date.now() + 1).toString();
      let assistantContent = "";

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantContent } : m
          )
        );
      }

      // Save assistant message
      saveMessage(cId, "assistant", assistantContent);
    } catch (err) {
      console.error("Chat error:", err);
      const errMsg = "Произошла ошибка. Попробуйте ещё раз.";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 2).toString(), role: "assistant", content: errMsg },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, chatId, createChat, onChatCreated, saveMessage]);

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
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const greeting = t("greeting") + " 😊";

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
          {/* Greeting always first */}
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs text-white shrink-0 mt-0.5">🐱</div>
            <div className="max-w-[580px]">
              <div className="bg-[var(--bg)] text-[var(--text)] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
                {greeting}
              </div>
            </div>
          </div>

          {messages.map((msg) => {
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[580px]">
                    <div className="rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed bg-[var(--accent)] text-white whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            }

            const segments = parseContent(msg.content);

            return (
              <div key={msg.id} className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs text-white shrink-0 mt-0.5">🐱</div>
                <div className="max-w-[580px] flex flex-col gap-2 flex-1 min-w-0">
                  {segments.length === 0 && !msg.content ? (
                    <div className="bg-[var(--bg)] rounded-2xl rounded-bl-sm px-4 py-3">
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-[var(--text-3)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-[var(--text-3)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-[var(--text-3)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                  ) : (
                    segments.map((seg, i) =>
                      seg.type === "text" ? (
                        <div key={i} className="bg-[var(--bg)] text-[var(--text)] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-[var(--text)]">
                          <Markdown>{seg.text}</Markdown>
                        </div>
                      ) : seg.type === "loading" ? (
                        <div key={i} className="bg-[var(--bg)] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[12px] text-[var(--text-3)]">Подбираю варианты...</span>
                        </div>
                      ) : (
                        <div key={i}>{renderWidget(seg.kind, seg.data)}</div>
                      )
                    )
                  )}
                </div>
              </div>
            );
          })}
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
