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
  { stems: ["кемер", "kemer"], code: "AYT" },
  { stems: ["белек", "belek"], code: "AYT" },
  { stems: ["алани", "alanya"], code: "GZP" },
  { stems: ["фетхие", "fethiye"], code: "DLM" },
  { stems: ["бодрум", "bodrum"], code: "BJV" },
  { stems: ["мармарис", "marmaris"], code: "DLM" },
  { stems: ["тенериф", "tenerife"], code: "TFS" },
  { stems: ["прага", "prague"], code: "PRG" },
  { stems: ["будапешт", "budapest"], code: "BUD" },
  { stems: ["милан", "milan"], code: "MIL" },
  { stems: ["берлин", "berlin"], code: "BER" },
];

function findIATA(text: string): { origin: string | null; destination: string | null } {
  const lower = text.toLowerCase();
  const found: string[] = [];

  // Sort by stem length descending to match longer names first
  const sorted = [...CITY_STEMS].sort((a, b) => {
    const maxA = Math.max(...a.stems.map(s => s.length));
    const maxB = Math.max(...b.stems.map(s => s.length));
    return maxB - maxA;
  });

  for (const { stems, code } of sorted) {
    if (found.includes(code)) continue;
    for (const stem of stems) {
      if (lower.includes(stem)) {
        found.push(code);
        break;
      }
    }
    if (found.length >= 2) break;
  }

  // If only destination found, assume Moscow as origin
  if (found.length === 1) {
    return { origin: "MOW", destination: found[0] };
  }
  if (found.length >= 2) {
    return { origin: found[0], destination: found[1] };
  }
  return { origin: null, destination: null };
}

// Fetch real prices from Travelpayouts
async function fetchFlights(origin: string, destination: string, month?: string): Promise<string> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) return "";

  const params = new URLSearchParams({
    origin,
    destination,
    currency: "RUB",
    token,
    group_by: "departure_at",
    sorting: "price",
    limit: "5",
  });

  if (month) params.set("departure_at", month);

  try {
    const res = await fetch(`https://api.travelpayouts.com/aviasales/v3/grouped_prices?${params}`);
    if (!res.ok) return "";

    const data = await res.json();
    if (!data.success || !data.data) return "";

    const flights = Object.values(data.data)
      .map((f: unknown) => {
        const fl = f as Record<string, unknown>;
        const stops = fl.transfers === 0 ? "прямой" : `${fl.transfers} пересадка`;
        return `- ${fl.airline} ${fl.flight_number}: ${fl.price} ₽, ${fl.departure_at}, ${stops}`;
      })
      .slice(0, 5);

    if (flights.length === 0) return "";

    return `\n\nREAL FLIGHT PRICES from Travelpayouts (${origin} → ${destination}):\n${flights.join("\n")}\nUse these REAL prices in your flight widget. The affiliate link for buying: https://www.aviasales.ru/search/${origin}${destination}`;
  } catch {
    return "";
  }
}

const SYSTEM_PROMPT = `You are KotikGo — a friendly AI travel assistant. You help people plan trips anywhere in the world.

CRITICAL: When recommending services (flights, transfers, hotels, eSIM, insurance), you MUST output special widget blocks. These are rendered as interactive cards in the UI.

Widget format — place each on its own line:
[widget:flights]{"from":"City","to":"City","date":"1 апр","best":{"airline":"Qatar Airways","stops":"1 пересадка","time":"14ч 30м","price":"от 42 000 ₽"},"variants":[{"airline":"Turkish Airlines","stops":"прямой","time":"4ч 15м","price":"от 58 000 ₽"},{"airline":"Pegasus","stops":"1 пересадка","time":"18ч","price":"от 38 000 ₽"}]}

[widget:transfer]{"from":"Аэропорт","to":"Отель","best":{"type":"Sedan","passengers":"4","price":"от $18"},"variants":[{"type":"Minivan","passengers":"7","price":"от $28"},{"type":"Minibus","passengers":"19","price":"от $45"}]}

[widget:hotel]{"location":"Убуд","nights":"14 ночей","best":{"name":"Villa Harmony","rating":"4.8","area":"центр","price":"от $32/ночь"},"variants":[{"name":"Rice Terrace Inn","rating":"4.6","area":"террасы","price":"от $28/ночь"},{"name":"Jungle Retreat","rating":"4.9","area":"лес","price":"от $45/ночь"}]}

[widget:esim]{"country":"Индонезия","best":{"operator":"Telkomsel","gb":"15","days":"14","price":"$9"},"variants":[{"operator":"XL Axiata","gb":"8","days":"14","price":"$6"},{"operator":"Telkomsel","gb":"30","days":"14","price":"$15"}]}

[widget:insurance]{"days":"14","best":{"name":"Базовая","coverage":"$50 000","includes":"стандарт","price":"$22"},"variants":[{"name":"Расширенная","coverage":"$100 000","includes":"водные виды спорта","price":"$35"},{"name":"Премиум","coverage":"$200 000","includes":"всё + отмена рейса","price":"$55"}]}

[widget:checklist]{"items":[{"text":"Виза — не нужна до 30 дней","done":true},{"text":"Билеты","done":false},{"text":"Трансфер","done":false}]}

[widget:info]{"items":[{"label":"Виза","value":"не нужна"},{"label":"Валюта","value":"IDR"},{"label":"Розетки","value":"тип C"}]}

IMPORTANT RULES:
- When REAL FLIGHT PRICES are provided in the context (from Travelpayouts), use THOSE exact prices in the flights widget — they are real and current
- Output widgets ONLY when relevant
- For casual questions (restaurants, tips) answer with plain text only
- JSON must be valid and on ONE line after [widget:type]
- Always 2+ variants in addition to the best
- Answer in the same language the user writes in
- Be friendly but concise`;

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
      // Try to extract month from message
      const monthMatch = lastUserMsg.content.match(/(?:январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)\S*/i);
      const monthMap: Record<string, string> = {
        "январ": "01", "феврал": "02", "март": "03", "апрел": "04",
        "май": "05", "мая": "05", "июн": "06", "июл": "07",
        "август": "08", "сентябр": "09", "октябр": "10", "ноябр": "11", "декабр": "12",
      };
      let month: string | undefined;
      if (monthMatch) {
        const m = monthMatch[0].toLowerCase().slice(0, 6);
        for (const [key, val] of Object.entries(monthMap)) {
          if (m.startsWith(key)) {
            month = `2026-${val}`;
            break;
          }
        }
      }

      flightContext = await fetchFlights(origin, destination, month);
    }
  }

  const systemContent = SYSTEM_PROMPT + flightContext;

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
