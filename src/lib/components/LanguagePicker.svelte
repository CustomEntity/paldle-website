<script lang="ts">
    import {type LocaleCode, Locales} from '$lib/i18n/locales';
    import {changeLocale} from '$lib/i18n/changeLocale';
    import {getTranslator} from '$lib/i18n';
    import {fade, fly} from 'svelte/transition';
    import locale from "$lib/stores/locale.svelte";
    import {invalidateAll} from "$app/navigation";

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
    <!-- Main Button -->
    <button
            class="relative flex items-center justify-between w-[224px] h-[42px] transition-transform duration-150 hover:scale-[0.98] active:scale-95"
            onclick={() => (isOpen = !isOpen)}
    >
        <!-- Button Background with Brawl Stars style -->
        <div class="absolute inset-0 bg-gradient-to-b from-[#f8e6b4] to-[#efd396] border-[3px] border-[#7a4a24] rounded-[7px]" style="box-shadow: inset 0 2px 0 #fff7db, inset 0 -3px 0 #d9b06f;">
        </div>

        <!-- Content -->
        <div class="relative flex justify-between items-center w-full px-4 z-10">
            <span class="text-[#8a4a1f] text-lg font-bold drop-shadow-[1px_1px_0px_rgba(255,247,214,0.6)]">
                {locale.t('lang.name')}
            </span>

            <div class="flex items-center space-x-2">
                <img
                        width="24"
                        height="18"
                        src="/flags/{locale.locale}.svg"
                        alt="flag"
                        class="w-8 h-6 rounded-[3px] shadow-[0_0_2px_rgba(0,0,0,0.3)]"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                    <path d="M5 7L9.33013 0.25H0.669873L5 7Z" fill="#8a4a1f"/>
                    <path d="M5 7L9.33013 0.25H0.669873L5 7Z" stroke="black" stroke-width="0.5"/>
                </svg>
            </div>
        </div>
    </button>

    <!-- Dropdown List -->
    {#if isOpen}
        <div
                transition:fly={{ y: -10, duration: 200 }}
                class="absolute w-full mt-[10px] z-20 border-[3px] border-[#7a4a24] rounded-[7px] overflow-hidden"
        >
            <div class="flex flex-col bg-[#f3ddab] max-h-[320px] overflow-y-auto">
                {#each Object.entries(Locales) as [lang, supportedLocale], index}
                    {#if lang !== locale.locale}
                        <button
                                class="{
                                index > 0 ? 'border-t-[1.5px] border-t-[#7a4a24]/25' : ''
                                }relative w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#e6c485] active:bg-[#d9b06f] transition-colors duration-150 group"
                                onclick={(e) => {
                        e.preventDefault();
                        changeLanguage(lang as LocaleCode);
                        isOpen = false;
                    }}
                        >
                        <span class="text-[#6a3b18] font-bold text-lg drop-shadow-[1px_1px_0px_rgba(255,247,214,0.5)] group-hover:scale-105 transition-transform">
                                {supportedLocale}
                            </span>
                            <img
                                    src="/flags/{lang}.svg"
                                    alt="flag"
                                    class="w-8 h-6 rounded-[3px] shadow-[0_0_2px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform"
                            />
                        </button>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
</div>