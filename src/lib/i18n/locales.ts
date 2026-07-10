// Only the languages Stardew Valley itself ships with, so every in-game name/term has an
// official translation. (Stardew LanguageCodes: en, fr, es, de, it, pt, ru, tr, th, ja, ko, zh, hu.)
export enum Locales {
	en = 'English',
	fr = 'Français',
	es = 'Español',
	de = 'Deutsch',
	it = 'Italiano',
	pt = 'Português',
	tr = 'Türkçe',
	ru = 'Русский',
	th = 'ไทย',
	jp = '日本語',
	kr = '한국어',
	cn = '简体中文'
}

export type LocaleCode = keyof typeof Locales;

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

export function getSupportedLocale(userLocale: string | undefined) {
	if (!userLocale) {
		return 'en';
	}

	const matchedLocale = Object.keys(Locales).find((supportedLocale) => {
		return userLocale.includes(supportedLocale);
	});

	return (matchedLocale as LocaleCode) || 'en';
}