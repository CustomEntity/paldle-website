import en from './locales/en.json';
import type { LocaleCode } from './locales';
import type { TranslationKeys } from './types';
import { interpolate } from './interpolate';
import { dev } from '$app/environment';

const loadedTranslations: Record<string, typeof en> = {
	en // start with default language
};

export async function getTranslator(locale: LocaleCode) {
	if (!locale)
		locale = 'en';
	if (!loadedTranslations[locale])
		loadedTranslations[locale] = (await import(`./locales/${locale ?? 'en'}.json`)).default;

	return (key: TranslationKeys, options?: Record<string, any>) => {
		const keys = key.split('.');

		const resolveTranslation = (obj: any, keys: string[]): string | undefined => {
			for (const k of keys) {
				if (!obj || typeof obj !== 'object') {
					return undefined;
				}
				obj = obj[k];
			}
			return typeof obj === 'string' ? obj : undefined;
		};

		const localeResult = resolveTranslation(loadedTranslations[locale], keys);
		if (localeResult) return interpolate(localeResult, options);

		console.warn(`Missing ${locale} translation for ${key}`);
		const fallbackResult = resolveTranslation(loadedTranslations.en, keys);
		if (fallbackResult) return interpolate(fallbackResult, options);

		const error = `Missing English translation for: ${key}`;
		if (dev) throw new Error(error);
		console.error(error);
		return key;
	};
}
