"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

function ServiceCard({ icon, title, sub, action, actionType }: {
  icon: string; title: string; sub: string; action: string; actionType: "book" | "link";
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white border border-[var(--border)] rounded-xl p-2.5 hover:border-[rgba(255,90,60,0.2)] transition-colors">
      <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-sm shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-bold text-[var(--text)]">{title}</div>
        <div className="text-[11.5px] text-[var(--text-3)]">{sub}</div>
      </div>
      {actionType === "book" ? (
        <button className="shrink-0 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors">
          {action}
        </button>
      ) : (
        <button className="shrink-0 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all">
          {action}
        </button>
      )}
    </div>
  );
}

function CheckItem({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[var(--border)] rounded-lg text-xs text-[var(--text)]">
      <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center text-[9px] border-2 ${
        done ? "bg-[var(--green)] border-[var(--green)] text-white" : "border-[var(--border)]"
      }`}>
        {done && "✓"}
      </div>
      {text}
    </div>
  );
}

export function ChatArea() {
  const t = useTranslations("chat");
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-12 px-5 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <div className="text-[13px] font-bold text-[var(--text)]">🌴 Бали — 1-14 апреля</div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-semibold text-[var(--green)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[var(--green)] rounded-full" />
            {t("online")}
          </div>
          <button className="text-[11px] font-semibold text-[var(--text-2)] bg-[var(--bg)] border border-[var(--border)] px-2.5 py-1 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
            📋 {t("checklist")}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-7">
        <div className="max-w-[700px] mx-auto px-5 flex flex-col gap-5">
          {/* AI greeting */}
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs text-white shrink-0 mt-0.5">🐱</div>
            <div className="max-w-[580px]">
              <div className="bg-[var(--bg)] text-[var(--text)] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
                {t("greeting")} 😊
              </div>
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[580px]">
              <div className="bg-[var(--accent)] text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
                Хочу на Бали в апреле на 2 недели, вдвоём. Бюджет средний.
              </div>
            </div>
          </div>

          {/* AI response with cards */}
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs text-white shrink-0 mt-0.5">🐱</div>
            <div className="max-w-[580px] flex flex-col gap-1.5">
              <div className="bg-[var(--bg)] text-[var(--text)] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
                Апрель — начало сухого сезона, 28-30°C, мало дождей. Создал поездку <strong className="text-[var(--accent)]">Бали, 1-14 апреля</strong>. Вот план:
                <div className="flex flex-col gap-1.5 mt-3">
                  <ServiceCard icon="✈️" title="Москва → Денпасар" sub="1 апр · Qatar Airways · от 42 000 ₽" action="Купить →" actionType="link" />
                  <ServiceCard icon="🚐" title="Трансфер аэропорт → Убуд" sub="Sedan, 2 чел. · от $18" action={t("book")} actionType="book" />
                  <ServiceCard icon="🏠" title="Виллы в Убуде" sub="14 ночей · от $28/ночь" action={`${t("view")} →`} actionType="link" />
                  <ServiceCard icon="📶" title="eSIM Индонезия" sub="15 ГБ · 14 дней" action={`$9 · ${t("buy")}`} actionType="book" />
                  <ServiceCard icon="🛡️" title="Страховка" sub="14 дней · $50 000 покрытие" action={`$22 · ${t("buy")}`} actionType="book" />
                </div>
              </div>

              <div className="bg-[var(--bg)] text-[var(--text)] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
                Чек-лист для Бали:
                <div className="flex flex-col gap-1 mt-2.5">
                  <CheckItem done text="Виза — не нужна до 30 дней" />
                  <CheckItem done={false} text="Билеты" />
                  <CheckItem done={false} text="Трансфер" />
                  <CheckItem done={false} text="Жильё" />
                  <CheckItem done={false} text="eSIM" />
                  <CheckItem done={false} text="Страховка" />
                  <CheckItem done text="Розетки — тип C, переходник не нужен" />
                </div>
              </div>
            </div>
          </div>

          {/* User question */}
          <div className="flex justify-end">
            <div className="max-w-[580px]">
              <div className="bg-[var(--accent)] text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
                Убуд или Семиньяк — где лучше жить?
              </div>
            </div>
          </div>

          {/* AI answer */}
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs text-white shrink-0 mt-0.5">🐱</div>
            <div className="max-w-[580px]">
              <div className="bg-[var(--bg)] text-[var(--text)] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
                <strong className="text-[var(--accent)]">Убуд</strong> — рисовые террасы, йога, тишина. Виллы дешевле. Минус: 1.5 ч до пляжа.
                <br /><br />
                <strong className="text-[var(--accent)]">Семиньяк</strong> — пляж, рестораны, серфинг. Дороже, шумнее.
                <br /><br />
                Мой совет: неделю Убуд, неделю Семиньяк. Трансфер между ними ~$15. Спланировать так?
              </div>
            </div>
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-[var(--border)] shrink-0">
        <div className="max-w-[700px] mx-auto flex gap-2 items-end">
          <div className="flex-1 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl flex items-end transition-colors focus-within:border-[var(--accent)] p-1">
            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text)] px-3 py-2.5 resize-none max-h-24 leading-relaxed placeholder:text-[var(--text-3)]"
              rows={1}
              placeholder={t("placeholder")}
              value={input}
              onChange={handleInput}
            />
            <div className="flex gap-0.5 p-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text-2)] text-sm transition-colors">📎</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text-2)] text-sm transition-colors">🎤</button>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] flex items-center justify-center shrink-0 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
        <div className="text-center text-[10px] text-[var(--text-3)] mt-1.5 max-w-[700px] mx-auto">
          {t("disclaimer")}
        </div>
      </div>
    </div>
  );
}
