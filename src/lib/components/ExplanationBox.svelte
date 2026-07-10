<!-- ExplanationBox.svelte -->
<script lang="ts">
    import type {Snippet} from "svelte";
    import locale from "$lib/stores/locale.svelte";
    import ContentCard from "$lib/components/ContentCard.svelte";

    interface Props {
        title: string;
        content?: Snippet;
        activeHint?: {
            id: string;
            content: Snippet;
        };
    }

    let {title, content: contentProp, activeHint, ...rest}: Props = $props();
</script>

<div class="relative w-full max-w-[370px] min-h-[135px] sv-frame font-lilita">
    <!-- Content -->
    <div class="flex flex-col h-full w-full px-10  py-4 stardew-text">
        {@render contentProp?.()}
        {#if activeHint}
            <div class="flex justify-center mt-6 bg-[#D3D3D3]/10 p-4 rounded-sm mx-3">
                {@render activeHint.content?.()}
            </div>
        {/if}
    </div>
</div>