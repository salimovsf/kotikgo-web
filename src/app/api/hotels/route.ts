export const dynamic = "force-dynamic";

// This endpoint calls our Python scraper on the server
// The scraper runs Playwright + DataImpulse proxy to get real Google Hotels prices

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

  try {
    // Call Python scraper via internal HTTP (we'll set up a small Flask/FastAPI server)
    // For now, call directly via shell command and parse output
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    const cmd = `cd /srv/kotikgo-web/scrapers && python3 -c "
import asyncio, json
from google_hotels import search_hotels

async def main():
    hotels = await search_hotels('${city.replace(/'/g, "")}', '${checkIn}', '${checkOut}', ${adults}, '${currency}', 'ru')
    # Output JSON
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

    const { stdout } = await execAsync(cmd, { timeout: 45000 });
    const hotels = JSON.parse(stdout.trim());

    return Response.json({ hotels, city, checkIn, checkOut });
  } catch (err) {
    console.error("Hotels API error:", err);
    return Response.json({ error: "Failed to fetch hotels", hotels: [] }, { status: 500 });
  }
}
