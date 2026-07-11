<!-- Past guesses for the Description / Silhouette / Sound modes: status-coloured rows
     (green = correct, red = wrong), matching the Classic grid's colour language. -->
<script lang="ts">
    import { palImg } from "$lib/media";
    import { palTint } from "$lib/pal";

    interface Props {
        guesses: Pal[];
        answerId: number;
    }
    const { guesses, answerId }: Props = $props();
</script>

<div class="flex flex-col-reverse gap-2 w-full max-w-[440px]">
    {#each guesses as pal (pal.id)}
        {@const correct = pal.id === answerId}
        <div class="guess-row flex items-center gap-3 px-3 py-2 w-full"
             style="--status: {correct ? 'var(--ok)' : 'var(--no)'}; animation: flipInY 0.6s both;">
            <span class="pal-slot flex-shrink-0 w-12 h-12 flex items-center justify-center" style="--tint: {palTint(pal)};">
                <img src={palImg(pal.icon)} alt={pal.name} class="w-full h-full object-contain p-0.5" />
            </span>
            <span class="pal-title text-lg flex-grow text-left">{pal.name}</span>
            <span class="guess-mark flex-shrink-0" style="color: var(--status);">
                {correct ? "✓" : "✗"}
            </span>
        </div>
    {/each}
</div>

<style>
    .guess-row {
        position: relative;
        border-radius: 12px;
        background: linear-gradient(90deg,
            color-mix(in srgb, var(--status) 20%, rgba(9, 22, 38, 0.94)),
            rgba(9, 22, 38, 0.94) 62%);
        border: 1.5px solid color-mix(in srgb, var(--status) 50%, rgba(255, 255, 255, 0.06));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 4px 12px rgba(3, 12, 24, 0.4);
    }
    .guess-mark {
        font-size: 22px;
        font-weight: 800;
        line-height: 1;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.55));
    }
    @keyframes flipInY {
        from { transform: perspective(400px) rotate3d(0,1,0,90deg); opacity: 0; }
        60% { transform: perspective(400px) rotate3d(0,1,0,10deg); opacity: 1; }
        to { transform: perspective(400px); }
    }
</style>
