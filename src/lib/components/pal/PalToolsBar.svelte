<script lang="ts">
    import ToolsBar from "$lib/components/ToolsBar.svelte";
    import StatsModal from "$lib/components/pal/StatsModal.svelte";
    import PatchNotesModal from "$lib/components/pal/PatchNotesModal.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import StylizedModal from "$lib/components/StylizedModal.svelte";
    import locale from "$lib/stores/locale.svelte";
    import type { PalGameData } from "$lib/stores/palGameData.svelte";

    interface Props {
        gameData: PalGameData;
        mode: "classic" | "description" | "silhouette" | "sound";
        patchNotes?: Promise<PatchNote[]>;
    }

    const { gameData, mode, patchNotes }: Props = $props();
    const streak = $derived(gameData.stats.current_streak);
</script>

<ToolsBar>
    <StatsModal stats={gameData.stats}>
        {#snippet button(toggleModal)}
            <button onclick={toggleModal} class="cursor-pointer size-[32px] duration-300" aria-label={locale.t("components.toolsBar.stats.alt")}>
                <Tooltip text={locale.t("components.toolsBar.stats.tooltip")}>
                    <img src="/toolsbar/stats.png" class="w-full h-full object-fit opacity-75 hover:opacity-100" alt={locale.t("components.toolsBar.stats.alt")} />
                </Tooltip>
            </button>
        {/snippet}
    </StatsModal>

    <div class="w-8 relative bottom-[3px]">
        <Tooltip maxWidth={150} text={locale.t("components.toolsBar.streak.tooltip")}>
            {#if streak > 0}
                <img src="/toolsbar/active_streak.gif" class="w-full h-full object-fit" alt={locale.t("components.toolsBar.streak.active")} />
            {:else}
                <img src="/toolsbar/not_active_streak.png" class="w-full h-full object-fit" alt={locale.t("components.toolsBar.streak.inactive")} />
            {/if}
            <span class="absolute text-black text-md font-bold text-center"
                  style="top:50%;left:50%;transform:translate(-50%,-20%);text-shadow:0 0 5px #fff,0 0 5px #fff,0 0 5px #fff;">
                {streak}
            </span>
        </Tooltip>
    </div>

    <PatchNotesModal {patchNotes}>
        {#snippet button(toggleModal)}
            <button onclick={toggleModal} class="cursor-pointer size-[32px] duration-300" aria-label={locale.t("components.toolsBar.patchNotes.alt")}>
                <Tooltip text={locale.t("components.toolsBar.patchNotes.tooltip")}>
                    <img src="/toolsbar/changelog.png" class="w-full h-full object-fit opacity-75 hover:opacity-100" alt={locale.t("components.toolsBar.patchNotes.alt")} />
                </Tooltip>
            </button>
        {/snippet}
    </PatchNotesModal>

    <StylizedModal>
        {#snippet trigger(toggleModal)}
            <button onclick={toggleModal} class="flex items-center justify-center w-8 duration-300 hover:cursor-pointer" aria-label={locale.t("components.toolsBar.howToPlay.tooltip")}>
                <Tooltip maxWidth={150} text={locale.t("components.toolsBar.howToPlay.tooltip")}>
                    <svg class="size-12 stroke-white/80 hover:stroke-white" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 13C12.5 11 14 11.5 14 10C14 9.34375 13.5 8.5 12.5 8.5C11.5 8.5 11 9 10.5 9.5M12.5 16V14.5M20.5 12.5C20.5 16.9183 16.9183 20.5 12.5 20.5C8.08172 20.5 4.5 16.9183 4.5 12.5C4.5 8.08172 8.08172 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5Z" stroke-width="1.2"></path>
                    </svg>
                </Tooltip>
            </button>
        {/snippet}
        {#snippet title()}
            {locale.t(`pages.${mode}.how_to.title` as any)}
        {/snippet}
        {#snippet content()}
            <div class="flex flex-col gap-3 text-left text-[#16324e] leading-relaxed">
                {@html locale.t(`pages.${mode}.how_to.body` as any)}
            </div>
        {/snippet}
    </StylizedModal>
</ToolsBar>
