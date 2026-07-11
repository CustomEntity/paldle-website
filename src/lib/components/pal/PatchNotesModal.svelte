<script lang="ts">
    import type { Snippet } from "svelte";
    import StylizedModal from "$lib/components/StylizedModal.svelte";
    import Spinner from "$lib/components/spinner/Spinner.svelte";
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        button: Snippet<[() => void]>;
        patchNotes?: Promise<PatchNote[]>;
    }

    const { button, patchNotes }: Props = $props();
    const notesPromise = patchNotes ?? Promise.resolve([] as PatchNote[]);
</script>

<StylizedModal>
    {#snippet trigger(toggleModal)}
        {@render button(toggleModal)}
    {/snippet}

    {#snippet title()}
        {locale.t("components.patchNotes.title")}
    {/snippet}

    {#snippet content()}
        {#await notesPromise}
            <div class="flex flex-col space-y-4 items-center justify-center min-h-[200px]">
                <span class="text-[#16324e] text-lg">{locale.t("components.patchNotes.loading")}</span>
                <Spinner />
            </div>
        {:then notes}
            <div class="flex flex-col items-center space-y-6 max-h-[60vh] overflow-y-auto px-1 py-2">
                {#each notes as note}
                    <div class="pal-tile flex flex-col space-y-2 p-4 w-full max-w-[420px] bg-white/70">
                        <span class="text-lg self-center text-[#0f7fa8] font-bold">{note.date}</span>
                        <div class="text-[#16324e] text-sm whitespace-pre-wrap">{note.content}</div>
                    </div>
                {:else}
                    <div class="pal-tile flex flex-col space-y-2 p-4 w-full max-w-[420px] bg-white/70">
                        <span class="text-lg self-center text-[#0f7fa8]">{locale.t("components.patchNotes.empty")}</span>
                    </div>
                {/each}
            </div>
        {:catch}
            <div class="flex flex-col items-center justify-center min-h-[200px]">
                <span class="text-[#c0392b] text-lg">{locale.t("components.patchNotes.error")}</span>
            </div>
        {/await}
    {/snippet}
</StylizedModal>
