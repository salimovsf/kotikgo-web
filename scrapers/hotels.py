"""
KotikGo Places Scraper — Hotels

Scrapes hotels for all configured cities.
Run: python hotels.py [--city Istanbul] [--dry-run]
"""

import asyncio
import argparse
import logging
from config import CITIES, CATEGORY_QUERIES
from google_maps import scrape_city_category
from db import init_db, upsert_place, get_stats

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("hotels")


async def scrape_hotels(city_filter: str = None, dry_run: bool = False):
    init_db()

    cities = CITIES
    if city_filter:
        cities = [c for c in cities if c["city"].lower() == city_filter.lower()]
        if not cities:
            log.error(f"City '{city_filter}' not found in config")
            return

    queries = CATEGORY_QUERIES["hotel"]
    total_saved = 0

    for city_config in cities:
        city = city_config["city"]
        log.info(f"\n{'='*60}")
        log.info(f"Scraping hotels in {city}, {city_config['country']}")
        log.info(f"{'='*60}")

        places = await scrape_city_category(city_config, "hotel", queries)

        if dry_run:
            log.info(f"[DRY RUN] Would save {len(places)} hotels for {city}")
            for p in places[:10]:
                log.info(f"  {p.get('name_en'):40s} ★{p.get('rating', '?')} ({p.get('reviews_count', '?')} reviews)")
            continue

        saved = 0
        for place in places:
            try:
                # Detect stars from subcategory
                sub = (place.get("subcategory") or "").lower()
                if "5-star" in sub or "5 star" in sub:
                    place["stars"] = 5
                elif "4-star" in sub or "4 star" in sub:
                    place["stars"] = 4
                elif "3-star" in sub or "3 star" in sub:
                    place["stars"] = 3
                elif "2-star" in sub or "2 star" in sub:
                    place["stars"] = 2
                elif "1-star" in sub or "1 star" in sub:
                    place["stars"] = 1

                # Set defaults for ALL fields
                defaults = {
                    "name_ru": None, "name_local": None, "district": None,
                    "address": None, "lat": None, "lng": None,
                    "rating": None, "reviews_count": 0,
                    "price_level": None, "phone": None, "website": None,
                    "hours": None, "photos": [], "description": None,
                    "amenities": [], "cuisine": [], "stars": None,
                    "avg_check": None, "tripadvisor_key": None,
                    "subcategory": None, "google_maps_url": None,
                }
                for k, v in defaults.items():
                    place.setdefault(k, v)

                upsert_place(place)
                saved += 1
            except Exception as e:
                log.warning(f"  Failed to save {place.get('name_en', '?')}: {e}")

        total_saved += saved
        log.info(f"[{city}] Saved {saved} hotels")

    log.info(f"\n✅ Total saved: {total_saved} hotels")
    get_stats()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape hotels from Google Maps")
    parser.add_argument("--city", help="Scrape only this city")
    parser.add_argument("--dry-run", action="store_true", help="Don't save to DB, just show results")
    args = parser.parse_args()

    asyncio.run(scrape_hotels(city_filter=args.city, dry_run=args.dry_run))
