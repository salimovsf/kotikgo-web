// IATA codes for common cities (for resolving city names to codes)
// Map stem (корень) → IATA. We match by substring to handle Russian cases (падежи)
const CITY_STEMS: Array<{ stems: string[]; code: string }> = [
  { stems: ["москв", "moscow"], code: "MOW" },
  { stems: ["петербург", "питер"], code: "LED" },
  { stems: ["стамбул", "istanbul"], code: "IST" },
  { stems: ["антал", "antalya"], code: "AYT" },
  { stems: ["бали", "денпасар", "bali"], code: "DPS" },
  { stems: ["бангкок", "bangkok"], code: "BKK" },
  { stems: ["пхукет", "phuket"], code: "HKT" },
  { stems: ["дубай", "дубаи", "dubai"], code: "DXB" },
  { stems: ["барселон", "barcelona"], code: "BCN" },
  { stems: ["рим", "rome", "roma"], code: "FCO" },
  { stems: ["париж", "paris"], code: "PAR" },
  { stems: ["лондон", "london"], code: "LON" },
  { stems: ["мальдив", "мале", "maldives"], code: "MLE" },
  { stems: ["шри-ланк", "коломбо", "sri lanka"], code: "CMB" },
  { stems: ["гоа", "goa"], code: "GOA" },
  { stems: ["тбилис", "tbilisi"], code: "TBS" },
  { stems: ["ереван", "yerevan"], code: "EVN" },
  { stems: ["алмат", "almaty"], code: "ALA" },
  { stems: ["ташкент", "tashkent"], code: "TAS" },
  { stems: ["сочи", "sochi"], code: "AER" },
  { stems: ["казан", "kazan"], code: "KZN" },
  { stems: ["афин", "athens"], code: "ATH" },
  { stems: ["каир", "cairo"], code: "CAI" },
  { stems: ["хургад", "hurghada"], code: "HRG" },
  { stems: ["шарм", "sharm"], code: "SSH" },
  { stems: ["канкун", "cancun"], code: "CUN" },
  { stems: ["сеул", "seoul"], code: "SEL" },
  { stems: ["токио", "tokyo"], code: "TYO" },
  { stems: ["сингапур", "singapore"], code: "SIN" },
  { stems: ["нячанг", "nha trang"], code: "NHA" },
  { stems: ["хошимин", "ho chi minh"], code: "SGN" },
  { stems: ["ханой", "hanoi"], code: "HAN" },
  { stems: ["куала", "kuala lumpur"], code: "KUL" },
  { stems: ["екатеринбург", "yekaterinburg"], code: "SVX" },
  { stems: ["новосибирск", "novosibirsk"], code: "OVB" },
  { stems: ["каш", "kas "], code: "_KAS" },
  { stems: ["калкан", "kalkan"], code: "_KAL" },
  { stems: ["кемер", "kemer"], code: "_KEM" },
  { stems: ["белек", "belek"], code: "_BEL" },
  { stems: ["сиде", "side"], code: "_SID" },
  { stems: ["алани", "alanya"], code: "_ALA_TR" },
  { stems: ["фетхие", "fethiye"], code: "_FET" },
  { stems: ["бодрум", "bodrum"], code: "BJV" },
  { stems: ["мармарис", "marmaris"], code: "_MAR" },
  { stems: ["далян", "dalyan"], code: "_DLY" },
  { stems: ["тенериф", "tenerife"], code: "TFS" },
  { stems: ["прага", "prague"], code: "PRG" },
  { stems: ["будапешт", "budapest"], code: "BUD" },
  { stems: ["милан", "milan"], code: "MIL" },
  { stems: ["берлин", "berlin"], code: "BER" },
];

function findIATA(text: string): { origin: string | null; destination: string | null } {
  const lower = text.toLowerCase();

  // Find all city matches with their position in text
  const matches: Array<{ code: string; position: number }> = [];

  for (const { stems, code } of CITY_STEMS) {
    if (matches.some(m => m.code === code)) continue;
    let earliest = Infinity;
    for (const stem of stems) {
      const pos = lower.indexOf(stem);
      if (pos !== -1 && pos < earliest) {
        earliest = pos;
      }
    }
    if (earliest < Infinity) {
      matches.push({ code, position: earliest });
    }
  }

  // Sort by position in text — first mentioned = origin, second = destination
  matches.sort((a, b) => a.position - b.position);

  // If only one city found, don't assume origin — AI will ask
  if (matches.length === 1) {
    return { origin: null, destination: matches[0].code };
  }
  if (matches.length >= 2) {
    return { origin: matches[0].code, destination: matches[1].code };
  }
  return { origin: null, destination: null };
}

// Airline names cache
let airlineNames: Record<string, string> = {};
let airlinesLoaded = false;

async function loadAirlines() {
  if (airlinesLoaded) return;
  try {
    const res = await fetch("https://api.travelpayouts.com/data/en/airlines.json");
    const data = await res.json();
    for (const a of data) {
      if (!a.code) continue;
      airlineNames[a.code] = a.name_translations?.ru || a.name || a.code;
    }
    airlinesLoaded = true;
  } catch {}
}

// Airport names
const AIRPORTS: Record<string, string> = {
  SVO: "Шереметьево", DME: "Домодедово", VKO: "Внуково", ZIA: "Жуковский",
  AYT: "Анталья", IST: "Стамбул", SAW: "Сабиха Гёкчен",
  DPS: "Денпасар (Бали)", BKK: "Суварнабхуми", HKT: "Пхукет",
  DXB: "Дубай", BCN: "Барселона", FCO: "Рим Фьюмичино",
  CDG: "Париж Шарль-де-Голль", LHR: "Лондон Хитроу",
  MLE: "Мале (Мальдивы)", HRG: "Хургада", SSH: "Шарм-эль-Шейх",
  ATH: "Афины", TBS: "Тбилиси", EVN: "Ереван",
  ALA: "Алматы", TAS: "Ташкент", LED: "Пулково",
  AER: "Сочи", KZN: "Казань", SVX: "Екатеринбург",
  GZP: "Газипаша (Алания)", DLM: "Даламан",
  BJV: "Бодрум", CUN: "Канкун", GYD: "Баку",
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}м`;
  if (m === 0) return `${h}ч`;
  return `${h}ч ${m}м`;
}

function stopsText(n: number): string {
  if (n === 0) return "прямой";
  if (n === 1) return "1 пересадка";
  return `${n} пересадки`;
}

const MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function formatDateRu(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
  } catch {
    return isoDate.slice(0, 10);
  }
}

function formatTimeFromISO(isoDate: string): string {
  try {
    return isoDate.slice(11, 16); // "HH:MM"
  } catch {
    return "";
  }
}

// Fetch real prices from Travelpayouts
async function fetchFlights(origin: string, destination: string, dateStr?: string): Promise<string> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) return "";

  await loadAirlines();

  const params = new URLSearchParams({
    origin,
    destination,
    currency: "RUB",
    token,
    group_by: "departure_at",
    sorting: "price",
    limit: "15",
  });

  if (dateStr) params.set("departure_at", dateStr);

  try {
    const res = await fetch(`https://api.travelpayouts.com/aviasales/v3/grouped_prices?${params}`);
    if (!res.ok) return "";

    const data = await res.json();
    if (!data.success || !data.data) return "";

    const flights = Object.values(data.data)
      .map((f: unknown) => {
        const fl = f as Record<string, unknown>;
        const airlineName = airlineNames[fl.airline as string] || fl.airline;
        const depAirport = AIRPORTS[fl.origin_airport as string] || fl.origin_airport;
        const arrAirport = AIRPORTS[fl.destination_airport as string] || fl.destination_airport;
        const duration = formatDuration(fl.duration_to as number);
        const stops = stopsText(fl.transfers as number);
        const depAt = fl.departure_at as string;
        const dateFormatted = formatDateRu(depAt);
        const timeFormatted = formatTimeFromISO(depAt);
        const gate = fl.gate || "Aviasales";
        const link = fl.link ? `https://www.aviasales.ru${fl.link}` : "";
        const price = fl.price as number;

        return { airlineName, price, dateFormatted, timeFormatted, depAirport, arrAirport, duration, stops, gate, link };
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 12);

    if (flights.length === 0) return "";

    const flightLines = flights.map(f =>
      `- ${f.airlineName} | ${f.price.toLocaleString("ru")} ₽ | ${f.dateFormatted} ${f.timeFormatted} | ${f.depAirport} → ${f.arrAirport} | ${f.duration} | ${f.stops} | ${f.gate} | ${f.link}`
    );

    return `\n\nREAL FLIGHT DATA from Travelpayouts (${origin} → ${destination}), sorted by price:
Format: Airline | Price | Date Time | Route | Duration | Stops | Seller | BuyLink
IMPORTANT: Use the "Date Time" field exactly as shown (e.g. "25 марта 08:30") in the departure field of the widget.
If user asked for a SPECIFIC date, show ONLY flights on that date. If no exact date match, show closest dates and mention it.
${flights.join("\n")}

IMPORTANT: Use these EXACT prices and airline names in the flights widget. Show the first one as "best", next 9 as "variants". Include airline full name (not code), airport names, duration, departure time, and number of stops.
Set "more_link" to exactly: "https://www.aviasales.ru/search/${origin}${destination}"
For each flight's "link" field, use the BuyLink from the data above. If BuyLink is empty, omit the link field.`;
  } catch {
    return "";
  }
}

function getSystemPrompt() {
  const now = new Date();
  const day = now.getDate();
  const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const todayStr = `${day} ${months[now.getMonth()]} ${now.getFullYear()}`;

  return `You are KotikGo — a friendly AI travel assistant. You help people plan trips anywhere in the world.

TODAY'S DATE: ${todayStr}. Use this to understand relative dates like "завтра" (tomorrow), "послезавтра" (day after tomorrow), "через неделю" (in a week), "в следующем месяце" (next month).

CRITICAL RULES FOR ORIGIN CITY:
- If the user does NOT mention where they're flying FROM, you MUST ask: "Откуда планируете вылет?" (or in the user's language)
- NEVER assume Moscow or any city as origin. Always ask.
- Only proceed with widgets after you know both origin AND destination.

WIDGET FORMAT — each on its own line, JSON must be valid and complete on ONE line:

[widget:flights]{"from":"City","to":"City","best":{"airline":"Full Airline Name","dep_airport":"Airport","arr_airport":"Airport","departure":"2026-05-03 08:30","duration":"4ч 15м","stops":"прямой","price":"от 12 439 ₽","gate":"Aviasales","link":"https://..."},"variants":[...up to 9 more...],"more_link":"https://aviasales.ru/search/..."}
[widget:transfer]{"from":"Аэропорт Анталья","to":"Каш","best":{"type":"Sedan","passengers":"4","price":"от $80"},"variants":[{"type":"Minivan","passengers":"7","price":"от $100"},{"type":"Minibus","passengers":"19","price":"от $150"}]}
[widget:hotel]{"location":"Каш","nights":"7 ночей","best":{"name":"Hotel Name","rating":"4.8","area":"район","price":"от $40/ночь"},"variants":[...2+ more...]}
[widget:esim]{"country":"Турция","best":{"operator":"Turkcell","gb":"10","days":"7","price":"$8"},"variants":[...2+ more...]}
[widget:insurance]{"days":"7","best":{"name":"Базовая","coverage":"$50 000","includes":"стандарт","price":"$18"},"variants":[...2+ more...]}
[widget:info]{"items":[{"label":"Виза","value":"не нужна до 30 дней"},{"label":"Валюта","value":"TRY (лира)"},{"label":"Розетки","value":"тип C/F"}]}

WHEN TO SHOW WHICH WIDGETS:

FULL SET (all 6 widgets) — when user says they want to TRAVEL somewhere (e.g. "хочу в Каш", "лечу на Бали", "поездка в Дубай"):
→ flights + transfer + hotel + esim + insurance + info

PARTIAL — when user asks about specific service:
→ "найди билеты" = only flights
→ "нужен трансфер" = only transfer
→ "какой eSIM" = only esim
→ "нужна страховка" = only insurance

NO WIDGETS — casual questions:
→ restaurants, weather, visa rules, tips, documents = plain text answer only

AIRPORTS FOR CITIES WITHOUT OWN AIRPORT:
- When REAL FLIGHT DATA is provided for multiple airports, include ALL of them in one flights widget, sorted by price
- The transfer widget should show route from the arrival AIRPORT to the user's DESTINATION city (e.g. "Аэропорт Анталья → Каш", NOT "Аэропорт → Анталья")

IMPORTANT:
- When REAL FLIGHT PRICES are provided in context, use THOSE exact prices — they are real and current
- Each variant has same fields as best: airline, dep_airport, arr_airport, departure, duration, stops, price, gate, link
- Sort flights by price ascending
- Answer in the same language the user writes in
- Use markdown for text formatting (bold, lists) but NOT inside widget JSON
- Be friendly but concise
- Do NOT output [widget:checklist] — it is deprecated`;
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Check last user message for city names → fetch real prices
  const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
  let flightContext = "";

  if (lastUserMsg) {
    const { origin, destination } = findIATA(lastUserMsg.content);
    console.log("[chat] detected cities:", origin, "→", destination, "from:", lastUserMsg.content.slice(0, 50));
    if (origin && destination) {
      // Extract date from message: "25 марта", "в мае", "на март"
      const monthMap: Record<string, string> = {
        "январ": "01", "феврал": "02", "март": "03", "апрел": "04",
        "май": "05", "мая": "05", "июн": "06", "июл": "07",
        "август": "08", "сентябр": "09", "октябр": "10", "ноябр": "11", "декабр": "12",
      };

      let dateStr: string | undefined;
      const text = lastUserMsg.content.toLowerCase();

      // Helper: format date to YYYY-MM-DD
      function toDateStr(d: Date): string {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }

      // Relative dates: "завтра", "послезавтра", "через N дней"
      const now = new Date();
      if (text.includes("завтра") && !text.includes("послезавтра")) {
        const d = new Date(now); d.setDate(d.getDate() + 1);
        dateStr = toDateStr(d);
      } else if (text.includes("послезавтра")) {
        const d = new Date(now); d.setDate(d.getDate() + 2);
        dateStr = toDateStr(d);
      } else if (text.includes("сегодня")) {
        dateStr = toDateStr(now);
      }

      const throughDays = text.match(/через\s+(\d+)\s+дн/);
      if (throughDays) {
        const d = new Date(now); d.setDate(d.getDate() + parseInt(throughDays[1]));
        dateStr = toDateStr(d);
      }

      // Try exact date: "25 марта", "3 мая"
      if (!dateStr) {
        const exactMatch = text.match(/(\d{1,2})\s*(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/i);
        if (exactMatch) {
          const day = exactMatch[1].padStart(2, "0");
          const monthWord = exactMatch[0].replace(/\d+\s*/, "").trim().slice(0, 6);
          for (const [key, val] of Object.entries(monthMap)) {
            if (monthWord.startsWith(key)) {
              dateStr = `${now.getFullYear()}-${val}-${day}`;
              break;
            }
          }
        }
      }

      // Fallback: just month "в мае", "на март", "апрель"
      if (!dateStr) {
        const monthMatch = text.match(/(?:январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)\S*/i);
        if (monthMatch) {
          const m = monthMatch[0].slice(0, 6);
          for (const [key, val] of Object.entries(monthMap)) {
            if (m.startsWith(key)) {
              dateStr = `${now.getFullYear()}-${val}`;
              break;
            }
          }
        }
      }

      // Cities without own airport → search multiple nearby airports
      const MULTI_AIRPORT: Record<string, string[]> = {
        "_KAS": ["AYT", "DLM"],      // Каш → Анталья (3.5ч) + Даламан (1.5ч)
        "_KAL": ["DLM", "AYT"],      // Калкан → Даламан + Анталья
        "_KEM": ["AYT"],             // Кемер → Анталья (1ч)
        "_BEL": ["AYT"],             // Белек → Анталья (30мин)
        "_SID": ["AYT"],             // Сиде → Анталья (1.5ч)
        "_ALA_TR": ["GZP", "AYT"],   // Алания → Газипаша + Анталья
        "_FET": ["DLM", "AYT"],      // Фетхие → Даламан (1ч) + Анталья (3ч)
        "_MAR": ["DLM", "BJV"],      // Мармарис → Даламан + Бодрум
        "_DLY": ["DLM"],             // Далян → Даламан
      };

      const destAirports = MULTI_AIRPORT[destination] || [destination];

      // Fetch from all airports in parallel
      const results = await Promise.all(
        destAirports.map(apt => fetchFlights(origin, apt, dateStr))
      );
      flightContext = results.filter(Boolean).join("\n");
    }
  }

  const systemContent = getSystemPrompt() + flightContext;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      stream: true,
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "no body");
    console.error("OpenRouter error:", response.status, errBody);
    return new Response(JSON.stringify({ error: "AI error", status: response.status, details: errBody }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch {}
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
