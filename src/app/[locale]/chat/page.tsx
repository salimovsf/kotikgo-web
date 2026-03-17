"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 h-12 border-b border-[var(--border)] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--text-2)]"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-black tracking-tight">
            Kotik<span className="text-[var(--accent)]">Go</span>
          </span>
          <button className="w-7 h-7 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-2)] flex items-center justify-center text-sm">
            +
          </button>
        </div>

        <ChatArea />
      </div>
    </div>
  );
}
