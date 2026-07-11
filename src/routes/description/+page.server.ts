import { error } from '@sveltejs/kit';
import { resolveLocale } from '$lib/server/locale';
import { loadPals, loadDaily, loadYesterday, loadPatchNotes } from '$lib/server/pals';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, request }) => {
	try {
		const language = resolveLocale(cookies, request);
		return {
			daily: loadDaily('description', language),
			yesterday: loadYesterday('description', language),
			pals: loadPals(language),
			patchNotes: loadPatchNotes('description')
		};
	} catch (err) {
		console.error('Failed to load description mode:', err);
		throw error(500, { message: 'Failed to load description mode' });
	}
};
