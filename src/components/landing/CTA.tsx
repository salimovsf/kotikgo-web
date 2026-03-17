"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="py-18 md:py-20 text-center bg-white border-t border-[var(--border)]">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-[var(--text)]">
        {t("title")}{" "}
        <span className="text-[var(--accent)]">{t("title2")}</span>
      </h2>
      <p className="text-base text-[var(--text-2)] mb-7">{t("desc")}</p>
      <Link
        href="/chat"
        className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-[0_6px_24px_rgba(255,90,60,0.2)] transition-all hover:-translate-y-0.5"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        {t("button")}
      </Link>
    </section>
  );
}
