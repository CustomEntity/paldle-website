import type { LayoutLoad } from './$types';
import { getSupportedLocale } from '$lib/i18n/locales';
import { getTranslator } from '$lib/i18n';

export const load: LayoutLoad = async ({ data: { acceptedLanguage, chosenLocale } }) => {
	const locale = getSupportedLocale(chosenLocale || acceptedLanguage || 'en');

	const t = await getTranslator(locale);
	return { locale, t };
};
