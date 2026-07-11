<!-- Past guesses for the Description / Silhouette modes (icon + name + wrong marker). -->
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
        <div class="pal-frame flex items-center gap-3 px-3 py-2 w-full" style="animation: flipInY 0.6s both;">
            <span class="pal-slot flex-shrink-0 w-12 h-12 flex items-center justify-center" style="--tint: {palTint(pal)};">
                <img src={palImg(pal.icon)} alt={pal.name} class="w-full h-full object-contain p-0.5" />
            </span>
            <span class="pal-title text-lg flex-grow">{pal.name}</span>
            <span class="text-2xl flex-shrink-0" style="color: {correct ? 'var(--ok)' : 'var(--no)'};">
                {correct ? "✓" : "✗"}
            </span>
        </div>
    {/each}
</div>

<style>
    @keyframes flipInY {
        from { transform: perspective(400px) rotate3d(0,1,0,90deg); opacity: 0; }
        60% { transform: perspective(400px) rotate3d(0,1,0,10deg); opacity: 1; }
        to { transform: perspective(400px); }
    }
</style>
