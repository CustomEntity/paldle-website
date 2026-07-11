<!-- ClassicGrid.svelte — attribute comparison grid for the Classic mode. -->
<script lang="ts">
    import { onMount, tick } from "svelte";
    import locale from "$lib/stores/locale.svelte";
    import { palImg, elemIcon, workIcon } from "$lib/media";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { useClassicGameData } from "$lib/stores/palGameData.svelte";
    import {
        compareNumber,
        compareOrdinal,
        compareEquality,
        compareSet,
        statusColor,
        elementColor,
        workColor,
        palTint,
        SIZE_ORDER,
        type Status,
    } from "$lib/pal";

    interface Props {
        pals: Pal[];
        daily: Pal;
    }
    const { pals, daily }: Props = $props();
    const gameData = useClassicGameData();

    // column order drives both the header row and the per-cell reveal animation
    const COLUMNS = ["pal", "paldeck", "elements", "rarity", "size", "work", "mount", "nocturnal"];
    const GRID_TEMPLATE = "66px 68px 88px 66px 66px 112px 96px 76px";

    let animations: Record<number, number> = $state({});
    let initialCount = $state(-1);

    onMount(() => {
        attempts.forEach((a) => (animations[a.pal.id] = COLUMNS.length));
        initialCount = attempts.length;
    });

    function diff(g: Pal): Record<string, Status> {
        return {
            paldeck: compareNumber(g.paldeck_num, daily.paldeck_num),
            elements: compareSet(g.elements, daily.elements),
            rarity: compareNumber(g.rarity, daily.rarity),
            size: compareOrdinal(g.size, daily.size, SIZE_ORDER),
            work: compareSet(g.work_keys, daily.work_keys),
            mount: compareEquality(g.mount, daily.mount),
            nocturnal: compareEquality(g.nocturnal, daily.nocturnal),
        };
    }

    const attempts = $derived(
        gameData.tries
            .map((id) => pals.find((p) => p.id === id))
            .filter((p): p is Pal => !!p)
            .map((pal) => ({ pal, differences: diff(pal) })),
    );

    $effect(() => {
        if (initialCount === -1) return;
        if (attempts.length > initialCount) {
            attempts.slice(initialCount).forEach((a) => reveal(a.pal.id));
            initialCount = attempts.length;
        }
    });

    async function reveal(palId: number) {
        animations[palId] = 0;
        await tick();
        const squares = document.getElementsByClassName(`sq-${palId}`);
        for (let i = 0; i < squares.length; i++) {
            setTimeout(() => {
                (squares[i] as HTMLElement).classList.add("animate__animated", "animate__flipInY");
                animations[palId]++;
            }, i * 550);
        }
    }

    const shown = (palId: number, colIndex: number) =>
        animations[palId] === undefined || animations[palId] >= colIndex;

    // translate an enum value via pages.classic.attributes.<group>.<slug>, fall back to raw
    function tr(group: string, value: string | null): string {
        if (value == null || value === "") return "-";
        const key = `pages.classic.attributes.${group}.${value.replace(/\s+/g, "")}`;
        const out = locale.t(key as any);
        return out === key ? value : out;
    }
    const trNoct = (v: boolean) => tr("nocturnal", v ? "yes" : "no");
</script>

<div class="clue-container w-full">
    <div class="mx-auto grid gap-x-1.5 gap-y-2 py-2 md:p-2" style="grid-template-columns: {GRID_TEMPLATE};">
        {#each COLUMNS as h}
            <div class="min-h-9 flex items-center justify-center px-0.5">
                <span class="text-xs md:text-sm leading-[1.05] text-center pal-title">
                    {locale.t(`pages.classic.attributes.headers.${h}` as any)}
                </span>
            </div>
        {/each}

        {#each attempts.slice().reverse() as { pal, differences } (pal.id)}
            <!-- Pal icon -->
            <div class="h-18 w-full pal-slot flex items-center justify-center" style="--tint: {palTint(pal)};">
                <img src={palImg(pal.icon)} alt={pal.name} class="w-full h-full object-contain p-1" />
            </div>

            <!-- Paldeck # -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex items-center justify-center arrow-container"
                 class:arrow-up={differences.paldeck === "HIGHER"} class:arrow-down={differences.paldeck === "LOWER"}
                 style="--status: {statusColor(differences.paldeck)}; visibility: {shown(pal.id, 1) ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-lg pal-title pal-num">{pal.paldeck}</span>
            </div>

            <!-- Elements -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex flex-wrap items-center justify-center gap-0.5 p-1"
                 style="--status: {statusColor(differences.elements)}; visibility: {shown(pal.id, 2) ? 'visible' : 'hidden'};">
                {#each pal.elements as el}
                    <Tooltip text={tr("elements", el)} position="top">
                        <span class="el-badge" style="--el: {elementColor(el)};">
                            <img src={elemIcon(el)} alt={el} />
                        </span>
                    </Tooltip>
                {/each}
            </div>

            <!-- Rarity -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex items-center justify-center arrow-container"
                 class:arrow-up={differences.rarity === "HIGHER"} class:arrow-down={differences.rarity === "LOWER"}
                 style="--status: {statusColor(differences.rarity)}; visibility: {shown(pal.id, 3) ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-lg pal-title pal-num">{pal.rarity}</span>
            </div>

            <!-- Size -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex items-center justify-center arrow-container"
                 class:arrow-up={differences.size === "HIGHER"} class:arrow-down={differences.size === "LOWER"}
                 style="--status: {statusColor(differences.size)}; visibility: {shown(pal.id, 4) ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-base pal-title">{tr("size", pal.size)}</span>
            </div>

            <!-- Work suitabilities — datamined Palworld work icons -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex flex-wrap items-center justify-center gap-0.5 p-1"
                 style="--status: {statusColor(differences.work)}; visibility: {shown(pal.id, 5) ? 'visible' : 'hidden'};">
                {#if pal.work_keys.length}
                    {#each pal.work_keys as w}
                        <Tooltip text={tr("work", w)} position="top">
                            <span class="work-tile" style="--wk: {workColor(w)};">
                                <img src={workIcon(w)} alt={tr("work", w)} />
                            </span>
                        </Tooltip>
                    {/each}
                {:else}
                    <span class="z-10 text-white text-base pal-title">-</span>
                {/if}
            </div>

            <!-- Mount -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex items-center justify-center"
                 style="--status: {statusColor(differences.mount)}; visibility: {shown(pal.id, 6) ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-sm text-center pal-title">{tr("mount", pal.mount)}</span>
            </div>

            <!-- Nocturnal -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex items-center justify-center"
                 style="--status: {statusColor(differences.nocturnal)}; visibility: {shown(pal.id, 7) ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-base pal-title">{trNoct(pal.nocturnal)}</span>
            </div>
        {/each}
    </div>
</div>

<style>
    @keyframes flipInY {
        from { transform: perspective(400px) rotate3d(0,1,0,90deg); animation-timing-function: ease-in; opacity: 0; }
        40% { transform: perspective(400px) rotate3d(0,1,0,-20deg); animation-timing-function: ease-in; }
        60% { transform: perspective(400px) rotate3d(0,1,0,10deg); opacity: 1; }
        80% { transform: perspective(400px) rotate3d(0,1,0,-5deg); }
        to { transform: perspective(400px); }
    }
    .animate__animated { animation-duration: 0.8s; animation-fill-mode: both; }
    .animate__flipInY { backface-visibility: visible !important; animation-name: flipInY; }
    /* horizontal scroll on narrow screens; vertical clipped so the flip animation doesn't
       spawn a scrollbar. Hover tooltips portal to <body>, so this no longer clips them. */
    .clue-container { overflow-x: auto; overflow-y: hidden; }
    @media (max-width: 768px) { .clue-container { max-width: 100%; } }
</style>
