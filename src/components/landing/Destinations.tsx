"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

const DESTINATIONS = [
  { name: "Bali", country: "Indonesia", nameRu: "Бали", countryRu: "Индонезия", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=300&fit=crop" },
  { name: "Istanbul", country: "Turkey", nameRu: "Стамбул", countryRu: "Турция", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=500&h=300&fit=crop" },
  { name: "Dubai", country: "UAE", nameRu: "Дубай", countryRu: "ОАЭ", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=300&fit=crop" },
  { name: "Phuket", country: "Thailand", nameRu: "Пхукет", countryRu: "Таиланд", img: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=500&h=300&fit=crop" },
];

export function Destinations() {
  const t = useTranslations("destinations");

  return (
    <section id="destinations" className="py-20 bg-[var(--bg)]">
      <div className="max-w-[1120px] mx-auto px-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--text)] tracking-tight">
            {t("title")}
          </h2>
          <a href="#" className="text-sm font-bold text-[var(--accent)] hover:underline">
            {t("all")} →
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {DESTINATIONS.map((d) => (
            <a
              key={d.name}
              href={`/destinations/${d.name.toLowerCase()}`}
              className="rounded-2xl overflow-hidden relative h-44 lg:h-[180px] block group"
            >
              <img
                src={d.img}
                alt={d.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <strong className="text-base font-extrabold">{d.nameRu}</strong>
                <span className="text-[11px] opacity-75 mt-0.5">{d.countryRu}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
