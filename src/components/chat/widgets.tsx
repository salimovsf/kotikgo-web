"use client";

import { useState, useEffect } from "react";

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

/* ═══════ FLIGHT ROW ═══════ */
interface FlightInfo {
  airline: string;
  dep_airport?: string;
  arr_airport?: string;
  departure?: string;
  duration?: string;
  stops: string;
  price: string;
  gate?: string;
  link?: string;
  time?: string; // fallback
}

const MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function formatDepDate(raw: string): string {
  if (!raw) return "";
  // Already in Russian format like "3 мая 10:00"
  if (/[а-яё]/i.test(raw)) return raw;
  // ISO-like: "2026-05-03 10:00" or "2026-05-03T10:00"
  const match = raw.match(/(\d{4})-(\d{2})-(\d{2})[T ]?(\d{2}:\d{2})?/);
  if (match) {
    const day = parseInt(match[3], 10);
    const month = parseInt(match[2], 10) - 1;
    const time = match[4] || "";
    return `${day} ${MONTHS_RU[month] || ""}${time ? " " + time : ""}`;
  }
  return raw;
}

const MARKER = "567508";

function ensureMarker(link: string): string {
  if (link.includes("marker=")) return link;
  return link + (link.includes("?") ? "&" : "?") + `marker=${MARKER}`;
}

function isValidLink(link?: string): boolean {
  if (!link) return false;
  return link.includes("aviasales.ru/search/") && link.length > 35;
}

function FlightRow({ f, compact, fallbackLink }: { f: FlightInfo; compact?: boolean; fallbackLink?: string }) {
  const dep = formatDepDate(f.departure || "");
  const duration = f.duration || f.time || "";
  const rawLink = isValidLink(f.link) ? f.link! : fallbackLink;
  const buyLink = rawLink ? ensureMarker(rawLink) : undefined;

  return (
    <div className={`flex items-center gap-2.5 ${compact ? "px-3 py-2" : "p-3"} hover:bg-[var(--bg)] transition-colors`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12.5px] font-bold text-[var(--text)]">{f.airline}</span>
          {f.gate && <span className="text-[10px] text-[var(--text-3)] bg-[var(--bg)] px-1.5 py-0.5 rounded">{f.gate}</span>}
        </div>
        <div className="text-[11px] text-[var(--text-3)] mt-0.5">
          {dep && <span>{dep} · </span>}
          {f.dep_airport && f.arr_airport && <span>{f.dep_airport} → {f.arr_airport} · </span>}
          {duration && <span>{duration} · </span>}
          <span>{f.stops}</span>
        </div>
      </div>
      <div className="text-[13px] font-extrabold text-[var(--accent)] shrink-0 whitespace-nowrap">{f.price}</div>
      {buyLink ? (
        <a href={buyLink} target="_blank" rel="noopener noreferrer"
          className="shrink-0 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all">
          Проверить цену →
        </a>
      ) : (
        <ActionButton text="Купить →" type="link" />
      )}
    </div>
  );
}

/* ═══════ FLIGHTS ═══════ */
export function FlightsWidget({ data }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const best = data.best as FlightInfo;
  const variants = (data.variants as FlightInfo[]) || [];
  const rawMoreLink = data.more_link as string | undefined;
  const moreLink = rawMoreLink ? ensureMarker(rawMoreLink) : undefined;

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Best option */}
      <div className="border-b border-[var(--border)]">
        <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5">
          <span className="text-sm">✈️</span>
          <span className="text-[12px] font-bold text-[var(--text)]">{data.from as string} → {data.to as string}</span>
        </div>
        <FlightRow f={best} fallbackLink={moreLink} />
      </div>

      {/* Toggle */}
      {variants.length > 0 && (
        <div className="px-3 py-2 flex justify-between items-center">
          <span className="text-[10px] text-[var(--text-3)]">
            Ещё {variants.length} рейсов
          </span>
          <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
        </div>
      )}

      {/* Expanded variants */}
      {expanded && variants.length > 0 && (
        <div className="border-t border-[var(--border)]">
          {variants.map((v, i) => (
            <div key={i} className="border-b border-[var(--border)] last:border-b-0">
              <FlightRow f={v} compact fallbackLink={moreLink} />
            </div>
          ))}
        </div>
      )}

      {/* Always show action links */}
      <div className="border-t border-[var(--border)] flex">
        <a href={`/ru/flights?from=${encodeURIComponent(data.from as string || "")}&to=${encodeURIComponent(data.to as string || "")}`}
          className="flex-1 text-center py-2.5 text-[12px] font-bold text-[var(--accent)] hover:bg-[var(--bg)] transition-colors">
          Поиск с реальными ценами →
        </a>
        {moreLink && (
          <a href={moreLink} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-2.5 text-[12px] font-bold text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg)] transition-colors border-l border-[var(--border)]">
            На Aviasales →
          </a>
        )}
      </div>
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

/* ═══════ PHOTO LIGHTBOX ═══════ */
function PhotoLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white text-2xl font-bold hover:opacity-70" onClick={onClose}>✕</button>
      <img src={src.replace(/=w\d+/, "=w800").replace(/=h\d+/, "=h600")} alt={alt} className="max-w-full max-h-[85vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
    </div>
  );
}

/* ═══════ HOTEL ═══════ */
interface RealHotel {
  name: string;
  rating?: number;
  price?: number;
  currency?: string;
  stars?: number;
  photo?: string;
  amenities?: string[];
  reviews_count?: number;
  url?: string;
}

export function HotelWidget({ data }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [realHotels, setRealHotels] = useState<RealHotel[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ src: string; alt: string } | null>(null);

  const location = data.location as string || "";
  const checkIn = data.check_in as string || "";
  const checkOut = data.check_out as string || "";

  // Auto-fetch real prices on mount
  useEffect(() => {
    if (loaded || loading || !location) return;
    setLoading(true);

    fetch(`/api/hotels?city=${encodeURIComponent(location)}&check_in=${checkIn}&check_out=${checkOut}`)
      .then(r => r.json())
      .then(d => {
        if (d.hotels && d.hotels.length > 0) {
          setRealHotels(d.hotels);
        }
        setLoaded(true);
        setLoading(false);
      })
      .catch(() => {
        setLoaded(true);
        setLoading(false);
      });
  }, [location, checkIn, checkOut, loaded, loading]);

  // If real hotels loaded — show them
  const hotels = realHotels || [];
  const best = hotels[0];
  const variants = hotels.slice(1);

  // Fallback to AI data if no real hotels
  const aiBest = data.best as { name: string; rating: string; area: string; price: string } | undefined;
  const aiVariants = (data.variants as typeof aiBest[]) || [];

  if (loading) {
    return (
      <div className="bg-white border border-[var(--border)] rounded-xl p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🏠</span>
          <span className="text-[12px] font-bold text-[var(--text)]">Отели в {location}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-[var(--text-3)]">Ищу лучшие цены...</span>
        </div>
      </div>
    );
  }

  function bookingLink(hotelName: string) {
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotelName + " " + location)}&checkin=${checkIn}&checkout=${checkOut}&aid=2369041`;
  }

  function HotelCard({ h, compact }: { h: RealHotel; compact?: boolean }) {
    const photoSize = compact ? "w-12 h-12" : "w-20 h-20";
    return (
      <div className={`flex gap-3 ${compact ? "px-3 py-2" : "p-3"} items-start hover:bg-[var(--bg)] transition-colors`}>
        {h.photo && (
          <img
            src={h.photo}
            alt={h.name}
            className={`${photoSize} rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => setLightboxPhoto({ src: h.photo!, alt: h.name })}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className={`${compact ? "text-[12px]" : "text-[13px]"} font-bold text-[var(--text)]`}>{h.name}</div>
          <div className="text-[11px] text-[var(--text-3)] mt-0.5">
            {h.rating && <span>★{h.rating} </span>}
            {h.reviews_count && <span>({h.reviews_count}) </span>}
            {h.stars && <span>{"⭐".repeat(h.stars)} </span>}
          </div>
          {h.amenities && h.amenities.length > 0 && (
            <div className="text-[10px] text-[var(--text-3)] mt-0.5">{h.amenities.slice(0, 4).join(" · ")}</div>
          )}
          {!compact && (
            <div className="flex gap-2 mt-1.5">
              <a href={bookingLink(h.name)} target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-2.5 py-1 rounded-md transition-colors">
                Booking.com
              </a>
              {h.url && (
                <a href={h.url} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[var(--text-2)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] px-2.5 py-1 rounded-md transition-colors">
                  Фото и отзывы
                </a>
              )}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className={`${compact ? "text-[12px]" : "text-[14px]"} font-extrabold text-[var(--accent)]`}>
            {h.price ? `${h.price.toLocaleString("ru")} ${h.currency || ""}` : ""}
          </div>
          <div className="text-[10px] text-[var(--text-3)]">за всё</div>
          {compact && (
            <a href={bookingLink(h.name)} target="_blank" rel="noopener noreferrer"
              className="text-[9px] font-bold text-[var(--accent)] hover:underline mt-0.5 block">
              Booking →
            </a>
          )}
        </div>
      </div>
    );
  }

  if (best) {
    return (
      <>
        {lightboxPhoto && <PhotoLightbox src={lightboxPhoto.src} alt={lightboxPhoto.alt} onClose={() => setLightboxPhoto(null)} />}
        <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 border-b border-[var(--border)]">
            <span className="text-sm">🏠</span>
            <span className="text-[12px] font-bold text-[var(--text)]">Отели в {location}</span>
            <span className="text-[10px] text-[var(--text-3)]">реальные цены</span>
          </div>

          <HotelCard h={best} />

          {variants.length > 0 && (
            <div className="px-3 py-2 flex justify-between items-center border-t border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-3)]">Ещё {variants.length} отелей</span>
              <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
            </div>
          )}

          {expanded && variants.map((h, i) => (
            <div key={i} className="border-t border-[var(--border)]">
              <HotelCard h={h} compact />
            </div>
          ))}
        </div>
      </>
    );
  }

  // Fallback: AI-generated hotels (no real prices)
  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 p-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-sm shrink-0">🏠</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-[var(--text)]">{location} · {data.nights as string || ""}</div>
          {aiBest && <div className="text-[11px] text-[var(--text-3)]">{aiBest.name} · ★{aiBest.rating}</div>}
        </div>
        {aiBest && <div className="text-[13px] font-extrabold text-[var(--accent)] shrink-0">{aiBest.price}</div>}
      </div>

      {aiVariants.length > 0 && (
        <div className="px-3 pb-2 flex justify-between items-center">
          <span className="text-[10px] text-[var(--text-3)]">Ещё {aiVariants.length} вариантов</span>
          <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
        </div>
      )}

      {expanded && aiVariants.map((v, i) => v && (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-t border-[var(--border)] hover:bg-[var(--bg)]">
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-[var(--text)]">{v.name}</div>
            <div className="text-[11px] text-[var(--text-3)]">★{v.rating} · {v.area}</div>
          </div>
          <div className="text-[12.5px] font-bold text-[var(--text)] shrink-0">{v.price}</div>
        </div>
      ))}

      <div className="border-t border-[var(--border)]">
        <a href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location)}&aid=2369041`}
          target="_blank" rel="noopener noreferrer"
          className="block text-center py-2.5 text-[12px] font-bold text-[var(--accent)] hover:bg-[var(--bg)] transition-colors">
          Смотреть на Booking.com →
        </a>
      </div>
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
  info: InfoWidget,
};

export function renderWidget(type: string, data: Record<string, unknown>) {
  const Widget = WIDGET_MAP[type];
  if (!Widget) return null;
  return <Widget data={data} />;
}
