"""
KotikGo Places Scraper — Database
"""

import psycopg2
from psycopg2.extras import execute_values, Json
from config import DATABASE_URL


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def init_db():
    """Create tables if not exist."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS places (
            id SERIAL PRIMARY KEY,
            google_place_id VARCHAR(255) UNIQUE,
            tripadvisor_key VARCHAR(255),
            name_en VARCHAR(500) NOT NULL,
            name_ru VARCHAR(500),
            name_local VARCHAR(500),
            category VARCHAR(50) NOT NULL,
            subcategory VARCHAR(200),
            city VARCHAR(200) NOT NULL,
            country VARCHAR(100) NOT NULL,
            district VARCHAR(200),
            address TEXT,
            lat DOUBLE PRECISION,
            lng DOUBLE PRECISION,
            rating DECIMAL(2,1),
            reviews_count INTEGER DEFAULT 0,
            price_level SMALLINT,
            phone VARCHAR(50),
            website VARCHAR(500),
            hours JSONB,
            photos TEXT[],
            description TEXT,
            amenities TEXT[],
            cuisine TEXT[],
            stars SMALLINT,
            avg_check VARCHAR(50),
            google_maps_url TEXT,
            scraped_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
        CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
        CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating DESC);
        CREATE INDEX IF NOT EXISTS idx_places_city_cat ON places(city, category);
        CREATE INDEX IF NOT EXISTS idx_places_google_id ON places(google_place_id);

        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
            author VARCHAR(200),
            rating SMALLINT,
            text TEXT,
            language VARCHAR(10),
            review_date DATE,
            source VARCHAR(50) DEFAULT 'google',
            scraped_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_reviews_place ON reviews(place_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_lang ON reviews(language);
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("[DB] Tables created/verified")


def upsert_place(place: dict) -> int:
    """Insert or update a place. Returns place id."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO places (
            google_place_id, name_en, name_ru, name_local,
            category, subcategory, city, country, district,
            address, lat, lng, rating, reviews_count,
            price_level, phone, website, hours, photos,
            description, amenities, cuisine, stars, avg_check,
            google_maps_url, updated_at
        ) VALUES (
            %(google_place_id)s, %(name_en)s, %(name_ru)s, %(name_local)s,
            %(category)s, %(subcategory)s, %(city)s, %(country)s, %(district)s,
            %(address)s, %(lat)s, %(lng)s, %(rating)s, %(reviews_count)s,
            %(price_level)s, %(phone)s, %(website)s, %(hours)s, %(photos)s,
            %(description)s, %(amenities)s, %(cuisine)s, %(stars)s, %(avg_check)s,
            %(google_maps_url)s, NOW()
        )
        ON CONFLICT (google_place_id) DO UPDATE SET
            name_en = EXCLUDED.name_en,
            name_ru = COALESCE(EXCLUDED.name_ru, places.name_ru),
            name_local = COALESCE(EXCLUDED.name_local, places.name_local),
            rating = EXCLUDED.rating,
            reviews_count = EXCLUDED.reviews_count,
            price_level = COALESCE(EXCLUDED.price_level, places.price_level),
            phone = COALESCE(EXCLUDED.phone, places.phone),
            website = COALESCE(EXCLUDED.website, places.website),
            hours = COALESCE(EXCLUDED.hours, places.hours),
            photos = CASE WHEN array_length(EXCLUDED.photos, 1) > 0 THEN EXCLUDED.photos ELSE places.photos END,
            description = COALESCE(EXCLUDED.description, places.description),
            amenities = COALESCE(EXCLUDED.amenities, places.amenities),
            cuisine = COALESCE(EXCLUDED.cuisine, places.cuisine),
            updated_at = NOW()
        RETURNING id
    """, {
        **place,
        "hours": Json(place.get("hours")) if place.get("hours") else None,
        "photos": place.get("photos") or [],
        "amenities": place.get("amenities") or [],
        "cuisine": place.get("cuisine") or [],
    })

    place_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return place_id


def insert_review(review: dict):
    """Insert a review if not duplicate."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO reviews (place_id, author, rating, text, language, review_date, source)
        SELECT %(place_id)s, %(author)s, %(rating)s, %(text)s, %(language)s, %(review_date)s, %(source)s
        WHERE NOT EXISTS (
            SELECT 1 FROM reviews
            WHERE place_id = %(place_id)s AND author = %(author)s AND text = %(text)s
        )
    """, review)

    conn.commit()
    cur.close()
    conn.close()


def get_stats():
    """Print DB stats."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT city, category, COUNT(*) FROM places GROUP BY city, category ORDER BY city, category")
    rows = cur.fetchall()

    print("\n[DB] Stats:")
    current_city = None
    for city, cat, count in rows:
        if city != current_city:
            print(f"\n  {city}:")
            current_city = city
        print(f"    {cat:20s} {count:>5}")

    cur.execute("SELECT COUNT(*) FROM places")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM reviews")
    total_reviews = cur.fetchone()[0]
    print(f"\n  TOTAL: {total} places, {total_reviews} reviews")

    cur.close()
    conn.close()


if __name__ == "__main__":
    init_db()
    get_stats()
