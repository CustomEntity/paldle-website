<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        children: Snippet;
    }

    const {children}: Props = $props();

</script>

<div class="flex justify-center items-center gap-5 pal-frame font-lilita px-8 py-3">
    {@render children()}
</div>