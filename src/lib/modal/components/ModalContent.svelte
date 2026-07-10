<script lang="ts">
    import {fade, fly} from 'svelte/transition';
    import {getModalContext} from "$lib/modal/context.svelte";
    import type {ModalContentProps} from "$lib/modal/types";

    let {
        children,
        class: className,
        transition = fade,
        transitionConfig,
        ...restProps
    }: ModalContentProps = $props();

    const ctx = getModalContext();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && ctx.closeOnEscape) {
            ctx.setOpen(false);
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

    <div
            in:fly|global={{duration: 200, y: -10}}
            out:fly|global={{duration: 200, y: 10}}
            role="dialog"
            aria-modal="true"
            class={className}
            {...restProps}
    >
        {@render children()}
    </div>