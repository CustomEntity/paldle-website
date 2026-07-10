<script lang="ts">

    import type {ModalRootProps} from "$lib/modal/types";
    import {setModalContext} from "$lib/modal/context.svelte";

    let {
        open,
        onOpenChange,
        closeOnEscape = true,
        closeOnOutsideClick = true,
        children,
        ...restProps
    }: ModalRootProps = $props();

    const ctx = setModalContext({
        onOpenChange: (next) => {
            if (open !== next) {
                onOpenChange?.(next);
                open = next;
            }
        }
    });



    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });
</script>

{@render children?.()}