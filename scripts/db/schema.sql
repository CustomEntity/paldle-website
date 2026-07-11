-- Paldle schema — one guessable entity (pals), three daily game modes.
-- Follows the Rivalsdle pattern: entity + <entity>_translations + <entity>_media,
-- and one daily_<mode> table per game mode. Idempotent (CREATE ... IF NOT EXISTS).

-- ---------------------------------------------------------------------------
-- Pals — language-neutral attributes. Keyed on `key` (wikily slug / future
-- datamine slug). `tribe` and `dev_name` carry the game's internal identity so a
-- later in-house datamine can match rows without a reshape.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pals (
    id             SERIAL PRIMARY KEY,
    key            TEXT UNIQUE NOT NULL,
    tribe          TEXT,
    dev_name       TEXT,
    paldeck        TEXT,                              -- "100", "84B"
    paldeck_num    INTEGER,                           -- numeric index (compare/sort)
    paldeck_suffix TEXT    NOT NULL DEFAULT '',
    elements       TEXT[]  NOT NULL DEFAULT '{}',     -- 1-2 elements
    rarity         INTEGER,
    size           TEXT,                              -- XS|S|M|L|XL
    genus          TEXT,
    mount          TEXT    NOT NULL DEFAULT 'None',   -- None|Ground|Flying|Swimming
    nocturnal      BOOLEAN NOT NULL DEFAULT FALSE,
    predator       BOOLEAN NOT NULL DEFAULT FALSE,
    food_amount    INTEGER,
    work           JSONB   NOT NULL DEFAULT '{}',     -- {"Mining":3,"Handiwork":4}
    work_keys      TEXT[]  NOT NULL DEFAULT '{}',     -- keys of `work` (set-compare)
    partner_skill  TEXT,
    drops          JSONB   NOT NULL DEFAULT '[]',
    is_boss        BOOLEAN NOT NULL DEFAULT FALSE,
    released       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Localized name + description (Description mode needs per-locale descriptions).
-- Pal names are identical across Latin-script locales and differ for ja/ko/zh/ru;
-- resolvers use the requested locale with an 'en' fallback.
CREATE TABLE IF NOT EXISTS pal_translations (
    id            SERIAL PRIMARY KEY,
    pal_id        INTEGER NOT NULL REFERENCES pals(id) ON DELETE CASCADE,
    locale        TEXT NOT NULL,
    name          TEXT NOT NULL,
    description   TEXT,
    partner_skill TEXT,
    UNIQUE (pal_id, locale)
);
CREATE INDEX IF NOT EXISTS idx_pal_translations_pal_id ON pal_translations(pal_id);

-- Multiple media per Pal (icon today; fullbody / paldeck art / etc. later).
CREATE TABLE IF NOT EXISTS pal_media (
    id            SERIAL PRIMARY KEY,
    pal_id        INTEGER NOT NULL REFERENCES pals(id) ON DELETE CASCADE,
    media_type    TEXT NOT NULL,                      -- icon | fullbody | silhouette | ...
    path          TEXT NOT NULL,                      -- e.g. /pals/anubis.webp
    display_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (pal_id, media_type, path)
);
CREATE INDEX IF NOT EXISTS idx_pal_media_pal_id ON pal_media(pal_id);

-- ---------------------------------------------------------------------------
-- Daily tables — one per mode. game_id is a sequential puzzle counter; the
-- answer is whichever pal_id sits on date = CURRENT_DATE.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_classic (
    id      SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    date    DATE    NOT NULL UNIQUE,
    pal_id  INTEGER NOT NULL REFERENCES pals(id)
);
CREATE TABLE IF NOT EXISTS daily_description (
    id      SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    date    DATE    NOT NULL UNIQUE,
    pal_id  INTEGER NOT NULL REFERENCES pals(id)
);
CREATE TABLE IF NOT EXISTS daily_silhouette (
    id      SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    date    DATE    NOT NULL UNIQUE,
    pal_id  INTEGER NOT NULL REFERENCES pals(id)
);
-- Sound mode: guess the pal from its datamined cry (pal_media media_type='cry').
CREATE TABLE IF NOT EXISTS daily_sound (
    id      SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    date    DATE    NOT NULL UNIQUE,
    pal_id  INTEGER NOT NULL REFERENCES pals(id)
);
CREATE INDEX IF NOT EXISTS idx_daily_classic_date     ON daily_classic(date);
CREATE INDEX IF NOT EXISTS idx_daily_description_date  ON daily_description(date);
CREATE INDEX IF NOT EXISTS idx_daily_silhouette_date   ON daily_silhouette(date);
CREATE INDEX IF NOT EXISTS idx_daily_sound_date        ON daily_sound(date);

-- Generic changelog, keyed by mode.
CREATE TABLE IF NOT EXISTS patch_notes (
    id      SERIAL PRIMARY KEY,
    date    DATE NOT NULL,
    mode    TEXT NOT NULL,
    content TEXT NOT NULL
);
