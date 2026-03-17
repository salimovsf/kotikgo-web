"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-[1120px] mx-auto px-8 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tight">
          Kotik<span className="text-[var(--accent)]">Go</span>
        </Link>

        <nav className="hidden md:flex gap-7">
          <a href="#services" className="text-sm font-semibold text-[var(--text-2)] hover:text-[var(--accent)] transition-colors">
            {t("services")}
          </a>
          <a href="#destinations" className="text-sm font-semibold text-[var(--text-2)] hover:text-[var(--accent)] transition-colors">
            {t("destinations")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-5 py-2 rounded-xl transition-colors"
          >
            {t("start")}
          </Link>
        </div>
      </div>
    </header>
  );
}
