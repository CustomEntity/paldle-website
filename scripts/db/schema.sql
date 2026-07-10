-- Stardewdle schema — mirrors Brawldle's entity / *_translations / daily_* pattern.
-- Safe to re-run (idempotent).

CREATE TABLE IF NOT EXISTS villagers (
    id            SERIAL PRIMARY KEY,
    key           TEXT UNIQUE NOT NULL,          -- internal Stardew id, e.g. "Abigail"
    gender        TEXT,                          -- Male | Female | Undefined
    region        TEXT,                          -- Town | Mountain | Forest | Beach | Desert | Sewers | Ginger Island
    birth_season  TEXT,                          -- Spring | Summer | Fall | Winter
    birth_day     INTEGER,                       -- 1..28
    marriageable  BOOLEAN NOT NULL DEFAULT FALSE,
    age           TEXT,                          -- Adult | Teen | Child
    love_interest TEXT,
    home_location TEXT,
    loved_gifts   JSONB,                         -- string[] of loved gift display names (EN)
    loved_gift_sprite INTEGER,                   -- springobjects SpriteIndex of the first loved gift (null if custom sheet)
    portrait_url  TEXT,
    released      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrations for columns added after the initial villagers table
ALTER TABLE villagers ADD COLUMN IF NOT EXISTS loved_gift_sprite INTEGER;

CREATE TABLE IF NOT EXISTS villager_translations (
    villager_id INTEGER NOT NULL REFERENCES villagers(id) ON DELETE CASCADE,
    language    TEXT NOT NULL,                   -- 'en', 'fr', ...
    name        TEXT NOT NULL,
    PRIMARY KEY (villager_id, language)
);

CREATE TABLE IF NOT EXISTS daily_villager (
    id          SERIAL PRIMARY KEY,
    game_id     INTEGER NOT NULL,
    date        DATE NOT NULL UNIQUE,
    villager_id INTEGER NOT NULL REFERENCES villagers(id)
);

CREATE TABLE IF NOT EXISTS crops (
    id        SERIAL PRIMARY KEY,
    key       TEXT UNIQUE NOT NULL,   -- harvest item id
    growth    INTEGER,                -- days to grow
    price     INTEGER,                -- base sell price (g)
    regrow    BOOLEAN NOT NULL DEFAULT FALSE,
    type      TEXT,                   -- Vegetable | Fruit | Flower | Forage | Seed
    seasons   TEXT[],                 -- Spring | Summer | Fall | Winter (can be several)
    sprite    INTEGER,                -- icon index
    sheet     TEXT,                   -- springobjects | objects_2
    released  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS crop_translations (
    crop_id   INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    language  TEXT NOT NULL,
    name      TEXT NOT NULL,
    PRIMARY KEY (crop_id, language)
);

CREATE TABLE IF NOT EXISTS daily_crop (
    id       SERIAL PRIMARY KEY,
    game_id  INTEGER NOT NULL,
    date     DATE NOT NULL UNIQUE,
    crop_id  INTEGER NOT NULL REFERENCES crops(id)
);

CREATE TABLE IF NOT EXISTS fish (
    id         SERIAL PRIMARY KEY,
    key        TEXT UNIQUE NOT NULL,   -- fish item id
    difficulty INTEGER,                -- catch difficulty
    behavior   TEXT,                   -- Floater | Dart | Smooth | Mixed | Sinker
    max_size   INTEGER,                -- max size (inches)
    weather    TEXT,                   -- Sunny | Rainy | Any
    seasons    TEXT[],
    sprite     INTEGER,
    sheet      TEXT,
    released   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS fish_translations (
    fish_id   INTEGER NOT NULL REFERENCES fish(id) ON DELETE CASCADE,
    language  TEXT NOT NULL,
    name      TEXT NOT NULL,
    PRIMARY KEY (fish_id, language)
);

CREATE TABLE IF NOT EXISTS daily_fish (
    id       SERIAL PRIMARY KEY,
    game_id  INTEGER NOT NULL,
    date     DATE NOT NULL UNIQUE,
    fish_id  INTEGER NOT NULL REFERENCES fish(id)
);

CREATE TABLE IF NOT EXISTS patch_notes (
    id      SERIAL PRIMARY KEY,
    date    DATE NOT NULL,
    mode    TEXT NOT NULL,
    content TEXT NOT NULL
);
