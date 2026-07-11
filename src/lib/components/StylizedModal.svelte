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
                class="pal-close absolute z-30 -top-3 -right-3 cursor-pointer hover:scale-110 active:scale-95 duration-150"
                aria-label="Close"
                onclick={toggleModal}
        >×</button>
        <div class="pal-letter flex flex-col h-full overflow-hidden">
            <div class="pt-5 pb-2 px-6">
                <h2 class="flex justify-center items-center text-2xl uppercase text-[#7fe8ff] pal-title font-lilita">
                    {@render title()}
                </h2>
                <div class="mx-auto mt-2 h-[3px] w-[70%] rounded-full bg-[#37d0e6]/70"></div>
            </div>
            <div
                    class="h-[50vh] px-7 pb-5 overflow-y-auto font-lilita text-[#e6f2ff]"
            >
                {@render content()}
            </div>
        </div>




    </div>
</div>