<!-- AnswerInput.svelte -->
<script lang="ts">
    import type {Snippet} from "svelte";
    import locale from "$lib/stores/locale.svelte";
    import PalButton from "$lib/components/buttons/PalButton.svelte";

    interface Props {
        id: string;
        placeholder: string;
        onselect?: (option: string) => void;
        showMenu?: boolean;
        options?: string[];
        loading?: boolean;
        filter?: (option: string, searchTerm: string) => boolean;
        sort?: (a: string, b: string) => number;
        item?: Snippet<[string]>;
    }

    let {
        id,
        placeholder,
        onselect,
        showMenu = false,
        options = [],
        loading = false,
        item,
        filter = (option, searchTerm) => option.toLowerCase().includes(searchTerm.toLowerCase()),
        sort = (a, b) => a.localeCompare(b),
    }: Props = $props();

    let searchOption = $state('');

    function handleSelect(option: string) {
        searchOption = '';
        showMenu = false;
        if (onselect)
            onselect(option);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && filteredOptions.length > 0 && searchOption !== '') {
            handleSelect(filteredOptions[0]);
        } else if (event.key === 'Escape') {
            showMenu = false;
        }
    }

    function handleButtonClick() {
        if (filteredOptions.length === 1) {
            handleSelect(filteredOptions[0]);
            searchOption = '';
        } else {
            showMenu = !showMenu;
        }
    }

    const filteredOptions = $derived(options.filter(option => filter(option, searchOption)).sort(sort));
</script>

<div
        id={id}
        class="relative w-[90%] md:w-full max-w-[480px] h-[50px]">
    <div class="flex h-full w-full gap-2">
        <input
                onfocus={() => (showMenu = true)}
                onblur={() => (showMenu = false)}
                oninput={() => (showMenu = true)}
                bind:value={searchOption}
                onkeydown={handleKeydown}
                {placeholder}
                style=" filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8));"
                type="text" class="pal-input px-3 py-2 w-full font-lilita text-lg">

        <PalButton
                title={locale.t('components.answerInput.button.submit.title')}
                height="100%"
                class="md:min-w-[170px] min-w-[135px]"
                onClick={handleButtonClick}
        />
    </div>
    {#if showMenu && searchOption !== ''}
        <div class="pal-suggest absolute w-full flex flex-col overflow-y-auto max-h-[30vh] z-20 mt-2">
            {#if loading}
                <div class="text-white/70 p-3">{locale.t('components.answerInput.states.loading')}</div>
            {:else}
                {#if filteredOptions.length === 0}
                    <div class="text-white/60 p-3">{locale.t('components.answerInput.states.no_result')}</div>
                {:else}
                    {#each filteredOptions as option}
                        <button
                                class="pal-suggest-item text-left px-3 py-2 cursor-pointer"
                                onmousedown={() => handleSelect(option)}
                        >
                            {@render item?.(option)}
                        </button>
                    {/each}
                {/if}
            {/if}
        </div>
    {/if}
</div>

<style>
    /* dropdown scrollbar — teal on navy, matches the site */
    .pal-suggest::-webkit-scrollbar { width: 10px; }
    .pal-suggest::-webkit-scrollbar-track { background: rgba(10, 22, 40, 0.5); }
    .pal-suggest::-webkit-scrollbar-thumb {
        background-color: #22a7d8;
        border-radius: 20px;
        border: 3px solid rgba(10, 22, 40, 0.6);
    }
    .pal-suggest::-webkit-scrollbar-thumb:hover { background-color: #37d0e6; }
</style>