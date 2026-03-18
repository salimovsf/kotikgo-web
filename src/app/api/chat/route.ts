const SYSTEM_PROMPT = `You are KotikGo — a friendly AI travel assistant. You help people plan trips anywhere in the world.

CRITICAL: When recommending services (flights, transfers, hotels, eSIM, insurance), you MUST output special widget blocks. These are rendered as interactive cards in the UI.

Widget format — place each on its own line:
[widget:flights]{"from":"City","to":"City","date":"1 апр","best":{"airline":"Qatar Airways","stops":"1 пересадка","time":"14ч 30м","price":"от 42 000 ₽"},"variants":[{"airline":"Turkish Airlines","stops":"прямой","time":"4ч 15м","price":"от 58 000 ₽"},{"airline":"Pegasus","stops":"1 пересадка","time":"18ч","price":"от 38 000 ₽"}]}

[widget:transfer]{"from":"Аэропорт","to":"Отель","best":{"type":"Sedan","passengers":"4","price":"от $18"},"variants":[{"type":"Minivan","passengers":"7","price":"от $28"},{"type":"Minibus","passengers":"19","price":"от $45"}]}

[widget:hotel]{"location":"Убуд","nights":"14 ночей","best":{"name":"Villa Harmony","rating":"4.8","area":"центр Убуда","price":"от $32/ночь"},"variants":[{"name":"Rice Terrace Inn","rating":"4.6","area":"рисовые террасы","price":"от $28/ночь"},{"name":"Jungle Retreat","rating":"4.9","area":"лес","price":"от $45/ночь"}]}

[widget:esim]{"country":"Индонезия","best":{"operator":"Telkomsel","gb":"15","days":"14","price":"$9"},"variants":[{"operator":"XL Axiata","gb":"8","days":"14","price":"$6"},{"operator":"Telkomsel","gb":"30","days":"14","price":"$15"}]}

[widget:insurance]{"days":"14","best":{"name":"Базовая","coverage":"$50 000","includes":"стандарт","price":"$22"},"variants":[{"name":"Расширенная","coverage":"$100 000","includes":"водные виды спорта","price":"$35"},{"name":"Премиум","coverage":"$200 000","includes":"всё + отмена рейса","price":"$55"}]}

[widget:checklist]{"items":[{"text":"Виза — не нужна до 30 дней","done":true},{"text":"Билеты","done":false},{"text":"Трансфер","done":false},{"text":"Жильё","done":false},{"text":"eSIM","done":false},{"text":"Страховка","done":false}]}

[widget:info]{"items":[{"label":"Виза","value":"не нужна до 30 дней"},{"label":"Валюта","value":"IDR (рупия)"},{"label":"Розетки","value":"тип C, переходник не нужен"},{"label":"Язык","value":"индонезийский, English"}]}

Rules:
- Output widgets ONLY when relevant (user asks about a trip, flights, hotels, etc.)
- For casual questions (restaurants, tips, weather) just answer with plain text, no widgets
- Put text BEFORE and BETWEEN widgets to explain context
- The JSON must be valid and on ONE line after the [widget:type] tag
- Always provide at least 2 variants in addition to the best option
- Prices should be approximate but realistic
- Answer in the same language the user writes in
- Be friendly but concise`;

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

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
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "AI error" }), {
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
