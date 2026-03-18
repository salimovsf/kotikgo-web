"use client";

import { useState } from "react";

interface WidgetProps {
  data: Record<string, unknown>;
}

function ExpandButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-bold text-[var(--accent)] hover:underline shrink-0"
    >
      {expanded ? "← Назад" : "Все варианты"}
    </button>
  );
}

function ActionButton({ text, type }: { text: string; type: "book" | "link" }) {
  if (type === "book") {
    return (
      <button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0">
        {text}
      </button>
    );
  }
  return (
    <button className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shrink-0">
      {text}
    </button>
  );
}

/* ═══════ FLIGHTS ═══════ */
export function FlightsWidget({ data }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const best = data.best as { airline: string; stops: string; time: string; price: string };
  const variants = (data.variants as typeof best[]) || [];

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Collapsed */}
      <div className="flex items-center gap-2.5 p-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-sm shrink-0">✈️</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-[var(--text)]">{data.from as string} → {data.to as string}</div>
          <div className="text-[11px] text-[var(--text-3)]">{data.date as string} · {best.airline} · {best.stops}</div>
        </div>
        <div className="text-[13px] font-extrabold text-[var(--accent)] shrink-0">{best.price}</div>
        <ActionButton text="Купить →" type="link" />
      </div>

      {/* Toggle */}
      <div className="px-3 pb-2 flex justify-between items-center">
        <span className="text-[10px] text-[var(--text-3)]">{variants.length > 0 ? `Ещё ${variants.length} вариантов` : ""}</span>
        {variants.length > 0 && <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />}
      </div>

      {/* Expanded */}
      {expanded && variants.length > 0 && (
        <div className="border-t border-[var(--border)]">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg)] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--text)]">{v.airline}</div>
                <div className="text-[11px] text-[var(--text-3)]">{v.stops} · {v.time}</div>
              </div>
              <div className="text-[12.5px] font-bold text-[var(--text)] shrink-0">{v.price}</div>
              <ActionButton text="Купить →" type="link" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════ TRANSFER ═══════ */
export function TransferWidget({ data }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const best = data.best as { type: string; passengers: string; price: string };
  const variants = (data.variants as typeof best[]) || [];

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 p-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-sm shrink-0">🚐</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-[var(--text)]">{data.from as string} → {data.to as string}</div>
          <div className="text-[11px] text-[var(--text-3)]">{best.type} · до {best.passengers} чел.</div>
        </div>
        <div className="text-[13px] font-extrabold text-[var(--accent)] shrink-0">{best.price}</div>
        <ActionButton text="Забронировать" type="book" />
      </div>

      <div className="px-3 pb-2 flex justify-between items-center">
        <span className="text-[10px] text-[var(--text-3)]">{variants.length > 0 ? `Ещё ${variants.length} вариантов` : ""}</span>
        {variants.length > 0 && <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />}
      </div>

      {expanded && variants.length > 0 && (
        <div className="border-t border-[var(--border)]">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg)] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--text)]">{v.type}</div>
                <div className="text-[11px] text-[var(--text-3)]">до {v.passengers} чел.</div>
              </div>
              <div className="text-[12.5px] font-bold text-[var(--text)] shrink-0">{v.price}</div>
              <ActionButton text="Забронировать" type="book" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════ HOTEL ═══════ */
export function HotelWidget({ data }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const best = data.best as { name: string; rating: string; area: string; price: string };
  const variants = (data.variants as typeof best[]) || [];

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 p-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-sm shrink-0">🏠</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-[var(--text)]">{data.location as string} · {data.nights as string} ночей</div>
          <div className="text-[11px] text-[var(--text-3)]">{best.name} · ★{best.rating} · {best.area}</div>
        </div>
        <div className="text-[13px] font-extrabold text-[var(--accent)] shrink-0">{best.price}</div>
        <ActionButton text="Смотреть →" type="link" />
      </div>

      <div className="px-3 pb-2 flex justify-between items-center">
        <span className="text-[10px] text-[var(--text-3)]">{variants.length > 0 ? `Ещё ${variants.length} вариантов` : ""}</span>
        {variants.length > 0 && <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />}
      </div>

      {expanded && variants.length > 0 && (
        <div className="border-t border-[var(--border)]">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg)] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--text)]">{v.name}</div>
                <div className="text-[11px] text-[var(--text-3)]">★{v.rating} · {v.area}</div>
              </div>
              <div className="text-[12.5px] font-bold text-[var(--text)] shrink-0">{v.price}</div>
              <ActionButton text="Смотреть →" type="link" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════ ESIM ═══════ */
export function EsimWidget({ data }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const best = data.best as { operator: string; gb: string; days: string; price: string };
  const variants = (data.variants as typeof best[]) || [];

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 p-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-sm shrink-0">📶</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-[var(--text)]">eSIM {data.country as string}</div>
          <div className="text-[11px] text-[var(--text-3)]">{best.operator} · {best.gb} ГБ · {best.days} дней</div>
        </div>
        <div className="text-[13px] font-extrabold text-[var(--accent)] shrink-0">{best.price}</div>
        <ActionButton text="Купить" type="book" />
      </div>

      {variants.length > 0 && (
        <div className="px-3 pb-2 flex justify-between items-center">
          <span className="text-[10px] text-[var(--text-3)]">Ещё {variants.length} тарифов</span>
          <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
        </div>
      )}

      {expanded && variants.length > 0 && (
        <div className="border-t border-[var(--border)]">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg)] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--text)]">{v.operator} · {v.gb} ГБ</div>
                <div className="text-[11px] text-[var(--text-3)]">{v.days} дней</div>
              </div>
              <div className="text-[12.5px] font-bold text-[var(--text)] shrink-0">{v.price}</div>
              <ActionButton text="Купить" type="book" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════ INSURANCE ═══════ */
export function InsuranceWidget({ data }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const best = data.best as { name: string; coverage: string; includes: string; price: string };
  const variants = (data.variants as typeof best[]) || [];

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 p-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-sm shrink-0">🛡️</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-[var(--text)]">Страховка · {data.days as string} дней</div>
          <div className="text-[11px] text-[var(--text-3)]">{best.name} · покрытие {best.coverage}</div>
        </div>
        <div className="text-[13px] font-extrabold text-[var(--accent)] shrink-0">{best.price}</div>
        <ActionButton text="Оформить" type="book" />
      </div>

      {variants.length > 0 && (
        <div className="px-3 pb-2 flex justify-between items-center">
          <span className="text-[10px] text-[var(--text-3)]">Ещё {variants.length} вариантов</span>
          <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
        </div>
      )}

      {expanded && variants.length > 0 && (
        <div className="border-t border-[var(--border)]">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg)] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--text)]">{v.name}</div>
                <div className="text-[11px] text-[var(--text-3)]">покрытие {v.coverage} · {v.includes}</div>
              </div>
              <div className="text-[12.5px] font-bold text-[var(--text)] shrink-0">{v.price}</div>
              <ActionButton text="Оформить" type="book" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════ CHECKLIST ═══════ */
export function ChecklistWidget({ data }: WidgetProps) {
  const items = data.items as { text: string; done: boolean }[];
  const [checks, setChecks] = useState(items.map((i) => i.done));

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-3">
      <div className="text-[12px] font-bold text-[var(--text)] mb-2">✅ Чек-лист</div>
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg)] cursor-pointer transition-colors"
            onClick={() => setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)))}
          >
            <div
              className={`w-4 h-4 rounded shrink-0 flex items-center justify-center text-[9px] border-2 transition-colors ${
                checks[i]
                  ? "bg-[var(--green)] border-[var(--green)] text-white"
                  : "border-[var(--border)]"
              }`}
            >
              {checks[i] && "✓"}
            </div>
            <span className={`text-[12px] ${checks[i] ? "line-through text-[var(--text-3)]" : "text-[var(--text)]"}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ INFO ═══════ */
export function InfoWidget({ data }: WidgetProps) {
  const items = data.items as { label: string; value: string }[];

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-3">
      <div className="text-[12px] font-bold text-[var(--text)] mb-2">📋 Полезная информация</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {items.map((item, i) => (
          <div key={i}>
            <span className="text-[11px] text-[var(--text-3)]">{item.label}: </span>
            <span className="text-[12px] font-semibold text-[var(--text)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ WIDGET ROUTER ═══════ */
const WIDGET_MAP: Record<string, React.ComponentType<WidgetProps>> = {
  flights: FlightsWidget,
  transfer: TransferWidget,
  hotel: HotelWidget,
  esim: EsimWidget,
  insurance: InsuranceWidget,
  checklist: ChecklistWidget,
  info: InfoWidget,
};

export function renderWidget(type: string, data: Record<string, unknown>) {
  const Widget = WIDGET_MAP[type];
  if (!Widget) return null;
  return <Widget data={data} />;
}
