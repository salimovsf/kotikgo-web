export const runtime = "edge";

const BASE = "https://api.travelpayouts.com";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin"); // IATA code e.g. "MOW"
  const destination = searchParams.get("destination"); // e.g. "DPS"
  const departDate = searchParams.get("depart_date"); // YYYY-MM-DD or YYYY-MM
  const returnDate = searchParams.get("return_date"); // optional
  const currency = searchParams.get("currency") || "RUB";

  if (!origin || !destination) {
    return Response.json({ error: "origin and destination required" }, { status: 400 });
  }

  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) {
    return Response.json({ error: "API not configured" }, { status: 500 });
  }

  // Use grouped_prices for best results
  const params = new URLSearchParams({
    origin,
    destination,
    currency,
    token,
    group_by: "departure_at",
    sorting: "price",
    limit: "10",
  });

  if (departDate) params.set("departure_at", departDate);
  if (returnDate) params.set("return_at", returnDate);

  try {
    const res = await fetch(`${BASE}/aviasales/v3/grouped_prices?${params}`);
    if (!res.ok) {
      return Response.json({ error: "Travelpayouts error", status: res.status }, { status: 502 });
    }

    const data = await res.json();

    if (!data.success || !data.data) {
      return Response.json({ flights: [], currency });
    }

    // Transform to our format
    const flights = Object.values(data.data).map((item: unknown) => {
      const f = item as Record<string, unknown>;
      return {
        price: f.price,
        airline: f.airline,
        departure_at: f.departure_at,
        return_at: f.return_at,
        transfers: f.transfers, // 0 = direct
        flight_number: f.flight_number,
        expires_at: f.expires_at,
        origin,
        destination,
      };
    });

    // Sort by price
    flights.sort((a, b) => (a.price as number) - (b.price as number));

    return Response.json({ flights: flights.slice(0, 10), currency });
  } catch (err) {
    return Response.json({ error: "Failed to fetch flights" }, { status: 500 });
  }
}
