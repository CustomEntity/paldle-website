import { queryDatabase } from "$lib/server/db";
import { resolveLocale } from '$lib/server/locale';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const nameSubquery = (cropIdExpr: string) => `
    (SELECT ct.name
     FROM crop_translations ct
     WHERE ct.crop_id = ${cropIdExpr}
       AND ct.language IN ($1, 'en')
     ORDER BY CASE WHEN ct.language = $1 THEN 0 ELSE 1 END
     LIMIT 1)`;

function mapCrop(row: any): Crop {
    return {
        id: row.id,
        key: row.key,
        name: row.name,
        growth: row.growth,
        price: row.price,
        regrow: row.regrow,
        type: row.type,
        seasons: row.seasons ?? [],
        sprite: row.sprite,
        sheet: row.sheet
    };
}

async function loadCrops(language: string = 'en'): Promise<Crop[]> {
    const statement = `
        SELECT c.id, c.key, ${nameSubquery('c.id')} as name,
               c.growth, c.price, c.regrow, c.type, c.seasons, c.sprite, c.sheet
        FROM crops c
        WHERE c.released = true
        ORDER BY c.id;
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.map(mapCrop);
}

async function loadYesterdayCrop(language: string = 'en'): Promise<{ game_id: number, name: string } | null> {
    const statement = `
        SELECT d.game_id, ${nameSubquery('d.crop_id')} as name
        FROM daily_crop d
        WHERE d.date = CURRENT_DATE - 1
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.length ? { game_id: records[0].game_id, name: records[0].name } : null;
}

async function loadDailyCrop(language: string = 'en'): Promise<DailyCropClassic | null> {
    const statement = `
        SELECT d.id, d.game_id, d.date, c.id as crop_id, c.key,
               ${nameSubquery('c.id')} as name,
               c.growth, c.price, c.regrow, c.type, c.seasons, c.sprite, c.sheet
        FROM daily_crop d
            JOIN crops c ON d.crop_id = c.id
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
        crop: mapCrop({ ...row, id: row.crop_id })
    };
}

export const load: PageServerLoad = async ({ cookies, request }) => {
    try {
        const language = resolveLocale(cookies, request);
        return {
            daily: loadDailyCrop(language),
            yesterday: loadYesterdayCrop(language),
            crops: loadCrops(language),
        };
    } catch (err) {
        console.error('Failed to load daily crop data:', err);
        throw error(500, { message: 'Failed to load daily crop data' });
    }
};
