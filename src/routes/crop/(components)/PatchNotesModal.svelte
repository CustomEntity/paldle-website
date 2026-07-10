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
        {locale.t('pages.crop.modals.patchNotes.title')}
    {/snippet}

    {#snippet content()}
        {#await patchNotes}
            <div class="flex flex-col space-y-4 items-center justify-center min-h-[200px]">
                <span class="text-white text-lg">{locale.t('pages.crop.modals.patchNotes.states.loading.message')}</span>
                <Spinner/>
            </div>
        {:then notes}
            <div class="flex flex-col items-center space-y-6 max-h-[60vh] overflow-y-auto px-1">
                {#each notes as note}
                    <div class="flex flex-col space-y-2 bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 w-2/3">
                        <span class="text-sm font-hylia-serif text-lg self-center text-[#e6cc8f]">
                            {note.date}
                        </span>
                        <div class="text-white text-sm whitespace-pre-wrap">
                            {note.content}
                        </div>
                    </div>
                {:else}
                    <div class="flex flex-col space-y-2 bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 w-2/3">
                        <span class="text-sm font-hylia-serif text-lg self-center text-[#e6cc8f]">
                            {locale.t('pages.crop.modals.patchNotes.states.empty.message')}
                        </span>
                    </div>
                {/each}
            </div>
        {:catch error}
            <div class="flex flex-col items-center justify-center space-y-2 min-h-[200px]">
                <span class="text-red-500 text-lg">        {locale.t('pages.crop.modals.patchNotes.states.error.title')}</span>
                <span class="text-gray-400 text-sm"> {locale.t('pages.crop.modals.patchNotes.states.error.message', {
                    error: error.message
                })}</span>
            </div>
        {/await}
    {/snippet}
</StylizedModal>