<!-- CropGrid.svelte -->
<script lang="ts">
    import { useCropGameData } from "$lib/stores/cropGameData.svelte";
    import { onMount, tick } from "svelte";
    import locale from "$lib/stores/locale.svelte";
    import { media } from "$lib/media";

    interface Props {
        dailyCrop: Crop;
        crops: Crop[];
    }

    const { dailyCrop, crops }: Props = $props();
    const cropGameData = useCropGameData();

    let animations: Record<string, number> = $state({});
    let initialAttemptsCount = $state(-1);

    onMount(() => {
        attempts.forEach((a) => (animations[a.crop.id] = 5));
        initialAttemptsCount = attempts.length;
    });

    const compareNumber = (value: number, target: number) => {
        if (value === target) return "CORRECT";
        return value > target ? "LOWER" : "HIGHER";
    };

    const compareSeasons = (a: string[], b: string[]) => {
        const sb = new Set(b);
        const inter = a.filter((s) => sb.has(s));
        if (a.length === b.length && inter.length === a.length) return "CORRECT";
        if (inter.length > 0) return "PARTIALLY-CORRECT";
        return "INCORRECT";
    };

    const attempts = $derived(
        cropGameData?.tries
            .map((tryId) => {
                const crop = crops.find((c) => c.id === tryId);
                if (!crop) return null;
                return {
                    crop,
                    differences: {
                        growth: compareNumber(crop.growth, dailyCrop.growth),
                        price: compareNumber(crop.price, dailyCrop.price),
                        regrow: crop.regrow === dailyCrop.regrow ? "CORRECT" : "INCORRECT",
                        type: crop.type === dailyCrop.type ? "CORRECT" : "INCORRECT",
                        season: compareSeasons(crop.seasons, dailyCrop.seasons),
                    },
                };
            })
            .filter(Boolean),
    );

    $effect(() => {
        const currentLength = attempts.length;
        if (initialAttemptsCount === -1) return;
        if (currentLength > initialAttemptsCount) {
            attempts.slice(initialAttemptsCount).forEach((a) => a && handleNewAttempt(a.crop.id));
            initialAttemptsCount = currentLength;
        }
    });

    async function handleNewAttempt(cropId: number) {
        animations[cropId] = 0;
        await tick();
        const squares = document.getElementsByClassName(`square-${cropId}`);
        for (let i = 0; i < squares.length; i++) {
            setTimeout(() => {
                (squares[i] as HTMLElement).classList.add("animate__animated", "animate__flipInY");
                animations[cropId]++;
            }, i * 700);
        }
    }

    const getBackgroundColor = (status: string) => {
        switch (status) {
            case "CORRECT": return "#32c21c";
            case "PARTIALLY-CORRECT": return "#E1812D";
            default: return "#d40c00";
        }
    };

    const translate = (group: string, value: string | null) => {
        if (!value) return "-";
        const key = `pages.crop.attributes.${group}.${value.replace(/\s+/g, "")}` as const;
        const t = locale.t(key as any);
        return t === key ? value : t;
    };

    const seasonsText = (seasons: string[]) =>
        seasons.map((s) => translate("season", s)).join(" / ") || "—";
</script>

<div class="clue-container w-full overflow-x-auto overflow-y-hidden">
    <div class="mx-auto grid gap-x-1.5 gap-y-2 py-2 md:p-2"
         style="grid-template-columns: 66px 82px 82px 82px 96px 116px;">
        <!-- Headers -->
        {#each ["crop", "growth", "price", "regrow", "type", "season"] as h}
            <div class="min-h-9 flex items-center justify-center px-0.5">
                <span class="text-xs md:text-sm leading-[1.05] text-center stardew-text">{locale.t(`pages.crop.attributes.headers.${h}` as any)}</span>
            </div>
        {/each}

        {#each attempts.slice().reverse() as attempt}
            <!-- Crop icon -->
            <div class="h-18 w-full sv-slot flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8));">
                <img src={media(`/crops/${attempt.crop.key}.png`)} alt={attempt.crop.name}
                     title={attempt.crop.name}
                     class="w-12 h-12 object-contain" style="image-rendering: pixelated;"/>
            </div>

            <!-- Growth -->
            <div class="square-{attempt.crop.id} h-18 w-full relative sv-cell flex items-center justify-center arrow-container"
                 class:arrow-up={attempt.differences.growth === 'HIGHER'} class:arrow-down={attempt.differences.growth === 'LOWER'}
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.growth)}; visibility: {animations[attempt.crop.id] === undefined || animations[attempt.crop.id] > 0 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-lg stardew-text">{attempt.crop.growth}d</span>
            </div>

            <!-- Price -->
            <div class="square-{attempt.crop.id} h-18 w-full relative sv-cell flex items-center justify-center arrow-container"
                 class:arrow-up={attempt.differences.price === 'HIGHER'} class:arrow-down={attempt.differences.price === 'LOWER'}
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.price)}; visibility: {animations[attempt.crop.id] === undefined || animations[attempt.crop.id] > 1 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-sm stardew-text">{attempt.crop.price}g</span>
            </div>

            <!-- Regrow -->
            <div class="square-{attempt.crop.id} h-18 w-full relative sv-cell flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.regrow)}; visibility: {animations[attempt.crop.id] === undefined || animations[attempt.crop.id] > 2 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-sm stardew-text px-1 text-center">{translate('regrow', attempt.crop.regrow ? 'yes' : 'no')}</span>
            </div>

            <!-- Type -->
            <div class="square-{attempt.crop.id} h-18 w-full relative sv-cell flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.type)}; visibility: {animations[attempt.crop.id] === undefined || animations[attempt.crop.id] > 3 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-xs stardew-text px-1 text-center break-words">{translate('type', attempt.crop.type)}</span>
            </div>

            <!-- Season -->
            <div class="square-{attempt.crop.id} h-18 w-full relative sv-cell flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.season)}; visibility: {animations[attempt.crop.id] === undefined || animations[attempt.crop.id] > 4 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-xs stardew-text px-1 text-center break-words leading-tight">{seasonsText(attempt.crop.seasons)}</span>
            </div>
        {/each}
    </div>
</div>

<style>
    .arrow-container { position: relative; }

    @keyframes flipInY {
        from { transform: perspective(400px) rotate3d(0,1,0,90deg); animation-timing-function: ease-in; opacity: 0; }
        40% { transform: perspective(400px) rotate3d(0,1,0,-20deg); animation-timing-function: ease-in; }
        60% { transform: perspective(400px) rotate3d(0,1,0,10deg); opacity: 1; }
        80% { transform: perspective(400px) rotate3d(0,1,0,-5deg); }
        to { transform: perspective(400px); }
    }
    .animate__animated { animation-duration: 1s; animation-fill-mode: both; }
    .animate__flipInY { backface-visibility: visible !important; animation-name: flipInY; }
</style>
