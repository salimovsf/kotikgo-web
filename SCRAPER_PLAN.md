# KotikGo Scraper — Plan

## Цель

Собственная база данных мест (отели, рестораны, достопримечательности) по городам мира. Данные используются:
- KotikGo Web — AI рекомендует реальные места с рейтингами, фото, отзывами
- Цены отелей — подтягиваются в реальном времени из Xotelo
- Любой другой проект — база универсальная, не привязана к KotikGo

---

## Что парсим из Google Maps

### На каждый объект:
| Поле | Пример | Обновление |
|---|---|---|
| name | "Rixos Premium Antalya" | Редко (при переименовании) |
| name_en | "Rixos Premium Antalya" | Редко |
| category | hotel / restaurant / attraction / beach / bar | Никогда |
| subcategory | "5-star hotel", "seafood restaurant" | Редко |
| city | "Antalya" | Никогда |
| country | "Turkey" | Никогда |
| address | "Lara Caddesi 12, Antalya" | Редко |
| lat, lng | 36.8569, 30.7539 | Никогда |
| rating | 4.7 | Раз в месяц |
| reviews_count | 12 453 | Раз в месяц |
| price_level | 1-4 (₽ до ₽₽₽₽) | Редко |
| phone | "+90 242 321 1234" | Редко |
| website | "https://rixos.com" | Редко |
| hours | {"mon": "09:00-22:00", ...} | Раз в месяц |
| photos | ["https://lh5.google...jpg", ...] | Первый парсинг, до 5 фото |
| description | "Luxury beachfront resort..." | Первый парсинг |
| google_place_id | "ChIJ..." | Никогда |
| google_maps_url | "https://maps.google.com/..." | Никогда |
| tripadvisor_key | "g297930-d305178" | Первый парсинг (для Xotelo) |

### Дополнительно для отелей:
| Поле | Пример |
|---|---|
| stars | 5 |
| amenities | ["pool", "spa", "wifi", "parking", "beach"] |
| district | "Lara" |

### Дополнительно для ресторанов:
| Поле | Пример |
|---|---|
| cuisine | ["Turkish", "Seafood", "Mediterranean"] |
| avg_check | "$20-40" |

### Отзывы (отдельная таблица):
| Поле | Пример |
|---|---|
| place_id | FK → places |
| author | "Иван П." |
| rating | 5 |
| text | "Отличный отель, чистый пляж..." |
| language | "ru" |
| date | "2026-02-15" |
| source | "google" |

Парсим до 10 последних отзывов на место, приоритет — русскоязычные.

---

## Что НЕ парсим (берём из других источников)

| Данные | Источник | Когда |
|---|---|---|
| Цены отелей | Xotelo API (бесплатно) | В реальном времени по запросу клиента |
| Цены билетов | Travelpayouts API | В реальном времени |
| Погода | AI знает / Open-Meteo API (бесплатно) | В реальном времени |
| Визовые правила | AI знает | — |

---

## Категории парсинга

### Группа А — Жильё
| # | Парсер | Запросы Google Maps | На город | Обновление |
|---|--------|-------------------|----------|------------|
| 1 | hotels.py | `hotels in {city}`, `resorts in {city}`, `hostels in {city}`, `apartments in {city}` | 500-1000 | Рейтинги 1 раз/мес |

### Группа Б — Еда и напитки
| # | Парсер | Запросы Google Maps | На город | Обновление |
|---|--------|-------------------|----------|------------|
| 2 | restaurants.py | `restaurants in {city}`, `best restaurants {city}`, `cheap food {city}` | 300-500 | 1 раз/мес |
| 3 | cafes_bars.py | `cafes in {city}`, `bars in {city}`, `rooftop bars {city}`, `beach clubs {city}`, `nightclubs {city}` | 100-200 | 1 раз/мес |

### Группа В — Что посмотреть и чем заняться
| # | Парсер | Запросы Google Maps | На город | Обновление |
|---|--------|-------------------|----------|------------|
| 4 | attractions.py | `things to do in {city}`, `attractions {city}`, `viewpoints {city}`, `observation deck {city}` | 100-200 | 1 раз/2 мес |
| 5 | museums.py | `museums in {city}`, `galleries in {city}`, `historical sites {city}` | 30-80 | 1 раз/квартал |
| 6 | beaches.py | `beaches in {city}`, `free beaches {city}`, `beach clubs {city}`, `paid beaches {city}` | 20-50 | 1 раз/квартал |

### Группа Г — Быт и здоровье
| # | Парсер | Запросы Google Maps | На город | Обновление |
|---|--------|-------------------|----------|------------|
| 7 | essentials.py | `supermarket in {city}`, `grocery store {city}`, `pharmacy {city}`, `market bazaar {city}` | 50-100 | 1 раз/квартал |
| 8 | medical.py | `hospital in {city}`, `clinic {city}`, `dentist {city}`, `medical center {city}` | 30-50 | 1 раз/квартал |

### Группа Д — Транспорт
| # | Парсер | Запросы Google Maps | На город | Обновление |
|---|--------|-------------------|----------|------------|
| 9 | transport.py | `airport {city}`, `bus station {city}`, `train station {city}`, `metro station {city}`, `ferry terminal {city}` | 20-50 | 1 раз/квартал |

### Группа Е — Шоппинг и сервисы
| # | Парсер | Запросы Google Maps | На город | Обновление |
|---|--------|-------------------|----------|------------|
| 10 | shopping.py | `shopping mall {city}`, `souvenir shop {city}`, `outlet {city}`, `local market {city}` | 30-80 | 1 раз/квартал |
| 11 | services.py | `car rental {city}`, `laundry {city}`, `SIM card {city}`, `money exchange {city}`, `coworking {city}` | 20-50 | 1 раз/квартал |

### Итого на город: ~1200-2400 мест
### Итого на 16 городов: ~20 000-40 000 записей

---

## Города на старт (фаза 1)

### Приоритет 1 — Турция (наша основная аудитория):
- Стамбул
- Анталья
- Каш
- Фетхие
- Бодрум
- Алания
- Кемер
- Мармарис

### Приоритет 2 — Популярные направления:
- Бали (Убуд, Семиньяк, Кута)
- Дубай
- Пхукет
- Бангкок

### Приоритет 3 — Европа:
- Барселона
- Рим
- Париж
- Прага

**Итого:** ~16 городов × ~1500-2500 мест = ~25 000-40 000 записей

---

## Техническая архитектура

### Стек:
- **Python 3.12** + Playwright (headless Chrome)
- **DataImpulse** residential прокси (уже оплачен)
- **PostgreSQL** на сервере 157.22.230.74 (уже есть)

### БД: отдельная база `kotikgo_places`
НЕ в `kotikgo_web` — чтобы использовать из любого проекта.

```sql
-- Основная таблица
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    google_place_id VARCHAR(255) UNIQUE,
    tripadvisor_key VARCHAR(255),
    name_en VARCHAR(500) NOT NULL,
    name_ru VARCHAR(500),
    name_local VARCHAR(500),
    category VARCHAR(50) NOT NULL,     -- hotel, restaurant, cafe, bar, beach_club, nightclub,
                                      -- attraction, viewpoint, museum, gallery,
                                      -- beach_free, beach_paid, beach_club,
                                      -- supermarket, pharmacy, market,
                                      -- hospital, clinic, dentist,
                                      -- airport, bus_station, train_station, metro, ferry,
                                      -- mall, souvenir, outlet,
                                      -- car_rental, laundry, sim_card, exchange, coworking
    subcategory VARCHAR(200),
    city VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL,
    district VARCHAR(200),
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    rating DECIMAL(2,1),
    reviews_count INTEGER DEFAULT 0,
    price_level SMALLINT,              -- 1-4
    phone VARCHAR(50),
    website VARCHAR(500),
    hours JSONB,
    photos TEXT[],                      -- массив URL
    description TEXT,
    amenities TEXT[],                   -- для отелей
    cuisine TEXT[],                     -- для ресторанов
    stars SMALLINT,                     -- для отелей (1-5)
    avg_check VARCHAR(50),             -- для ресторанов
    google_maps_url TEXT,

    scraped_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Индексы для быстрого поиска
    -- CREATE INDEX idx_places_city ON places(city);
    -- CREATE INDEX idx_places_category ON places(category);
    -- CREATE INDEX idx_places_rating ON places(rating DESC);
    -- CREATE INDEX idx_places_city_cat ON places(city, category);
);

-- Отзывы
CREATE TABLE reviews (
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
CREATE INDEX idx_reviews_place ON reviews(place_id);
CREATE INDEX idx_reviews_lang ON reviews(language);
```

### Доступ из разных проектов:
- KotikGo Web (Next.js) — через API `/api/places?city=Antalya&category=hotel`
- Любой другой проект — напрямую к PostgreSQL или через API
- Данные не привязаны к KotikGo — универсальный справочник мест

---

## Расписание парсинга

### Первый прогон (наполнение базы, ~2 недели):
| Неделя | День | Парсер | Города |
|--------|------|--------|--------|
| 1 | Пн | hotels.py | Турция (8 городов) |
| 1 | Вт | hotels.py | Бали, Дубай, Пхукет, Бангкок |
| 1 | Ср | hotels.py | Барселона, Рим, Париж, Прага |
| 1 | Чт | restaurants.py | Все 16 городов |
| 1 | Пт | cafes_bars.py | Все 16 городов |
| 1 | Сб | attractions.py + museums.py | Все 16 городов |
| 1 | Вс | beaches.py | Курортные города |
| 2 | Пн | essentials.py | Все 16 городов |
| 2 | Вт | medical.py | Все 16 городов |
| 2 | Ср | transport.py | Все 16 городов |
| 2 | Чт | shopping.py | Все 16 городов |
| 2 | Пт | services.py | Все 16 городов |
| 2 | Сб | tripadvisor_keys.py | hotel_key для Xotelo |
| 2 | Вс | reviews.py | Топ-50 мест в каждом городе |

### Регулярное обновление:
| Частота | Что обновляем |
|---|---|
| 1 раз в месяц | Рейтинги, кол-во отзывов, новые отзывы (Группы А, Б, В) |
| 1 раз в квартал | Фото, описания, контакты, часы работы (Группы Г, Д, Е) |
| Постоянно | Новые места (если Google показывает новые в топе) |

---

## Языки

### Стратегия парсинга:

**Первый проход (основной) — английский (`hl=en`):**
- Название (name_en) — универсальное, всегда есть
- Адрес, координаты, рейтинг, фото, категория
- Отзывы на английском (до 5 шт)

**Второй проход (дополнительный) — русский (`hl=ru`):**
- Русское название (name_ru) — "Гранд-Базар" вместо "Grand Bazaar"
- Отзывы на русском (до 10 шт, приоритет)
- Только для топ-мест (рейтинг 4.0+ или >100 отзывов)

**Локальное название:**
- Парсится из основного прохода если Google отдаёт оригинальное название
- Или третий проход с `hl=tr` / `hl=id` и т.д. — низкий приоритет, на потом

### Хранение в БД:
```
name_en: "Grand Bazaar"           -- всегда есть
name_ru: "Гранд-Базар"           -- может быть null
name_local: "Kapalıçarşı"        -- может быть null
```

### AI использует:
- Если клиент пишет на русском → показывает name_ru (fallback name_en)
- Если на английском → name_en
- Отзывы на языке клиента приоритетнее

### Увеличение запросов:
- Основной проход: ~25 000-40 000 запросов
- Русский проход (топ-места): ~5 000-8 000 запросов
- Итого: ~30 000-48 000 запросов на первый прогон
- При скорости 200 запросов/час = ~150-240 часов = растянуть на 2-3 недели

---

## Защита от бана

| Мера | Реализация |
|---|---|
| Residential прокси | DataImpulse, ротация IP при каждом запросе |
| Паузы между запросами | 3-7 секунд (рандом) |
| Лимит в час | Не более 200 запросов/час |
| Разные User-Agent | Ротация из пула 20+ UA |
| Разное время | Парсинг ночью 02:00-06:00 МСК |
| Headless Chrome | Playwright — полноценный браузер, не curl |
| Капча-детект | Если Google показал капчу — пропускаем, берём новый IP |
| Разнесение по дням | Каждая категория в свой день |

---

## Интеграция с KotikGo Web

### Как AI использует базу:
1. Клиент: "хочу в Стамбул, посоветуй отель рядом с Султанахмет"
2. Бэкенд ищет в БД: `WHERE city='Istanbul' AND category='hotel' AND district LIKE '%Sultanahmet%' ORDER BY rating DESC LIMIT 10`
3. Для каждого отеля запрашивает Xotelo: реальные цены на даты клиента
4. AI получает данные и формирует виджет с реальными отелями, фото, ценами
5. Кнопка "Забронировать" → реферальная ссылка на Booking.com / Trip.com

### API эндпоинт:
```
GET /api/places?city=Istanbul&category=hotel&limit=10&sort=rating
GET /api/places?city=Antalya&category=restaurant&cuisine=seafood
GET /api/places/:id/prices?check_in=2026-04-01&check_out=2026-04-05
```

---

## Стоимость

| Ресурс | Стоимость |
|---|---|
| DataImpulse прокси | Уже оплачен |
| PostgreSQL | Уже есть на сервере |
| Сервер | Уже есть (157.22.230.74) |
| Xotelo | Бесплатно |
| **Итого** | **$0 дополнительно** |

---

## Масштабирование

- 16 городов → 100 городов: просто добавляем в конфиг
- 16 000 записей → 100 000: PostgreSQL справится без проблем
- Парсинг раз в неделю → раз в день: увеличиваем лимиты прокси
- Другие источники: Booking.com отзывы, Instagram фото — добавляем отдельные парсеры
