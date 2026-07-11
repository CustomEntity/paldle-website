<!-- ClassicGrid.svelte — attribute comparison grid for the Classic mode. -->
<script lang="ts">
    import { onMount, tick } from "svelte";
    import locale from "$lib/stores/locale.svelte";
    import { palImg } from "$lib/media";
    import { useClassicGameData } from "$lib/stores/palGameData.svelte";
    import {
        compareNumber,
        compareOrdinal,
        compareEquality,
        compareSet,
        statusColor,
        elementColor,
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
    const GRID_TEMPLATE = "66px 74px 128px 76px 78px 150px 96px 86px";

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
        animations[palId] === undefined || animations[palId] > colIndex;

    // translate an enum value via pages.classic.attributes.<group>.<slug>, fall back to raw
    function tr(group: string, value: string | null): string {
        if (value == null || value === "") return "-";
        const key = `pages.classic.attributes.${group}.${value.replace(/\s+/g, "")}`;
        const out = locale.t(key as any);
        return out === key ? value : out;
    }
    const trNoct = (v: boolean) => tr("nocturnal", v ? "yes" : "no");
    const trWork = (keys: string[]) => (keys.length ? keys.map((k) => tr("work", k)).join(", ") : "-");
</script>

<div class="clue-container w-full overflow-x-auto overflow-y-hidden">
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
                <span class="z-10 text-white text-lg pal-title">{pal.paldeck}</span>
            </div>

            <!-- Elements -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex flex-wrap items-center justify-center gap-1 p-1"
                 style="--status: {statusColor(differences.elements)}; visibility: {shown(pal.id, 2) ? 'visible' : 'hidden'};">
                {#each pal.elements as el}
                    <span class="el-chip z-10" style="background: {elementColor(el)};">{tr("elements", el)}</span>
                {/each}
            </div>

            <!-- Rarity -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex items-center justify-center arrow-container"
                 class:arrow-up={differences.rarity === "HIGHER"} class:arrow-down={differences.rarity === "LOWER"}
                 style="--status: {statusColor(differences.rarity)}; visibility: {shown(pal.id, 3) ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-lg pal-title">{pal.rarity}</span>
            </div>

            <!-- Size -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex items-center justify-center arrow-container"
                 class:arrow-up={differences.size === "HIGHER"} class:arrow-down={differences.size === "LOWER"}
                 style="--status: {statusColor(differences.size)}; visibility: {shown(pal.id, 4) ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-base pal-title">{tr("size", pal.size)}</span>
            </div>

            <!-- Work suitabilities -->
            <div class="sq-{pal.id} h-18 w-full relative pal-cell flex items-center justify-center p-1"
                 style="--status: {statusColor(differences.work)}; visibility: {shown(pal.id, 5) ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-[11px] text-center leading-tight break-words pal-title">{trWork(pal.work_keys)}</span>
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
    @media (max-width: 768px) { .clue-container { max-width: 100%; overflow-x: auto; } }
</style>
