<script lang="ts">
    import { type LocaleCode, Locales } from "$lib/i18n/locales";
    import { changeLocale } from "$lib/i18n/changeLocale";
    import { getTranslator } from "$lib/i18n";
    import { fly } from "svelte/transition";
    import locale from "$lib/stores/locale.svelte";
    import { invalidateAll } from "$app/navigation";

    let isOpen = $state(false);

    const changeLanguage = async (newLocale: LocaleCode) => {
        changeLocale(newLocale);
        const t = await getTranslator(newLocale);
        locale.locale = newLocale;
        locale.t = t;
        await invalidateAll();
    };
</script>

<div class="relative">
    <button
        class="pal-select relative flex items-center justify-between w-[224px] h-[44px] px-4 transition-transform duration-150 hover:scale-[0.99] active:scale-95"
        onclick={() => (isOpen = !isOpen)}
    >
        <span class="text-white text-lg font-bold">{locale.t("lang.name")}</span>
        <div class="flex items-center gap-2">
            <img width="24" height="18" src="/flags/{locale.locale}.svg" alt="flag" class="w-8 h-6 rounded-[3px] shadow" />
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path d="M5 7L9.33013 0.25H0.669873L5 7Z" fill="#eaf4ff" />
            </svg>
        </div>
    </button>

    {#if isOpen}
        <div transition:fly={{ y: -10, duration: 200 }}
             class="pal-select absolute w-full mt-[10px] z-20 overflow-hidden">
            <div class="flex flex-col max-h-[320px] overflow-y-auto">
                {#each Object.entries(Locales) as [lang, label]}
                    {#if lang !== locale.locale}
                        <button
                            class="w-full px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/10 active:bg-white/15 transition-colors duration-150 group"
                            onclick={(e) => {
                                e.preventDefault();
                                changeLanguage(lang as LocaleCode);
                                isOpen = false;
                            }}
                        >
                            <span class="text-white font-bold text-lg group-hover:scale-105 transition-transform">{label}</span>
                            <img src="/flags/{lang}.svg" alt="flag" class="w-8 h-6 rounded-[3px] shadow group-hover:scale-110 transition-transform" />
                        </button>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
</div>
