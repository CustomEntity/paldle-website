<script lang="ts">
    import {fly, fade} from 'svelte/transition';
    import type {Snippet} from 'svelte';

    interface Props {
        trigger?: Snippet<[() => void]>;
        title: Snippet;
        content: Snippet;
        onOpenChange?: (open: boolean) => void;
    }

    let isOpen = $state(false);
    const {trigger, title, content, onOpenChange}: Props = $props();

    function toggleModal() {
        isOpen = !isOpen;
        onOpenChange?.(isOpen);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && isOpen) {
            toggleModal();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown}/>

{#if trigger}
    {@render trigger(() => toggleModal())}
{/if}

<div class="fixed inset-0 z-50 {isOpen ? 'visible' : 'invisible pointer-events-none'}" onclick={toggleModal}>
    <div
            class="fixed inset-0 bg-black/40 transition-opacity duration-200 {isOpen ? 'opacity-100' : 'opacity-0'}"
    ></div>

    <div
            class="fixed left-[50%] top-[50%] z-50 w-[90%] max-w-[94%] max-h-[90%] translate-x-[-50%] translate-y-[-50%] outline-none sm:max-w-[890px] md:w-full  transition-all duration-200 {isOpen ? 'opacity-100 translate-y-[-50%]' : 'opacity-0 translate-y-[-45%]'}"
            onclick={(e) => e.stopPropagation()}
    >
        <button
                class="sv-close absolute z-30 -top-3 -right-3 cursor-pointer hover:scale-110 active:scale-95 duration-150"
                aria-label="Close"
                onclick={toggleModal}
        >
            <img src="/ui/close.png" alt="Close" width="36" height="36" style="image-rendering: pixelated; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.35));"/>
        </button>
        <div class="sv-letter flex flex-col h-full overflow-hidden">
            <div class="pt-1 pb-2">
                <h2 class="flex justify-center items-center text-2xl uppercase text-[#6a3b18] font-lilita"
                    style="text-shadow: 1px 1px 0 rgba(255,247,214,0.7);">
                    {@render title()}
                </h2>
                <div class="mx-auto mt-1 h-[3px] w-[70%] rounded-full bg-[#c9a24a]/60"></div>
            </div>
            <div
                    class="h-[50vh] px-2 pb-2 overflow-y-auto font-lilita text-[#4a3016]"
            >
                {@render content()}
            </div>
        </div>




    </div>
</div>