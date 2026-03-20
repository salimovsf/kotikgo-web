"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";

export default function FlightsPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const script = document.createElement("script");
    script.async = true;
    script.type = "module";
    script.src = "https://tpwgts.com/wl_web/main.js?wl_id=15252";
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-dvh bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-[1120px] mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight">
            Kotik<span className="text-[var(--accent)]">Go</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="text-sm font-semibold text-[var(--text-2)] hover:text-[var(--accent)] transition-colors"
            >
              ← Вернуться в чат
            </Link>
          </div>
        </div>
      </header>

      {/* Title */}
      <div className="max-w-[1120px] mx-auto px-8 py-6">
        <h1 className="text-2xl font-black text-[var(--text)]">
          ✈️ Авиабилеты{from && to ? ` ${from} → ${to}` : ""}
        </h1>
        <p className="text-sm text-[var(--text-2)] mt-1">
          Актуальные цены от всех авиакомпаний
        </p>
      </div>

      {/* White Label Widget */}
      <div className="max-w-[1120px] mx-auto px-8 pb-12">
        <div id="tpwl-search"></div>
        <div id="tpwl-tickets"></div>
      </div>
    </div>
  );
}
