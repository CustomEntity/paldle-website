<script lang="ts">
    import {type Snippet, tick} from "svelte";
    import StylizedModal from "$lib/components/StylizedModal.svelte";
    import type {BaseGameStats} from "$lib/stores/baseGameData.svelte";
    import chartjs from 'chart.js/auto';
    import { onMount } from 'svelte';
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        button: Snippet<[() => void]>;
        stats: BaseGameStats;
    }

    let chartCanvas: HTMLCanvasElement;
    let chart: chartjs | null = null;

    const {button, stats}: Props = $props();

    function initChart() {
        if (!chartCanvas) return;

        const ctx = chartCanvas.getContext('2d');
        if (!ctx) return;

        if (chart) {
            chart.destroy();
        }

        chart = new chartjs(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(stats.tries_per_day || {}),
                datasets: [
                    {
                        label: locale.t('pages.crop.modals.stats.graph.label'),
                        data: Object.values(stats.tries_per_day || {}),
                        borderWidth: 2,
                        borderColor: '#e6cc8f',
                        backgroundColor: 'rgba(230, 204, 143, 0.1)',
                        pointBackgroundColor: '#e6cc8f',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    function handleModalOpen() {
        tick().then(() => {
            if (chartCanvas) {
                initChart();
            }
        });
    }

    function handleModalClose() {
        if (chart) {
            chart.destroy();
            chart = null;
        }
    }

    onMount(() => {
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    });
</script>

<StylizedModal
        onOpenChange={(e) => e ? handleModalOpen() : handleModalClose()}
>
    {#snippet trigger(toggleModal)}
        {@render button(toggleModal)}
    {/snippet}

    {#snippet title()}
        {locale.t('pages.crop.modals.stats.title')}
    {/snippet}

    {#snippet content()}
        <div class="h-full sm:mx-[25%] mt-4 space-y-4 text-white">
            <div class="space-y-4 flex flex-col items-center md:flex-row md:space-y-0 md:justify-center md:space-x-4">
                <div class="text-center">
                    <p class="text-2xl" aria-label={locale.t('pages.crop.modals.stats.metrics.games_won.aria_label')}>
                        {locale.t('pages.crop.modals.stats.metrics.games_won.label')}
                    </p>
                    <p class="text-5xl">{stats.wins}</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl" aria-label={locale.t('pages.crop.modals.stats.metrics.average_tries.aria_label')}>
                        {locale.t('pages.crop.modals.stats.metrics.average_tries.label')}
                    </p>
                    <p class="text-5xl">{stats.average_tries.toFixed(3)}</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl" aria-label={locale.t('pages.crop.modals.stats.metrics.one_shots.aria_label')}>
                        {locale.t('pages.crop.modals.stats.metrics.one_shots.label')}
                    </p>
                    <p class="text-5xl">{stats.one_shots}</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl" aria-label={locale.t('pages.crop.modals.stats.metrics.current_streak.aria_label')}>
                        {locale.t('pages.crop.modals.stats.metrics.current_streak.label')}
                    </p>
                    <p class="text-5xl">{stats.current_streak}</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl" aria-label={locale.t('pages.crop.modals.stats.metrics.best_streak.aria_label')}>
                        {locale.t('pages.crop.modals.stats.metrics.best_streak.label')}
                    </p>
                    <p class="text-5xl">{stats.best_streak}</p>
                </div>
            </div>
            <div class="relative w-full h-[300px]">
                <canvas
                        bind:this={chartCanvas}
                        id="statsChart"
                        style="position: absolute; left: 0; top: 0; width: 100%; height: 100%;"
                >
                    {locale.t('pages.crop.modals.stats.graph.fallback')}
                </canvas>
            </div>
            <p class="text-xl text-center">{locale.t('pages.crop.modals.stats.graph.title')}</p>
        </div>
    {/snippet}
</StylizedModal>