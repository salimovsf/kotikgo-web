"use client";

import { useTranslations } from "next-intl";

const ITEMS = [
  { icon: "✈️", key: "flights" },
  { icon: "🚐", key: "transfers" },
  { icon: "🏠", key: "hotels" },
  { icon: "📶", key: "esim" },
  { icon: "🛡️", key: "insurance" },
  { icon: "🤖", key: "ai" },
] as const;

export function Services() {
  const t = useTranslations("services");

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-[1120px] mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ITEMS.map(({ icon, key }) => (
            <div
              key={key}
              className="p-7 rounded-2xl border border-[var(--border)] hover:border-[rgba(255,90,60,0.2)] hover:shadow-[0_4px_20px_rgba(255,90,60,0.06)] transition-all"
            >
              <div className="text-2xl mb-3.5">{icon}</div>
              <h3 className="text-[15px] font-extrabold text-[var(--text)] mb-1">
                {t(key)}
              </h3>
              <p className="text-[13px] text-[var(--text-2)] leading-relaxed">
                {t(`${key}_desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
