<script lang="ts">
    import {getModalContext} from "$lib/modal/context.svelte";
    import type {ModalTriggerProps} from "$lib/modal/types";

    let {children, class: className, ...restProps}: ModalTriggerProps = $props();
    const ctx = getModalContext();

    function handleClick() {
        ctx.setOpen(true);
    }
</script>

<button onclick={handleClick} class={className} {...restProps}>
    {@render children()}
</button>