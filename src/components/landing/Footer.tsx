"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="py-9 px-8 bg-[var(--bg)] border-t border-[var(--border)]">
      <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-5 flex-wrap">
          <a href="#services" className="text-sm text-[var(--text-2)] hover:text-[var(--accent)] transition-colors">
            {t("services")}
          </a>
          <a href="#destinations" className="text-sm text-[var(--text-2)] hover:text-[var(--accent)] transition-colors">
            {t("destinations")}
          </a>
          <a href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--accent)] transition-colors">
            {t("support")}
          </a>
          <a href="mailto:hello@kotikgo.com" className="text-sm text-[var(--text-2)] hover:text-[var(--accent)] transition-colors">
            hello@kotikgo.com
          </a>
        </div>
        <div className="flex gap-3">
          <Link href="/" locale="ru" className="text-xs font-semibold text-[var(--accent)]">Русский</Link>
          <Link href="/" locale="en" className="text-xs font-semibold text-[var(--text-3)] hover:text-[var(--accent)]">English</Link>
          <Link href="/" locale="tr" className="text-xs font-semibold text-[var(--text-3)] hover:text-[var(--accent)]">Türkçe</Link>
        </div>
        <div className="text-xs text-[var(--text-3)]">© 2025 KotikGo</div>
      </div>
    </footer>
  );
}
