export const dynamic = "force-dynamic";

// In-memory cache: key = "city|checkIn|checkOut" → { data, timestamp }
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const adults = searchParams.get("adults") || "2";
  const currency = searchParams.get("currency") || "RUB";

  if (!city || !checkIn || !checkOut) {
    return Response.json({ error: "city, check_in, check_out required" }, { status: 400 });
  }

  // Check cache
  const cacheKey = `${city}|${checkIn}|${checkOut}|${adults}|${currency}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    console.log(`[hotels] Cache hit: ${cacheKey}`);
    return Response.json(cached.data);
  }

  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    const safeCity = city.replace(/'/g, "").replace(/"/g, "");

    const cmd = `cd /srv/kotikgo-web/scrapers && python3 -c "
import asyncio, json
from google_hotels import search_hotels

async def main():
    hotels = await search_hotels('${safeCity}', '${checkIn}', '${checkOut}', ${adults}, '${currency}', 'ru')
    result = []
    for h in hotels:
        result.append({
            'name': h.get('name', ''),
            'rating': h.get('rating'),
            'price': h.get('price'),
            'currency': h.get('currency', ''),
            'stars': h.get('stars'),
            'photo': h.get('photo', ''),
            'amenities': h.get('amenities', []),
            'reviews_count': h.get('reviews_count'),
            'url': h.get('url', ''),
        })
    print(json.dumps(result, ensure_ascii=False))

asyncio.run(main())
"`;

    const { stdout } = await execAsync(cmd, { timeout: 60000 });
    const hotels = JSON.parse(stdout.trim());
    const response = { hotels, city, checkIn, checkOut };

    // Save to cache
    cache.set(cacheKey, { data: response, ts: Date.now() });
    console.log(`[hotels] Cached: ${cacheKey} (${hotels.length} hotels)`);

    return Response.json(response);
  } catch (err) {
    console.error("Hotels API error:", err);
    return Response.json({ error: "Failed to fetch hotels", hotels: [] }, { status: 500 });
  }
}
