export const runtime = "edge";

// Common cities IATA mapping — expand as needed
const CITIES: Record<string, { iata: string; name_ru: string; name_en: string; country: string }> = {
  "MOW": { iata: "MOW", name_ru: "Москва", name_en: "Moscow", country: "RU" },
  "LED": { iata: "LED", name_ru: "Санкт-Петербург", name_en: "Saint Petersburg", country: "RU" },
  "IST": { iata: "IST", name_ru: "Стамбул", name_en: "Istanbul", country: "TR" },
  "AYT": { iata: "AYT", name_ru: "Анталья", name_en: "Antalya", country: "TR" },
  "DPS": { iata: "DPS", name_ru: "Бали (Денпасар)", name_en: "Bali (Denpasar)", country: "ID" },
  "BKK": { iata: "BKK", name_ru: "Бангкок", name_en: "Bangkok", country: "TH" },
  "HKT": { iata: "HKT", name_ru: "Пхукет", name_en: "Phuket", country: "TH" },
  "DXB": { iata: "DXB", name_ru: "Дубай", name_en: "Dubai", country: "AE" },
  "BCN": { iata: "BCN", name_ru: "Барселона", name_en: "Barcelona", country: "ES" },
  "FCO": { iata: "FCO", name_ru: "Рим", name_en: "Rome", country: "IT" },
  "PAR": { iata: "PAR", name_ru: "Париж", name_en: "Paris", country: "FR" },
  "LON": { iata: "LON", name_ru: "Лондон", name_en: "London", country: "GB" },
  "MLE": { iata: "MLE", name_ru: "Мальдивы (Мале)", name_en: "Maldives (Male)", country: "MV" },
  "CMB": { iata: "CMB", name_ru: "Шри-Ланка (Коломбо)", name_en: "Sri Lanka (Colombo)", country: "LK" },
  "GOA": { iata: "GOA", name_ru: "Гоа", name_en: "Goa", country: "IN" },
  "KUL": { iata: "KUL", name_ru: "Куала-Лумпур", name_en: "Kuala Lumpur", country: "MY" },
  "SGN": { iata: "SGN", name_ru: "Хошимин", name_en: "Ho Chi Minh City", country: "VN" },
  "HAN": { iata: "HAN", name_ru: "Ханой", name_en: "Hanoi", country: "VN" },
  "NHA": { iata: "NHA", name_ru: "Нячанг", name_en: "Nha Trang", country: "VN" },
  "TBS": { iata: "TBS", name_ru: "Тбилиси", name_en: "Tbilisi", country: "GE" },
  "EVN": { iata: "EVN", name_ru: "Ереван", name_en: "Yerevan", country: "AM" },
  "ALA": { iata: "ALA", name_ru: "Алматы", name_en: "Almaty", country: "KZ" },
  "TAS": { iata: "TAS", name_ru: "Ташкент", name_en: "Tashkent", country: "UZ" },
  "SIP": { iata: "SIP", name_ru: "Симферополь", name_en: "Simferopol", country: "RU" },
  "AER": { iata: "AER", name_ru: "Сочи", name_en: "Sochi", country: "RU" },
  "SVX": { iata: "SVX", name_ru: "Екатеринбург", name_en: "Yekaterinburg", country: "RU" },
  "OVB": { iata: "OVB", name_ru: "Новосибирск", name_en: "Novosibirsk", country: "RU" },
  "KZN": { iata: "KZN", name_ru: "Казань", name_en: "Kazan", country: "RU" },
  "ROV": { iata: "ROV", name_ru: "Ростов-на-Дону", name_en: "Rostov-on-Don", country: "RU" },
  "ATH": { iata: "ATH", name_ru: "Афины", name_en: "Athens", country: "GR" },
  "LCA": { iata: "LCA", name_ru: "Ларнака", name_en: "Larnaca", country: "CY" },
  "BGW": { iata: "BGW", name_ru: "Багдад", name_en: "Baghdad", country: "IQ" },
  "CAI": { iata: "CAI", name_ru: "Каир", name_en: "Cairo", country: "EG" },
  "HRG": { iata: "HRG", name_ru: "Хургада", name_en: "Hurghada", country: "EG" },
  "SSH": { iata: "SSH", name_ru: "Шарм-эль-Шейх", name_en: "Sharm El Sheikh", country: "EG" },
  "CUN": { iata: "CUN", name_ru: "Канкун", name_en: "Cancun", country: "MX" },
  "NYC": { iata: "NYC", name_ru: "Нью-Йорк", name_en: "New York", country: "US" },
  "MIA": { iata: "MIA", name_ru: "Майами", name_en: "Miami", country: "US" },
  "SEL": { iata: "SEL", name_ru: "Сеул", name_en: "Seoul", country: "KR" },
  "TYO": { iata: "TYO", name_ru: "Токио", name_en: "Tokyo", country: "JP" },
  "PEK": { iata: "PEK", name_ru: "Пекин", name_en: "Beijing", country: "CN" },
  "SIN": { iata: "SIN", name_ru: "Сингапур", name_en: "Singapore", country: "SG" },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  if (!q) {
    return Response.json({ cities: Object.values(CITIES) });
  }

  const results = Object.values(CITIES).filter(
    (c) =>
      c.name_ru.toLowerCase().includes(q) ||
      c.name_en.toLowerCase().includes(q) ||
      c.iata.toLowerCase() === q
  );

  return Response.json({ cities: results });
}
