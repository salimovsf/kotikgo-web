"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";

interface ChatItem {
  id: string;
  title: string | null;
  updatedAt: string;
  messages?: { content: string; role: string }[];
}

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      setChats(data.chats || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createChat = useCallback(async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "ru" }),
      });
      const data = await res.json();
      setActiveChatId(data.chat.id);
      loadChats();
      return data.chat.id as string;
    } catch {
      return null;
    }
  }, [loadChats]);

  const selectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={() => { setActiveChatId(null); setSidebarOpen(false); }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 h-12 border-b border-[var(--border)] shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-[var(--text-2)]">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-black tracking-tight">
            Kotik<span className="text-[var(--accent)]">Go</span>
          </span>
          <button
            onClick={() => { setActiveChatId(null); }}
            className="w-7 h-7 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-2)] flex items-center justify-center text-sm"
          >
            +
          </button>
        </div>

        <ChatArea
          chatId={activeChatId}
          onChatCreated={(id) => { setActiveChatId(id); loadChats(); }}
          createChat={createChat}
        />
      </div>
    </div>
  );
}
