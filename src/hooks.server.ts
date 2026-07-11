import type { Handle } from '@sveltejs/kit';
import { resolveLocale } from '$lib/server/locale';

// app.html ships <html lang="%lang%">; substitute the resolved locale at render time so the
// server-rendered document has the correct lang attribute (SEO + accessibility).
export const handle: Handle = async ({ event, resolve }) => {
	const lang = resolveLocale(event.cookies, event.request);
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
