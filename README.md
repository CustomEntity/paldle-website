# paldle-website

Daily Palworld guessing game — guess the Pal from clues.

**Modes:** Classic (attribute grid) · Pixel (pixelated sprite) · Emoji (emoji clues). EN + FR.

## Stack
SvelteKit 2 + Svelte 5 (runes) · Tailwind v4 · PostgreSQL (`pg`).

## Dev
```bash
pnpm install
pnpm dev
```
Set `DATABASE_URL` and `PUBLIC_MEDIA_URL` in `.env` (not committed). See `.env.example`.

## Data pipeline (`scripts/`)
- `datamine/` — extract Palworld content from the game (→ JSON/PNG): pals, sprites, emojis, and the game-asset image dump for art direction.
- `db/` — `schema.sql` + seed scripts (idempotent: entities, translations, emojis, daily puzzles).

Not affiliated with Pocketpair / Palworld. Fan project.
