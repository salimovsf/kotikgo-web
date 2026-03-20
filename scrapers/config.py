"""
KotikGo Places Scraper — Configuration
"""

# DataImpulse residential proxy
PROXY_URL = "http://deca517be4b08ef06f04__cr.tr:fa0a43f050879f45@gw.dataimpulse.com:823"

# PostgreSQL
DATABASE_URL = "postgresql://kotikgo:kotikgo_web_2026@127.0.0.1:5432/kotikgo_places"

# Scraping settings
MIN_DELAY = 3  # seconds between requests
MAX_DELAY = 7
MAX_REQUESTS_PER_HOUR = 200
MAX_RESULTS_PER_QUERY = 500

# Cities to scrape
CITIES = [
    # Priority 1 — Turkey
    {"city": "Istanbul", "country": "Turkey", "queries_suffix": "Istanbul Turkey"},
    {"city": "Antalya", "country": "Turkey", "queries_suffix": "Antalya Turkey"},
    {"city": "Kas", "country": "Turkey", "queries_suffix": "Kas Antalya Turkey"},
    {"city": "Fethiye", "country": "Turkey", "queries_suffix": "Fethiye Turkey"},
    {"city": "Bodrum", "country": "Turkey", "queries_suffix": "Bodrum Turkey"},
    {"city": "Alanya", "country": "Turkey", "queries_suffix": "Alanya Turkey"},
    {"city": "Kemer", "country": "Turkey", "queries_suffix": "Kemer Antalya Turkey"},
    {"city": "Marmaris", "country": "Turkey", "queries_suffix": "Marmaris Turkey"},

    # Priority 2 — Popular destinations
    {"city": "Bali", "country": "Indonesia", "queries_suffix": "Bali Indonesia"},
    {"city": "Dubai", "country": "UAE", "queries_suffix": "Dubai UAE"},
    {"city": "Phuket", "country": "Thailand", "queries_suffix": "Phuket Thailand"},
    {"city": "Bangkok", "country": "Thailand", "queries_suffix": "Bangkok Thailand"},

    # Priority 3 — Europe
    {"city": "Barcelona", "country": "Spain", "queries_suffix": "Barcelona Spain"},
    {"city": "Rome", "country": "Italy", "queries_suffix": "Rome Italy"},
    {"city": "Paris", "country": "France", "queries_suffix": "Paris France"},
    {"city": "Prague", "country": "Czech Republic", "queries_suffix": "Prague Czech Republic"},
]

# Scrape queries per category
CATEGORY_QUERIES = {
    "hotel": [
        "hotels in {city}",
        "resorts in {city}",
        "hostels in {city}",
        "apartments for rent in {city}",
    ],
    "restaurant": [
        "restaurants in {city}",
        "best restaurants {city}",
        "cheap food {city}",
    ],
    "cafe_bar": [
        "cafes in {city}",
        "bars in {city}",
        "rooftop bars {city}",
        "beach clubs {city}",
        "nightclubs {city}",
    ],
    "attraction": [
        "things to do in {city}",
        "attractions {city}",
        "viewpoints {city}",
        "observation deck {city}",
    ],
    "museum": [
        "museums in {city}",
        "galleries in {city}",
        "historical sites {city}",
    ],
    "beach": [
        "beaches in {city}",
        "free beaches {city}",
        "beach clubs {city}",
    ],
    "essential": [
        "supermarket in {city}",
        "grocery store {city}",
        "pharmacy {city}",
        "market bazaar {city}",
    ],
    "medical": [
        "hospital in {city}",
        "clinic {city}",
        "dentist {city}",
        "medical center {city}",
    ],
    "transport": [
        "airport {city}",
        "bus station {city}",
        "train station {city}",
        "metro station {city}",
        "ferry terminal {city}",
    ],
    "shopping": [
        "shopping mall {city}",
        "souvenir shop {city}",
        "outlet {city}",
        "local market {city}",
    ],
    "service": [
        "car rental {city}",
        "laundry {city}",
        "SIM card {city}",
        "money exchange {city}",
        "coworking {city}",
    ],
}

# User agents rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
]
