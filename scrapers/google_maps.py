"""
KotikGo Places Scraper — Google Maps Parser

Uses Playwright to scrape Google Maps search results.
Extracts: name, rating, reviews, address, coordinates, photos, etc.
"""

import asyncio
import random
import json
import re
import time
import logging
from urllib.parse import quote_plus
from playwright.async_api import async_playwright, Page, TimeoutError as PWTimeout

from config import PROXY_URL, USER_AGENTS, MIN_DELAY, MAX_DELAY

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("google_maps")


async def random_delay():
    """Random delay between requests."""
    delay = random.uniform(MIN_DELAY, MAX_DELAY)
    await asyncio.sleep(delay)


def random_ua():
    return random.choice(USER_AGENTS)


async def create_browser(headless=True):
    """Create Playwright browser with proxy."""
    pw = await async_playwright().start()

    proxy_parts = PROXY_URL.replace("http://", "").split("@")
    auth = proxy_parts[0]
    server = proxy_parts[1]
    username, password = auth.split(":")

    browser = await pw.chromium.launch(
        headless=headless,
        args=["--disable-blink-features=AutomationControlled"],
    )

    context = await browser.new_context(
        proxy={
            "server": f"http://{server}",
            "username": username,
            "password": password,
        },
        user_agent=random_ua(),
        viewport={"width": 1920, "height": 1080},
        locale="en-US",
    )

    return pw, browser, context


async def scroll_results(page: Page, max_scrolls=20):
    """Scroll the results panel to load more places."""
    results_selector = 'div[role="feed"]'

    for i in range(max_scrolls):
        try:
            await page.evaluate(f"""
                const feed = document.querySelector('{results_selector}');
                if (feed) feed.scrollTop = feed.scrollHeight;
            """)
            await asyncio.sleep(1.5)

            # Check if "end of results" appeared
            end_marker = await page.query_selector("text=You've reached the end of the list")
            if end_marker:
                log.info(f"  Reached end of results after {i+1} scrolls")
                break
        except Exception:
            break

    return


async def parse_search_results(page: Page) -> list[dict]:
    """Parse all visible place cards from search results."""
    places = []

    cards = await page.query_selector_all('a.hfpxzc')
    log.info(f"  Found {len(cards)} place cards")

    for card in cards:
        try:
            place = {}

            # Name from aria-label
            aria_label = await card.get_attribute("aria-label") or ""
            if not aria_label:
                continue
            place["name_en"] = aria_label.strip()

            # URL & place_id
            href = await card.get_attribute("href") or ""
            place["google_maps_url"] = href

            # Extract place_id from URL (data=!...!1sChIJ...)
            place_id_match = re.search(r"1s(0x[0-9a-f]+:[0-9a-fx]+)", href)
            if place_id_match:
                place["google_place_id"] = place_id_match.group(1)
            else:
                place["google_place_id"] = str(abs(hash(href)))

            # Parent container has rating, reviews, category, address
            parent = await card.evaluate_handle("el => el.parentElement")

            # Rating & reviews from parent
            parent_text = await parent.evaluate("el => el.innerText")

            rating_match = re.search(r"(\d\.\d)\s*\(", parent_text)
            if not rating_match:
                rating_match = re.search(r"(\d\.\d)", parent_text)
            if rating_match:
                place["rating"] = float(rating_match.group(1))

            reviews_match = re.search(r"\(([\d,]+)\)", parent_text)
            if reviews_match:
                place["reviews_count"] = int(reviews_match.group(1).replace(",", ""))

            # Subcategory and address from text lines
            lines = [l.strip() for l in parent_text.split("\n") if l.strip() and l.strip() != aria_label.strip()]
            for line in lines:
                if any(kw in line.lower() for kw in ["hotel", "resort", "hostel", "restaurant", "cafe", "bar", "museum", "beach", "hospital", "pharmacy", "airport", "station", "mall", "market", "star", "club"]):
                    place["subcategory"] = line
                elif len(line) > 15 and not re.match(r"^[\d.(,)]+$", line) and "·" not in line[:3]:
                    if "address" not in place:
                        place["address"] = line

            # Price level
            price_match = re.search(r"([\$₽€]{1,4})\s*·", parent_text)
            if price_match:
                place["price_level"] = len(price_match.group(1))

            # Photo from sibling img
            img = await parent.evaluate_handle("el => el.querySelector('img[src*=\"googleusercontent\"]')")
            try:
                src = await img.evaluate("el => el.src")
                if src:
                    place["photos"] = [src]
            except:
                pass

            places.append(place)

        except Exception as e:
            log.warning(f"  Error parsing card: {e}")
            continue

    return places


async def get_place_details(page: Page, url: str) -> dict:
    """Open individual place page and extract full details."""
    details = {}

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        await asyncio.sleep(2)

        # Coordinates from URL
        coords_match = re.search(r"@(-?[\d.]+),(-?[\d.]+)", page.url)
        if coords_match:
            details["lat"] = float(coords_match.group(1))
            details["lng"] = float(coords_match.group(2))

        # Phone
        phone_el = await page.query_selector('button[data-tooltip="Copy phone number"]')
        if phone_el:
            details["phone"] = (await phone_el.inner_text()).strip()

        # Website
        website_el = await page.query_selector('a[data-tooltip="Open website"]')
        if website_el:
            details["website"] = await website_el.get_attribute("href")

        # Photos (up to 5)
        photo_els = await page.query_selector_all('button[class*="photo"] img[src*="googleusercontent"]')
        photos = []
        for img in photo_els[:5]:
            src = await img.get_attribute("src")
            if src:
                photos.append(src)
        if photos:
            details["photos"] = photos

    except PWTimeout:
        log.warning(f"  Timeout loading details: {url[:80]}")
    except Exception as e:
        log.warning(f"  Error getting details: {e}")

    return details


async def scrape_category(query: str, city: str, country: str, category: str, language="en", max_results=500) -> list[dict]:
    """
    Scrape Google Maps for a single query.
    Returns list of place dicts.
    """
    log.info(f"Scraping: '{query}' (lang={language})")

    pw, browser, context = await create_browser()
    page = await context.new_page()

    places = []

    try:
        search_url = f"https://www.google.com/maps/search/{quote_plus(query)}?hl={language}"
        await page.goto(search_url, wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(3)

        # Accept cookies if prompted
        try:
            accept_btn = await page.query_selector("text=Accept all")
            if accept_btn:
                await accept_btn.click()
                await asyncio.sleep(1)
        except:
            pass

        # Scroll to load all results
        await scroll_results(page, max_scrolls=max_results // 20)

        # Parse visible results
        places = await parse_search_results(page)

        # Add city/country/category to each
        for p in places:
            p["city"] = city
            p["country"] = country
            p["category"] = category

        log.info(f"  Got {len(places)} places for '{query}'")

    except PWTimeout:
        log.error(f"  Timeout loading search: {query}")
    except Exception as e:
        log.error(f"  Error scraping: {e}")
    finally:
        await browser.close()
        await pw.stop()

    return places[:max_results]


async def scrape_city_category(city_config: dict, category: str, queries: list[str], language="en") -> list[dict]:
    """
    Scrape all queries for a city+category combination.
    Deduplicates by google_place_id.
    """
    city = city_config["city"]
    country = city_config["country"]
    suffix = city_config["queries_suffix"]

    all_places = {}

    for query_template in queries:
        query = query_template.format(city=suffix)
        await random_delay()

        places = await scrape_category(query, city, country, category, language)

        for p in places:
            pid = p.get("google_place_id")
            if pid and pid not in all_places:
                all_places[pid] = p

    log.info(f"[{city}] {category}: {len(all_places)} unique places")
    return list(all_places.values())


# For testing
async def test():
    places = await scrape_category("hotels in Kas Antalya Turkey", "Kas", "Turkey", "hotel")
    for p in places[:5]:
        print(f"  {p.get('name_en'):40s} ★{p.get('rating', '?')} ({p.get('reviews_count', '?')} reviews)")


if __name__ == "__main__":
    asyncio.run(test())
