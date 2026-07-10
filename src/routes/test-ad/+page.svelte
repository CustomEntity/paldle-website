<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    onMount(() => {
        if (!browser) return;

        const windowNitroAds: any = (window as any)["nitroAds"];

        if (!windowNitroAds) {
            console.warn("NitroAds not loaded");
            return;
        }

        windowNitroAds.createAd("anchor-ad", {
            refreshTime: 30,
            format: "anchor-v2",
            anchor: "bottom",
            anchorPersistClose: false,
            mediaQuery: "(min-width: 0px)",
            report: {
                enabled: true,
                icon: true,
                wording: "Report Ad",
                position: "top-right",
            },
        });
    });
</script>

<div class="flex flex-col items-center justify-center gap-6 py-20 text-white">
    <h1 class="text-3xl font-bold">Test Anchor Ad</h1>
    <p class="text-gray-400">L'anchor-ad devrait apparaître en bas de la page.</p>
    <div class="h-[200vh] flex items-center justify-center">
        <p class="text-gray-500 text-sm">Scroll pour tester le comportement de l'ad</p>
    </div>
</div>
