"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="py-20 md:py-24 text-center bg-gradient-to-b from-white to-[var(--bg)]">
      <div className="max-w-[640px] mx-auto px-8">
        <div className="inline-flex items-center gap-1.5 bg-[var(--accent-bg)] text-[var(--accent)] px-3.5 py-1.5 rounded-full text-xs font-bold mb-7">
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
          {t("badge")}
        </div>

        <h1 className="text-4xl md:text-5xl font-black leading-[1.06] tracking-tight mb-5">
          {t("title1")}
          <br />
          <span className="bg-gradient-to-r from-[var(--accent)] to-[#FF8F6B] bg-clip-text text-transparent">
            {t("title2")}
          </span>
        </h1>

        <p className="text-base md:text-lg text-[var(--text-2)] leading-relaxed mb-9 max-w-md mx-auto">
          {t("desc")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-7 py-4 rounded-2xl font-bold text-base shadow-[0_6px_24px_rgba(255,90,60,0.2)] transition-all hover:-translate-y-0.5"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {t("cta")}
          </Link>
          <a
            href="#services"
            className="inline-flex items-center justify-center bg-[var(--bg)] text-[var(--text)] border-2 border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-7 py-4 rounded-2xl font-bold text-base transition-all"
          >
            {t("more")}
          </a>
        </div>

        <div className="flex gap-8 justify-center pt-8 border-t border-[var(--border)]">
          <div>
            <div className="text-2xl font-black text-[var(--text)]">12 000+</div>
            <div className="text-xs text-[var(--text-3)]">{t("stat_trips")}</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[var(--text)]">80+</div>
            <div className="text-xs text-[var(--text-3)]">{t("stat_countries")}</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[var(--text)]">24/7</div>
            <div className="text-xs text-[var(--text-3)]">{t("stat_online")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
