<script lang="ts">
    import { type Snippet, tick, onMount } from "svelte";
    import StylizedModal from "$lib/components/StylizedModal.svelte";
    import type { BaseGameStats } from "$lib/stores/baseGameData.svelte";
    import chartjs from "chart.js/auto";
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        button: Snippet<[() => void]>;
        stats: BaseGameStats;
    }

    let chartCanvas: HTMLCanvasElement;
    let chart: chartjs | null = null;
    const { button, stats }: Props = $props();

    const METRICS = [
        { key: "games_won", value: () => stats.wins },
        { key: "average_tries", value: () => stats.average_tries.toFixed(2) },
        { key: "one_shots", value: () => stats.one_shots },
        { key: "current_streak", value: () => stats.current_streak },
        { key: "best_streak", value: () => stats.best_streak },
    ];

    function initChart() {
        if (!chartCanvas) return;
        const ctx = chartCanvas.getContext("2d");
        if (!ctx) return;
        chart?.destroy();
        chart = new chartjs(ctx, {
            type: "line",
            data: {
                labels: Object.keys(stats.tries_per_day || {}),
                datasets: [
                    {
                        label: locale.t("components.stats.graph.label"),
                        data: Object.values(stats.tries_per_day || {}),
                        borderWidth: 2,
                        borderColor: "#22a7d8",
                        backgroundColor: "rgba(55, 208, 230, 0.16)",
                        pointBackgroundColor: "#0f7fa8",
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: "#9fc4e0" }, grid: { color: "rgba(150,200,230,0.14)" } },
                    x: { ticks: { color: "#9fc4e0" }, grid: { color: "rgba(150,200,230,0.14)" } },
                },
            },
        });
    }

    onMount(() => () => chart?.destroy());
</script>

<StylizedModal
    onOpenChange={(open) => (open ? tick().then(initChart) : (chart?.destroy(), (chart = null)))}
>
    {#snippet trigger(toggleModal)}
        {@render button(toggleModal)}
    {/snippet}

    {#snippet title()}
        {locale.t("components.stats.title")}
    {/snippet}

    {#snippet content()}
        <div class="h-full mt-4 space-y-4 text-[#dbeafe]">
            <div class="flex flex-wrap gap-4 justify-center">
                {#each METRICS as m}
                    <div class="text-center min-w-[90px]">
                        <p class="text-lg">{locale.t(`components.stats.metrics.${m.key}` as any)}</p>
                        <p class="text-4xl font-bold text-[#57e0f0]">{m.value()}</p>
                    </div>
                {/each}
            </div>
            <div class="relative w-full h-[280px]">
                <canvas bind:this={chartCanvas} style="position:absolute;inset:0;width:100%;height:100%;">
                    {locale.t("components.stats.graph.fallback")}
                </canvas>
            </div>
            <p class="text-lg text-center">{locale.t("components.stats.graph.title")}</p>
        </div>
    {/snippet}
</StylizedModal>
