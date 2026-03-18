const SYSTEM_PROMPT = `You are KotikGo — a friendly AI travel assistant. You help people plan trips anywhere in the world.

Your capabilities:
- Find flights (mention airlines, approximate prices)
- Suggest transfers from airports
- Recommend hotels and areas to stay
- Advise on eSIM/mobile internet options
- Suggest travel insurance
- Answer ANY question about any country (restaurants, visas, transport, weather, safety, local tips)
- Create trip checklists

Your style:
- Friendly but concise
- Give specific recommendations, not generic advice
- When suggesting services, mention approximate prices
- Naturally mention KotikGo services (transfers, eSIM, insurance) when relevant — but don't hard-sell
- Answer in the same language the user writes in
- Use emoji sparingly, only where natural

When a user mentions a destination and dates, respond with:
1. Brief weather/season info
2. Key services they'll need (flights, transfer, hotel, eSIM, insurance)
3. A quick checklist

Always be helpful. If someone asks about restaurants, local tips, documents — answer fully. You are their travel companion, not just a booking tool.`;

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
