<script lang="ts">
    import type {Snippet} from "svelte";
    import StylizedModal from "$lib/components/StylizedModal.svelte";
    import type {PatchNote} from "../+page.server";
    import Spinner from "$lib/components/spinner/Spinner.svelte";
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        button: Snippet<[() => void]>;
        patchNotes: Promise<PatchNote[]>;
    }

    const {button, patchNotes}: Props = $props();
</script>

<StylizedModal>
    {#snippet trigger(toggleModal)}
        {@render button(toggleModal)}
    {/snippet}

    {#snippet title()}
        {locale.t('pages.villager.modals.patchNotes.title')}
    {/snippet}

    {#snippet content()}
        {#await patchNotes}
            <div class="flex flex-col space-y-4 items-center justify-center min-h-[200px]">
                <span class="text-[#4a3016] text-lg">{locale.t('pages.villager.modals.patchNotes.states.loading.message')}</span>
                <Spinner/>
            </div>
        {:then notes}
            <div class="flex flex-col items-center space-y-6 max-h-[60vh] overflow-y-auto px-1">
                {#each notes as note}
                    <div class="sv-tile flex flex-col space-y-2 rounded-lg p-4 w-2/3 bg-[#f3e2b3]/70">
                        <span class="text-lg self-center text-[#6a3b18]" style="text-shadow: 1px 1px 0 rgba(255,247,214,0.6);">
                            {note.date}
                        </span>
                        <div class="text-[#4a3016] text-sm whitespace-pre-wrap">
                            {note.content}
                        </div>
                    </div>
                {:else}
                    <div class="sv-tile flex flex-col space-y-2 rounded-lg p-4 w-2/3 bg-[#f3e2b3]/70">
                        <span class="text-lg self-center text-[#6a3b18]">
                            {locale.t('pages.villager.modals.patchNotes.states.empty.message')}
                        </span>
                    </div>
                {/each}
            </div>
        {:catch error}
            <div class="flex flex-col items-center justify-center space-y-2 min-h-[200px]">
                <span class="text-[#a83232] text-lg">        {locale.t('pages.villager.modals.patchNotes.states.error.title')}</span>
                <span class="text-[#7a5a34] text-sm"> {locale.t('pages.villager.modals.patchNotes.states.error.message', {
                    error: error.message
                })}</span>
            </div>
        {/await}
    {/snippet}
</StylizedModal>