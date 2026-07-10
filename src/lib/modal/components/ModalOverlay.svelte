<script lang="ts">
    import {fade, fly} from 'svelte/transition';
    import type {ModalOverlayProps} from "$lib/modal/types";
    import {getModalContext} from "$lib/modal/context.svelte";

    let {
        class: className,
        transition = fade,
        transitionConfig,
        ...restProps
    }: ModalOverlayProps = $props();

    const ctx = getModalContext();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && ctx.closeOnEscape) {
            ctx.setOpen(false);
        }
    }

</script>

<svelte:window on:keydown={handleKeydown}/>

{#if ctx.open}
    <div
            role="dialog"
            aria-modal="true"
            onclick={() => ctx.setOpen(false)}
            class={className}
            {...restProps}
    >

    </div>
{/if}