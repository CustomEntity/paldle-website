// Shared Pal display + comparison helpers (used by the Classic grid and share text).

export type Status = 'CORRECT' | 'PARTIALLY-CORRECT' | 'INCORRECT' | 'HIGHER' | 'LOWER';

export const ELEMENT_COLORS: Record<string, string> = {
	Neutral: '#a9b0bd',
	Fire: '#ff6b3d',
	Water: '#38a5f0',
	Electric: '#f5c531',
	Grass: '#56c95a',
	Ice: '#6fdce8',
	Ground: '#c8934e',
	Dark: '#9163d6',
	Dragon: '#bd6cf0'
};

export const elementColor = (el: string): string => ELEMENT_COLORS[el] ?? '#a9b0bd';

// Per-work-suitability accent colours. Palworld color-codes work types (see the game's
// E_PalUIWorkSuitabilityGaugeColorType); the raw WorkRank icons are white glyphs, so we
// tint a tile behind each one with its theme colour. Keys match pal.work_keys labels.
export const WORK_COLORS: Record<string, string> = {
	Kindling: '#ff6b3d',
	Watering: '#38a5f0',
	Planting: '#56c95a',
	Electricity: '#f5c531',
	Handiwork: '#e0a53a',
	Gathering: '#8fce54',
	Lumbering: '#c8934e',
	Mining: '#9aa7b4',
	OilExtraction: '#8a79a0',
	Medicine: '#ec6a8f',
	Cooling: '#6fdce8',
	Transporting: '#6d9ad6',
	Farming: '#7cb342'
};

export const workColor = (label: string): string => WORK_COLORS[label] ?? '#7f8a99';

// tint used behind a Pal icon in the grid (blend of its first element)
export function palTint(pal: Pick<Pal, 'elements'>): string {
	const c = elementColor(pal.elements?.[0] ?? 'Neutral');
	return `linear-gradient(180deg, ${c}33, ${c}18)`;
}

// Size is ordinal: XS < S < M < L < XL
export const SIZE_ORDER: Record<string, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5 };

export const compareNumber = (value: number | null, target: number | null): Status => {
	if (value == null || target == null) return value === target ? 'CORRECT' : 'INCORRECT';
	if (value === target) return 'CORRECT';
	return value > target ? 'LOWER' : 'HIGHER';
};

export const compareOrdinal = (
	value: string | null,
	target: string | null,
	order: Record<string, number>
): Status => {
	const v = order[value ?? ''] ?? 0;
	const t = order[target ?? ''] ?? 0;
	if (v === t) return 'CORRECT';
	return v < t ? 'HIGHER' : 'LOWER';
};

export const compareEquality = (value: unknown, target: unknown): Status =>
	value === target ? 'CORRECT' : 'INCORRECT';

// set overlap: full match -> CORRECT, some overlap -> PARTIALLY-CORRECT, none -> INCORRECT
export function compareSet(value: string[], target: string[]): Status {
	const a = [...new Set(value)].sort();
	const b = [...new Set(target)].sort();
	if (a.length === b.length && a.every((x, i) => x === b[i])) return 'CORRECT';
	return a.some((x) => b.includes(x)) ? 'PARTIALLY-CORRECT' : 'INCORRECT';
}

export const statusColor = (s: Status): string => {
	switch (s) {
		case 'CORRECT':
			return 'var(--ok)';
		case 'PARTIALLY-CORRECT':
			return 'var(--partial)';
		default:
			return 'var(--no)';
	}
};
