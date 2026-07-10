<script lang="ts">
    import Separator from "$lib/components/Separator.svelte";
    import Timer from "$lib/components/Timer.svelte";
    import MainButton from "$lib/components/buttons/MainButton.svelte";
    import type {Snippet} from "svelte";
    import locale from "$lib/stores/locale.svelte";
    import ContentCard from "$lib/components/ContentCard.svelte";

    interface Props {
        name: string;
        triesCount: number;
        imageUrl?: string;
        imageAlt?: string;
        container?: HTMLDivElement;
        nextMode?: Snippet;
        statsButton?: Snippet;
        class?: string;
    }

    let {
        name,
        triesCount,
        imageUrl,
        imageAlt,
        container = $bindable(),
        nextMode,
        statsButton,
        class: clazz
    }: Props = $props();

    function formatVictoryText(text: string, values: Record<string, string>): string {
        text = text.replace(/<name>{([^}]+)}<\/name>/g, (_, value) => {
            return `<span class="highlight">${values.name || value}</span>`;
        });

        text = text.replace(/<tries>(.*?)<\/tries>/g, (_, content) => {
            const processedContent = content.replace(/{([^}]+)}/g, (__, key) => values[key] || key);
            return `<span class="highlight">${processedContent}</span>`;
        });

        return text;
    }
</script>


<div
        class="flex flex-col gap-2.5 w-full {clazz} max-w-[370px]">
    <div
            bind:this={container}
            class="sv-frame flex flex-col w-full justify-center items-center text-center justify-items-center py-4 px-6"
    >
            <span class="text-center text-white text-[32px] font-normal stardew-text">
                {@html formatVictoryText(locale.t('components.victoryContainer.congratulations'), {
                    name,
                    tries: triesCount.toString(),
                })}
            </span>
        {#if imageUrl}
            <div class="flex gap-3 justify-center items-center pt-3 pb-4 stardew-text">
                <img
                        src="{imageUrl}"
                        alt={imageAlt ?? locale.t('components.victoryContainer.image.alt')}
                        class="pixelated w-16 h-16"
                />
                <div class="flex flex-col text-left gap-1">
                    <span class="text-white text-lg leading-none">
                       {locale.t('components.victoryContainer.you_found')}
                    </span>
                    <span class="text-white text-xl font-bold leading-none">
                        {name}
                    </span>
                </div>
            </div>
        {/if}
        <div class="mb-3 stardew-text">
            <span class="text-center text-white text-xl font-normal">
                {locale.t('components.victoryContainer.number_of_tries', { count: triesCount })}
            </span>
        </div>

        {@render statsButton?.()}

        <div class="flex flex-col w-full items-center gap-1 stardew-text pb-2 pt-4">
                <span class="text-[#FFFFFFC9]">
                    {locale.t('components.victoryContainer.next.timer')}
                </span>
            <Timer/>
            {#if nextMode}
                <Separator class="w-[50%] h-[2px] bg-white mt-2 mb-0.5"/>
     <span class="text-center text-white text-xl font-normal">
        {locale.t('components.victoryContainer.next.mode')}
    </span>
                {@render nextMode?.()}
            {/if}
        </div>
    </div>
</div>
<style>

    .pixelated {
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-crisp-edges;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }

    .victory-text :global(.highlight) {
        font-family: var(--font-lilita), sans-serif;
        font-size: 28px;
        font-weight: 400;
        line-height: 28px;
        text-align: center;
        text-underline-position: from-font;
        text-decoration-skip-ink: none;
        color: #FFF548;
    }

</style>