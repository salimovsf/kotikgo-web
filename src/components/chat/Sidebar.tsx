"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ChatItem {
  id: string;
  title: string | null;
  updatedAt: string;
  messages?: { content: string; role: string }[];
}

export function Sidebar({
  open,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
}: {
  open: boolean;
  onClose: () => void;
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}) {
  const t = useTranslations("chat");

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50 w-[260px]
          bg-[var(--bg)] border-r border-[var(--border)]
          flex flex-col shrink-0 transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-4 py-4 flex items-center justify-between border-b border-[var(--border)]">
          <Link href="/" className="text-lg font-black tracking-tight">
            Kotik<span className="text-[var(--accent)]">Go</span>
          </Link>
          <button
            onClick={onNewChat}
            className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--accent)] hover:border-[var(--accent)] flex items-center justify-center text-base transition-colors"
          >
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] px-2.5 pb-2 pt-1">
            {t("history")}
          </div>

          {chats.length === 0 && (
            <div className="px-2.5 py-4 text-[12px] text-[var(--text-3)]">
              Нет сохранённых чатов
            </div>
          )}

          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-colors mb-0.5 ${
                chat.id === activeChatId
                  ? "bg-white shadow-sm"
                  : "hover:bg-white"
              }`}
            >
              <span className="text-base">💬</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">
                  {chat.title || "Новый чат"}
                </div>
                <div className="text-[11px] text-[var(--text-3)]">
                  {new Date(chat.updatedAt).toLocaleDateString("ru")}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex gap-1 px-2.5 mb-2">
            <button className="text-[10px] font-bold px-2 py-1 rounded bg-[var(--accent)] text-white border border-[var(--accent)]">RU</button>
            <button className="text-[10px] font-bold px-2 py-1 rounded text-[var(--text-3)] bg-white border border-[var(--border)]">EN</button>
            <button className="text-[10px] font-bold px-2 py-1 rounded text-[var(--text-3)] bg-white border border-[var(--border)]">TR</button>
          </div>
        </div>
      </aside>
    </>
  );
}
