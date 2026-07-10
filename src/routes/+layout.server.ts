import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies, request }) => {
    const acceptedLanguage = request.headers.get('accept-language')?.split(',')[0].trim();
    const chosenLocale = cookies.get('locale');
    return { acceptedLanguage, chosenLocale };
};
