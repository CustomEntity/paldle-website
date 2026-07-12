import type { LayoutLoad } from './$types';
import { getSupportedLocale } from '$lib/i18n/locales';
import { getTranslator } from '$lib/i18n';

export const load: LayoutLoad = async ({ data: { acceptedLanguage, chosenLocale } }) => {
	const locale = getSupportedLocale(chosenLocale || acceptedLanguage || 'en');

	const t = await getTranslator(locale);
	// Forward `chosenLocale` so the layout can tell an explicit cookie choice apart from
	// browser/Accept-Language detection and keep the crawler/embed meta English by default.
	return { locale, t, chosenLocale };
};
