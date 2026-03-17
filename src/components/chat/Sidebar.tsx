"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
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
          <button className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--accent)] hover:border-[var(--accent)] flex items-center justify-center text-base transition-colors">
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] px-2.5 pb-2 pt-1">
            {t("my_trips")}
          </div>

          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white shadow-sm mb-0.5 cursor-pointer">
            <span className="text-base">🌴</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">Бали, Индонезия</div>
              <div className="text-[11px] text-[var(--text-3)]">1 — 14 апреля</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          </div>

          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white mb-0.5 cursor-pointer transition-colors">
            <span className="text-base">🏙️</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">Стамбул</div>
              <div className="text-[11px] text-[var(--text-3)]">12 — 16 мая</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          </div>

          <div className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] px-2.5 pb-2">
            {t("history")}
          </div>

          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
            <span className="text-base">💬</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">Рестораны в Каше</div>
              <div className="text-[11px] text-[var(--text-3)]">вчера</div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex gap-1 px-2.5 mb-2">
            <button className="text-[10px] font-bold px-2 py-1 rounded bg-[var(--accent)] text-white border border-[var(--accent)]">RU</button>
            <button className="text-[10px] font-bold px-2 py-1 rounded text-[var(--text-3)] bg-white border border-[var(--border)]">EN</button>
            <button className="text-[10px] font-bold px-2 py-1 rounded text-[var(--text-3)] bg-white border border-[var(--border)]">TR</button>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-2)] cursor-pointer hover:bg-white transition-colors">
            ⚙️ {t("settings")}
          </div>
        </div>
      </aside>
    </>
  );
}
