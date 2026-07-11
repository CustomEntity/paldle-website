import { queryDatabase } from '$lib/server/db';

export type Mode = 'classic' | 'description' | 'silhouette' | 'sound';
const DAILY_TABLE: Record<Mode, string> = {
	classic: 'daily_classic',
	description: 'daily_description',
	silhouette: 'daily_silhouette',
	sound: 'daily_sound'
};

// localized name with EN fallback, $1 = language
const nameSubquery = (palIdExpr: string) => `
    (SELECT t.name FROM pal_translations t
      WHERE t.pal_id = ${palIdExpr} AND t.locale IN ($1, 'en')
      ORDER BY CASE WHEN t.locale = $1 THEN 0 ELSE 1 END
      LIMIT 1)`;

const localizedDesc = (palIdExpr: string) => `
    (SELECT COALESCE(NULLIF(t.description, ''), en.description)
       FROM pal_translations t
       LEFT JOIN pal_translations en ON en.pal_id = ${palIdExpr} AND en.locale = 'en'
      WHERE t.pal_id = ${palIdExpr} AND t.locale IN ($1, 'en')
      ORDER BY CASE WHEN t.locale = $1 THEN 0 ELSE 1 END
      LIMIT 1)`;

const PAL_COLUMNS = `
    p.id, p.key, p.paldeck, p.paldeck_num, p.elements, p.rarity, p.size,
    p.genus, p.mount, p.nocturnal, p.food_amount, p.work_keys, p.partner_skill`;

function toPal(row: any): Pal {
	return {
		id: row.id,
		key: row.key,
		name: row.name,
		paldeck: row.paldeck,
		paldeck_num: row.paldeck_num,
		elements: row.elements ?? [],
		rarity: row.rarity,
		size: row.size,
		genus: row.genus,
		mount: row.mount,
		nocturnal: row.nocturnal,
		food_amount: row.food_amount,
		work_keys: row.work_keys ?? [],
		partner_skill: row.partner_skill,
		icon: `/pals/${row.key}.webp`,
		description: row.description ?? null
	};
}

/** Full roster (autocomplete + Classic grid), localized names. */
export async function loadPals(language = 'en'): Promise<Pal[]> {
	const rows = await queryDatabase<any[]>(
		`SELECT ${PAL_COLUMNS}, ${nameSubquery('p.id')} AS name
		 FROM pals p WHERE p.released = true ORDER BY p.paldeck_num NULLS LAST, p.key`,
		[language.toLowerCase()]
	);
	return rows.map(toPal);
}

/** Today's answer for a mode. Description mode also returns the localized description. */
export async function loadDaily(mode: Mode, language = 'en'): Promise<DailyPal | null> {
	const table = DAILY_TABLE[mode];
	const descCol = mode === 'description' ? `, ${localizedDesc('p.id')} AS description` : '';
	const rows = await queryDatabase<any[]>(
		`SELECT d.id, d.game_id, d.date, ${PAL_COLUMNS}, ${nameSubquery('p.id')} AS name${descCol}
		 FROM ${table} d JOIN pals p ON p.id = d.pal_id
		 WHERE d.date = CURRENT_DATE LIMIT 1`,
		[language.toLowerCase()]
	);
	if (!rows.length) return null;
	const r = rows[0];
	return { id: r.id, game_id: r.game_id, date: r.date, pal: toPal(r) };
}

/** Changelog entries for a mode (newest first). */
export async function loadPatchNotes(mode: Mode): Promise<PatchNote[]> {
	return queryDatabase<PatchNote[]>(
		`SELECT id, to_char(date, 'YYYY-MM-DD') AS date, mode, content
		 FROM patch_notes WHERE mode = $1 ORDER BY date DESC`,
		[mode]
	);
}

/** Yesterday's answer (game_id + localized name) for the "yesterday was …" line. */
export async function loadYesterday(
	mode: Mode,
	language = 'en'
): Promise<{ game_id: number; name: string } | null> {
	const table = DAILY_TABLE[mode];
	const rows = await queryDatabase<any[]>(
		`SELECT d.game_id, ${nameSubquery('d.pal_id')} AS name
		 FROM ${table} d WHERE d.date = CURRENT_DATE - 1 LIMIT 1`,
		[language.toLowerCase()]
	);
	return rows.length ? { game_id: rows[0].game_id, name: rows[0].name } : null;
}
