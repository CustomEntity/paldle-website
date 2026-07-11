// Locales with a fully translated Paldle content set. More can be added by dropping a
// <code>.json under ./locales and extending this enum (Pal names/descriptions come from
// pal_translations in the DB, independently of these UI strings).
export enum Locales {
	en = 'English',
	fr = 'Français'
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
