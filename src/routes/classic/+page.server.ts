import { error } from '@sveltejs/kit';
import { resolveLocale } from '$lib/server/locale';
import { loadPals, loadDaily, loadYesterday, loadPatchNotes } from '$lib/server/pals';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, request }) => {
	try {
		const language = resolveLocale(cookies, request);
		return {
			daily: loadDaily('classic', language),
			yesterday: loadYesterday('classic', language),
			pals: loadPals(language),
			patchNotes: loadPatchNotes('classic')
		};
	} catch (err) {
		console.error('Failed to load classic mode:', err);
		throw error(500, { message: 'Failed to load classic mode' });
	}
};
