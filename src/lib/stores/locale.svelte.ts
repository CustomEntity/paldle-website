import type {TranslationKeys} from "$lib/i18n/types";
import en from "$lib/i18n/locales/en.json";

interface I18nState {
    locale: string;
    t: (key: TranslationKeys, options?: Record<string, any>) => string;
}

// Default translator: resolve against the statically-bundled English strings so the
// SSR-critical bits (page <title>, og:*/twitter:* meta) never leak raw i18n keys into
// the Discord/SEO embed before the per-request translator is assigned. Worst case the
// crawler sees English — which is exactly the intended default.
const resolveEn = (key: string): string => {
    let obj: any = en;
    for (const k of key.split('.')) {
        if (!obj || typeof obj !== 'object') return key;
        obj = obj[k];
    }
    return typeof obj === 'string' ? obj : key;
};

const state = $state<I18nState>({
    locale: 'en',
    t: (key) => resolveEn(key)
});

const store = {
    get locale() {
        return state.locale;
    },
    set locale(value: string) {
        state.locale = value;
    },
    get t() {
        return state.t;
    },
    set t(value: (key: TranslationKeys, options?: Record<string, any>) => string) {
        state.t = value;
    },
    setLocale(value: string) {
        this.locale = value;
        if (typeof document !== 'undefined') {
            document.cookie = `locale=${value}; path=/; max-age=31536000`;
        }
    }
};

export default store;