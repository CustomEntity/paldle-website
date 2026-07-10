import type {TranslationKeys} from "$lib/i18n/types";

interface I18nState {
    locale: string;
    t: (key: TranslationKeys, options?: Record<string, any>) => string;
}

const state = $state<I18nState>({
    locale: 'en',
    t: (key, options) => key
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