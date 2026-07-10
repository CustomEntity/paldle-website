<script lang="ts">

    import type {ModalTitleProps} from "$lib/modal/types";

    let {
        children,
        level = 'h2',
        class: className,
        ...restProps
    }: ModalTitleProps = $props();
</script>

<svelte:element
        class={className}
        this={level}
        {...restProps}
>
    {@render children()}
</svelte:element>