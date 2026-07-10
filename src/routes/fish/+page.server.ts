import { queryDatabase } from "$lib/server/db";
import { resolveLocale } from '$lib/server/locale';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const nameSubquery = (fishIdExpr: string) => `
    (SELECT ft.name
     FROM fish_translations ft
     WHERE ft.fish_id = ${fishIdExpr}
       AND ft.language IN ($1, 'en')
     ORDER BY CASE WHEN ft.language = $1 THEN 0 ELSE 1 END
     LIMIT 1)`;

function mapFish(row: any): Fish {
    return {
        id: row.id,
        key: row.key,
        name: row.name,
        difficulty: row.difficulty,
        behavior: row.behavior,
        maxSize: row.max_size,
        weather: row.weather,
        seasons: row.seasons ?? [],
        sprite: row.sprite,
        sheet: row.sheet
    };
}

async function loadFish(language: string = 'en'): Promise<Fish[]> {
    const statement = `
        SELECT f.id, f.key, ${nameSubquery('f.id')} as name,
               f.difficulty, f.behavior, f.max_size, f.weather, f.seasons, f.sprite, f.sheet
        FROM fish f
        WHERE f.released = true
        ORDER BY f.id;
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.map(mapFish);
}

async function loadYesterdayFish(language: string = 'en'): Promise<{ game_id: number, name: string } | null> {
    const statement = `
        SELECT d.game_id, ${nameSubquery('d.fish_id')} as name
        FROM daily_fish d
        WHERE d.date = CURRENT_DATE - 1
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.length ? { game_id: records[0].game_id, name: records[0].name } : null;
}

async function loadDailyFish(language: string = 'en'): Promise<DailyFishClassic | null> {
    const statement = `
        SELECT d.id, d.game_id, d.date, f.id as fish_id, f.key,
               ${nameSubquery('f.id')} as name,
               f.difficulty, f.behavior, f.max_size, f.weather, f.seasons, f.sprite, f.sheet
        FROM daily_fish d
            JOIN fish f ON d.fish_id = f.id
        WHERE d.date = CURRENT_DATE
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    if (!records.length) return null;
    const row = records[0];
    return {
        id: row.id,
        game_id: row.game_id,
        date: row.date,
        fish: mapFish({ ...row, id: row.fish_id })
    };
}

export const load: PageServerLoad = async ({ cookies, request }) => {
    try {
        const language = resolveLocale(cookies, request);
        return {
            daily: loadDailyFish(language),
            yesterday: loadYesterdayFish(language),
            fish: loadFish(language),
        };
    } catch (err) {
        console.error('Failed to load daily fish data:', err);
        throw error(500, { message: 'Failed to load daily fish data' });
    }
};
