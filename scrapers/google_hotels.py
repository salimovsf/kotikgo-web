"""
KotikGo — Google Hotels real-time price scraper

Scrapes Google Hotels for a given city + dates.
Returns hotel list with prices from all platforms.
Uses DataImpulse residential proxy.

Can be used as:
1. CLI: python3 google_hotels.py --city "Kas Turkey" --checkin 2026-04-10 --checkout 2026-04-15
2. Module: from google_hotels import search_hotels
"""

import asyncio
import json
import re
import logging
import argparse
from urllib.parse import quote_plus
from playwright.async_api import async_playwright

from config import PROXY_URL, USER_AGENTS
import random

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("google_hotels")


async def search_hotels(city: str, check_in: str, check_out: str, adults: int = 2, currency: str = "RUB", lang: str = "ru") -> list[dict]:
    """
    Search Google Hotels for a city with dates.
    Returns list of hotels with prices.

    Args:
        city: "Kas Turkey", "Istanbul", "Bali Indonesia"
        check_in: "2026-04-10"
        check_out: "2026-04-15"
        adults: number of guests
        currency: "RUB", "USD", "EUR"
        lang: "ru", "en"

    Returns:
        [{name, rating, price, price_per_night, source, photos, url, amenities, ...}, ...]
    """
    log.info(f"Searching hotels: {city}, {check_in} → {check_out}, {adults} adults, {currency}")

    pw = await async_playwright().start()

    # Parse proxy
    proxy_parts = PROXY_URL.replace("http://", "").split("@")
    auth = proxy_parts[0]
    server = proxy_parts[1]
    username, password = auth.split(":")

    browser = await pw.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"],
    )

    context = await browser.new_context(
        proxy={
            "server": f"http://{server}",
            "username": username,
            "password": password,
        },
        user_agent=random.choice(USER_AGENTS),
        viewport={"width": 1920, "height": 1080},
        locale=f"{lang}-{lang.upper()}",
    )

    page = await context.new_page()
    hotels = []

    try:
        # Build Google Hotels URL
        # Format: https://www.google.com/travel/hotels/Kas+Turkey?q=hotels+in+Kas+Turkey&g2lb=...&hl=ru&gl=ru&cs=1&ssta=1&ts=...&checkin=2026-04-10&checkout=2026-04-15&ap=MAA&guests=2&currency=RUB
        url = (
            f"https://www.google.com/travel/hotels/{quote_plus(city)}"
            f"?q=hotels+in+{quote_plus(city)}"
            f"&hl={lang}"
            f"&currency={currency}"
            f"&checkin={check_in}"
            f"&checkout={check_out}"
            f"&guests={adults}"
        )

        log.info(f"Opening: {url[:120]}...")
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        await asyncio.sleep(4)

        # Accept cookies if prompted
        try:
            accept_btn = await page.query_selector('button:has-text("Accept all")')
            if not accept_btn:
                accept_btn = await page.query_selector('button:has-text("Принять все")')
            if accept_btn:
                await accept_btn.click()
                await asyncio.sleep(1)
        except:
            pass

        # Wait for hotel cards to load
        try:
            await page.wait_for_selector('[class*="property"]', timeout=10000)
        except:
            pass
        await asyncio.sleep(3)

        # Parse hotel cards
        # Google Hotels uses different selectors, try multiple approaches
        cards = await page.query_selector_all('[data-hotel-id], [class*="pFnkBd"], [jsname="mutHjb"]')

        if not cards or len(cards) == 0:
            # Alternative: try to find by structure
            cards = await page.query_selector_all('[class*="BcKagd"]')

        if not cards or len(cards) == 0:
            # Broader search
            cards = await page.query_selector_all('div[data-ved] a[href*="/travel/hotels/"]')

        log.info(f"Found {len(cards)} hotel cards")

        if len(cards) == 0:
            # Debug: save page content
            content = await page.content()
            # Try to extract from page JSON data
            hotels = await _parse_from_page_data(page, content)
            if hotels:
                log.info(f"Extracted {len(hotels)} hotels from page data")
                return hotels

        for card in cards[:20]:
            try:
                hotel = await _parse_hotel_card(card, page)
                if hotel and hotel.get("name"):
                    hotels.append(hotel)
            except Exception as e:
                log.warning(f"Error parsing hotel card: {e}")

    except Exception as e:
        log.error(f"Error searching hotels: {e}")
    finally:
        await browser.close()
        await pw.stop()

    log.info(f"Got {len(hotels)} hotels with prices")
    return hotels


async def _parse_hotel_card(card, page) -> dict:
    """Parse a single hotel card element."""
    hotel = {}

    # Try to get all text from card
    try:
        text = await card.inner_text()
    except:
        text = ""

    # Name — usually the first prominent text or link
    try:
        name_el = await card.query_selector('h2, h3, [class*="QT7m7"] span, [class*="BgYkof"]')
        if name_el:
            hotel["name"] = (await name_el.inner_text()).strip()
        elif text:
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            if lines:
                hotel["name"] = lines[0]
    except:
        pass

    # Rating
    rating_match = re.search(r"(\d[.,]\d)\s", text)
    if rating_match:
        hotel["rating"] = float(rating_match.group(1).replace(",", "."))

    # Price — look for currency patterns
    price_patterns = [
        (r"([\d\s.,]+)\s*₽", "RUB"),
        (r"([\d\s.,]+)\s*руб", "RUB"),
        (r"([\d\s.,]+)\s*RUB", "RUB"),
        (r"([\d\s.,]+)\s*TRY", "TRY"),
        (r"([\d\s.,]+)\s*₺", "TRY"),
        (r"\$\s*([\d\s.,]+)", "USD"),
        (r"([\d\s.,]+)\s*USD", "USD"),
        (r"€\s*([\d\s.,]+)", "EUR"),
        (r"([\d\s.,]+)\s*EUR", "EUR"),
    ]
    for pattern, curr in price_patterns:
        price_match = re.search(pattern, text)
        if price_match:
            price_str = price_match.group(1).strip().replace(" ", "").replace(",", "").replace(".", "")
            try:
                hotel["price"] = int(price_str)
                hotel["currency"] = curr
            except:
                pass
            break

    # Amenities
    amenities_keywords = [
        "Бесплатный Wi-Fi", "Wi-Fi", "Бассейн", "Парковка", "Бесплатная парковка",
        "Кондиционер", "Ресторан", "Завтрак", "Бесплатный завтрак", "Спа",
        "Фитнес", "Пляж", "Трансфер", "Прачечная", "Кухня", "Бар",
        "Free Wi-Fi", "Pool", "Parking", "Free parking", "AC", "Restaurant",
        "Breakfast", "Free breakfast", "Spa", "Gym", "Beach", "Kitchen",
    ]
    found_amenities = []
    for kw in amenities_keywords:
        if kw.lower() in text.lower():
            found_amenities.append(kw)
    if found_amenities:
        hotel["amenities"] = found_amenities[:6]  # max 6

    # Source (where the price is from)
    for source in ["Booking.com", "Agoda", "Trip.com", "Ostrovok", "Hotels.com", "Expedia"]:
        if source.lower() in text.lower():
            hotel["source"] = source
            break

    # Photo
    try:
        img = await card.query_selector('img[src*="googleusercontent"], img[src*="gstatic"]')
        if img:
            src = await img.get_attribute("src")
            if src:
                hotel["photo"] = src
    except:
        pass

    # Link
    try:
        link = await card.query_selector("a[href]")
        if link:
            href = await link.get_attribute("href")
            if href and "/travel/hotels/" in href:
                hotel["url"] = f"https://www.google.com{href}" if href.startswith("/") else href
    except:
        pass

    # Stars
    stars_match = re.search(r"(\d)-(?:star|звёзд|звезд)", text, re.IGNORECASE)
    if stars_match:
        hotel["stars"] = int(stars_match.group(1))

    # Reviews count
    reviews_match = re.search(r"\(([\d\s,]+)\)", text)
    if reviews_match:
        try:
            hotel["reviews_count"] = int(reviews_match.group(1).replace(" ", "").replace(",", ""))
        except:
            pass

    return hotel


async def _parse_from_page_data(page, content: str) -> list[dict]:
    """Try to extract hotel data from embedded JSON in page."""
    hotels = []

    # Google Hotels often embeds data in script tags
    try:
        scripts = await page.query_selector_all('script[type="application/json"], script:not([src])')
        for script in scripts:
            text = await script.inner_text()
            if "hotel" in text.lower() and ("price" in text.lower() or "rate" in text.lower()):
                # Try to find JSON arrays with hotel data
                try:
                    data = json.loads(text)
                    # Extract hotels from various possible structures
                    if isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and ("name" in item or "title" in item):
                                hotels.append(item)
                except:
                    pass
    except:
        pass

    # Also try regex on full content for structured data
    ld_json_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
    for match in ld_json_matches:
        try:
            data = json.loads(match)
            if data.get("@type") == "Hotel" or data.get("@type") == "LodgingBusiness":
                hotels.append({
                    "name": data.get("name"),
                    "rating": data.get("aggregateRating", {}).get("ratingValue"),
                    "reviews_count": data.get("aggregateRating", {}).get("reviewCount"),
                    "address": data.get("address", {}).get("streetAddress"),
                })
        except:
            pass

    return hotels


# CLI
async def main():
    parser = argparse.ArgumentParser(description="Search Google Hotels for prices")
    parser.add_argument("--city", required=True, help="City name, e.g. 'Kas Turkey'")
    parser.add_argument("--checkin", required=True, help="Check-in date YYYY-MM-DD")
    parser.add_argument("--checkout", required=True, help="Check-out date YYYY-MM-DD")
    parser.add_argument("--adults", type=int, default=2)
    parser.add_argument("--currency", default="RUB")
    parser.add_argument("--lang", default="ru")
    args = parser.parse_args()

    hotels = await search_hotels(
        city=args.city,
        check_in=args.checkin,
        check_out=args.checkout,
        adults=args.adults,
        currency=args.currency,
        lang=args.lang,
    )

    print(f"\n{'='*60}")
    print(f"Hotels in {args.city} ({args.checkin} → {args.checkout})")
    print(f"{'='*60}")

    for i, h in enumerate(hotels, 1):
        name = h.get("name", "?")
        rating = h.get("rating", "?")
        price = h.get("price", "?")
        currency = h.get("currency", "")
        source = h.get("source", "")
        stars = h.get("stars", "")
        stars_str = f" {'⭐'*stars}" if stars else ""
        print(f"{i:2d}. {name[:40]:40s} ★{rating}{stars_str}  {price} {currency}  {source}")


if __name__ == "__main__":
    asyncio.run(main())
