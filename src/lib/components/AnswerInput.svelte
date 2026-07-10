<!-- AnswerInput.svelte -->
<script lang="ts">
    import type {Snippet} from "svelte";
    import locale from "$lib/stores/locale.svelte";
    import MarvelRivalsButton from "$lib/components/buttons/MarvelRivalsButton.svelte";

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
                type="text" class="sv-input px-3 py-2 w-full font-lilita text-lg">

        <MarvelRivalsButton
                title={locale.t('components.answerInput.button.submit.title')}
                height="100%"
                class="md:min-w-[170px] min-w-[135px]"
                onClick={handleButtonClick}
        />
    </div>
    {#if showMenu && searchOption !== ''}
        <div class="absolute w-full bg-[#f3ddab] flex flex-col overflow-y-auto max-h-[30vh] z-20 mt-1 border-[3px] border-[#7a4a24] overflow-hidden">
            {#if loading}
                <div class="text-[#5a3a1c] p-2">{locale.t('components.answerInput.states.loading')}</div>
            {:else}
                {#if filteredOptions.length === 0}
                    <div class="text-[#5a3a1c] p-2">{locale.t('components.answerInput.states.no_result')}</div>
                {:else}
                    {#each filteredOptions as option}
                        <button
                                class="hover:bg-[#e6c485] text-left p-2 text-[#5a3a1c] cursor-pointer transition-colors duration-200"
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
    /* Uniquement pour les styles de scrollbar qui ne peuvent pas être gérés par Tailwind */
    :global(.scrollbar-thin::-webkit-scrollbar) {
        width: 10px;
    }

    :global(.scrollbar-thin::-webkit-scrollbar-track) {
        background: #3a2a18;
    }

    :global(.scrollbar-thin::-webkit-scrollbar-thumb) {
        background-color: #fff;
        border-radius: 20px;
        border: 3px solid #3a2a18;
    }

    :global(.scrollbar-thin::-webkit-scrollbar-thumb:hover) {
        background-color: #e0e0e0;
    }
</style>