import { queryDatabase } from "$lib/server/db";
import { resolveLocale } from '$lib/server/locale';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// localized name subquery (falls back to EN), $1 = language
const nameSubquery = (villagerIdExpr: string) => `
    (SELECT vt.name
     FROM villager_translations vt
     WHERE vt.villager_id = ${villagerIdExpr}
       AND vt.language IN ($1, 'en')
     ORDER BY CASE WHEN vt.language = $1 THEN 0 ELSE 1 END
     LIMIT 1)`;

async function loadYesterdayVillager(language: string = 'en'): Promise<{ game_id: number, name: string } | null> {
    const statement = `
        SELECT d.game_id,
               ${nameSubquery('d.villager_id')} as name
        FROM daily_villager d
        WHERE d.date = CURRENT_DATE - 1
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.length ? { game_id: records[0].game_id, name: records[0].name } : null;
}

async function loadVillagers(language: string = 'en'): Promise<Villager[]> {
    const statement = `
        SELECT v.id,
               ${nameSubquery('v.id')} as name,
               v.gender,
               v.region,
               v.birth_season,
               v.birth_day,
               v.marriageable,
               v.age,
               v.portrait_url
        FROM villagers v
        WHERE v.released = true
        ORDER BY v.id;
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.map(row => ({
        id: row.id,
        name: row.name,
        gender: row.gender,
        region: row.region,
        birth_season: row.birth_season,
        birth_day: row.birth_day,
        marriageable: row.marriageable,
        age: row.age,
        portrait_url: row.portrait_url
    }));
}

async function loadDailyVillager(language: string = 'en'): Promise<DailyVillager | null> {
    const statement = `
        SELECT d.id,
               d.game_id,
               d.date,
               d.villager_id,
               v.gender,
               v.region,
               v.birth_season,
               v.birth_day,
               v.marriageable,
               v.age,
               v.portrait_url,
               ${nameSubquery('v.id')} as name,
               (v.loved_gifts->>0) as gift_hint,
               v.loved_gift_sprite as gift_sprite
        FROM daily_villager d
            JOIN villagers v ON d.villager_id = v.id
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
        villager: {
            id: row.villager_id,
            name: row.name,
            gender: row.gender,
            region: row.region,
            birth_season: row.birth_season,
            birth_day: row.birth_day,
            marriageable: row.marriageable,
            age: row.age,
            portrait_url: row.portrait_url
        },
        giftHint: row.gift_hint,
        giftSprite: row.gift_sprite
    };
}

export const load: PageServerLoad = async ({ cookies, request }) => {
    try {
        const language = resolveLocale(cookies, request);

        return {
            daily: loadDailyVillager(language),
            yesterday: loadYesterdayVillager(language),
            villagers: loadVillagers(language),
        };
    } catch (err) {
        console.error('Failed to load daily villager data:', err);
        throw error(500, {
            message: 'Failed to load daily villager data'
        });
    }
};
