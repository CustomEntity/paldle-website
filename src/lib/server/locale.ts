import type { Cookies } from '@sveltejs/kit';
import { getSupportedLocale } from '$lib/i18n/locales';

/**
 * Resolve the request locale the SAME way the UI does (see +layout.ts): the explicit
 * `locale` cookie first, then the browser's Accept-Language, then English. Using cookie-only
 * on the server made villager/crop/fish NAMES fall back to English whenever the locale came
 * from the browser language rather than a set cookie (e.g. a French phone with no cookie).
 */
export function resolveLocale(cookies: Cookies, request: Request): string {
	const cookie = cookies.get('locale');
	const accept = request.headers.get('accept-language')?.split(',')[0]?.trim();
	return getSupportedLocale(cookie || accept || 'en');
}
