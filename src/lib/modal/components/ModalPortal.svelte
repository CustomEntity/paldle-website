<script lang="ts">

    import type {ModalPortalProps} from "$lib/modal/types";
    import {getModalContext} from "$lib/modal/context.svelte";

    let { children }: ModalPortalProps = $props();
    const ctx = getModalContext();
</script>

{#if ctx.open}
    <div class="fixed inset-0 z-50">
        {@render children()}
    </div>
{/if}