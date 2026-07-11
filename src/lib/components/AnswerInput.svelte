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
    let rootEl: HTMLDivElement | undefined = $state();

    // Keep the suggestion menu open independently of input focus, so grabbing the
    // dropdown scrollbar (which blurs the input) no longer closes it. It closes on
    // select, Escape, or a pointer press outside the component.
    $effect(() => {
        if (!showMenu) return;
        const onDocPointerDown = (e: PointerEvent) => {
            if (rootEl && !rootEl.contains(e.target as Node)) showMenu = false;
        };
        window.addEventListener('pointerdown', onDocPointerDown, true);
        return () => window.removeEventListener('pointerdown', onDocPointerDown, true);
    });

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
        bind:this={rootEl}
        class="relative w-[90%] md:w-full max-w-[480px] h-[50px]">
    <div class="flex h-full w-full gap-2">
        <input
                onfocus={() => (showMenu = true)}
                oninput={() => (showMenu = true)}
                bind:value={searchOption}
                onkeydown={handleKeydown}
                {placeholder}
                type="text" class="pal-input px-4 w-full font-lilita text-lg">

        <PalButton
                title={locale.t('components.answerInput.button.submit.title')}
                height="100%"
                class="md:min-w-[150px] min-w-[128px]"
                onClick={handleButtonClick}
        />
    </div>
    {#if showMenu && searchOption !== ''}
        <div class="pal-suggest"
             style="position:absolute; left:0; right:0; top:calc(100% + 8px); z-index:50; padding:16px;">
            <div class="suggest-scroll flex flex-col" style="max-height:300px; overflow-y:auto; overscroll-behavior:contain;">
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
        </div>
    {/if}
</div>

<style>
    /* inner scroll area (the frame stays fixed on .pal-suggest, only this scrolls) */
    .suggest-scroll::-webkit-scrollbar { width: 10px; }
    .suggest-scroll::-webkit-scrollbar-track { background: rgba(10, 22, 40, 0.5); }
    .suggest-scroll::-webkit-scrollbar-thumb {
        background-color: #22a7d8;
        border-radius: 20px;
        border: 3px solid rgba(10, 22, 40, 0.6);
    }
    .suggest-scroll::-webkit-scrollbar-thumb:hover { background-color: #37d0e6; }
</style>