// Locales with a fully translated Paldle content set — every language Palworld ships.
// Add one by dropping a <code>.json under ./locales and a /static/flags/<code>.svg, then
// extending this map. Pal names/descriptions come from pal_translations in the DB (seeded
// from the datamine), independently of these UI strings.
//
// Codes are lowercase BCP-47 tags (es-mx, pt-br, zh-hans, zh-hant) so they match the
// server's `language.toLowerCase()` and the case-sensitive DB locale column. Keys with a
// hyphen force this to be a plain object rather than a TS enum (enum members can't be
// hyphenated).
export const Locales = {
	en: 'English',
	fr: 'Français',
	de: 'Deutsch',
	es: 'Español',
	'es-mx': 'Español (LatAm)',
	id: 'Bahasa Indonesia',
	it: 'Italiano',
	ko: '한국어',
	pl: 'Polski',
	'pt-br': 'Português (BR)',
	ru: 'Русский',
	th: 'ไทย',
	tr: 'Türkçe',
	vi: 'Tiếng Việt',
	'zh-hans': '简体中文',
	'zh-hant': '繁體中文'
} as const;

export type LocaleCode = keyof typeof Locales;

const CODES = Object.keys(Locales) as LocaleCode[];

// Region variants a browser may send that map onto a single shipped locale.
const ALIAS: Record<string, LocaleCode> = {
	zh: 'zh-hans',
	'zh-cn': 'zh-hans',
	'zh-sg': 'zh-hans',
	'zh-my': 'zh-hans',
	'zh-tw': 'zh-hant',
	'zh-hk': 'zh-hant',
	'zh-mo': 'zh-hant',
	pt: 'pt-br',
	'es-419': 'es-mx'
};

const isCode = (c: string): c is LocaleCode => (CODES as string[]).includes(c);

export function findSupportedLocaleFromAcceptedLanguages(acceptedLanguageHeader: string | null) {
	const locales =
		acceptedLanguageHeader?.split(',')?.map((lang) => lang.split(';')[0].trim()) ?? [];
	for (const locale of locales) {
		const supportedLocale = getSupportedLocale(locale);
		if (supportedLocale) {
			return supportedLocale;
		}
	}
}

/**
 * Best supported locale for a raw tag (cookie value or a single Accept-Language entry).
 * Case-insensitive; prefers the most specific shipped code, then a region alias, then the
 * primary subtag; falls back to English.
 */
export function getSupportedLocale(userLocale: string | undefined): LocaleCode {
	if (!userLocale) return 'en';
	const want = userLocale.toLowerCase();

	// exact shipped code (en, es-mx, zh-hant, …)
	if (isCode(want)) return want;
	// direct region alias (zh-tw -> zh-hant, es-419 -> es-mx, …)
	if (ALIAS[want]) return ALIAS[want];

	// most-specific shipped code the tag starts with (fr-CA -> fr, es-mx-… -> es-mx)
	const byLen = [...CODES].sort((a, b) => b.length - a.length);
	const pref = byLen.find((c) => want === c || want.startsWith(c + '-'));
	if (pref) return pref;

	// fall back on the primary subtag (zh -> zh-hans, pt -> pt-br, en-US -> en)
	const primary = want.split('-')[0];
	if (ALIAS[primary]) return ALIAS[primary];
	const prim = byLen.find((c) => c === primary || c.startsWith(primary + '-'));
	return prim ?? 'en';
}
