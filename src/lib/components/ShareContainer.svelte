    <!-- ShareContainer.svelte -->
    <script lang="ts">
        import ShareButton from "$lib/components/buttons/ShareButton.svelte";
        import TweetButton from "$lib/components/buttons/TweetButton.svelte";
        import locale from "$lib/stores/locale.svelte";
        import ContentCard from "$lib/components/ContentCard.svelte";
        import PalButton from "$lib/components/buttons/PalButton.svelte";

        interface Props {
            text: string;
            copyText: string;
            websiteUrl: string;
            class?: string;
            tries?: Record<string, string>[]
        }

        let {text, copyText, websiteUrl, class: clazz, tries}: Props = $props();

        const statusEmoji = (status: string): string =>
            status === 'CORRECT' ? '🟩'
            : status === 'HIGHER' ? '⬆️'
            : status === 'LOWER' ? '⬇️'
            : status === 'PARTIALLY-CORRECT' ? '🟧'
            : '🟥';

        // The emoji grid, in the order the guesses were made (one row per guess).
        function gridText(): string {
            if (!tries?.length) return '';
            return tries
                .map((attempt) => Object.values(attempt).map(statusEmoji).join(''))
                .join('\n');
        }

        // What actually gets copied / tweeted: the headline, the emoji grid, then
        // the URL. copyText already ends with "\n{url}", so splice the grid in just
        // before that final line.
        function shareableText(): string {
            const grid = gridText();
            if (!grid) return copyText;
            const cut = copyText.lastIndexOf('\n');
            return cut === -1
                ? `${copyText}\n\n${grid}`
                : `${copyText.slice(0, cut)}\n\n${grid}\n\n${copyText.slice(cut + 1)}`;
        }

        function getUrlFormattedText(): string {
            return shareableText().replace(/#/g, '%23').replace(/\n/g, '%0A');
        }
    </script>
    <div class="flex flex-col w-full max-w-[430px] mx-auto justify-center items-center gap-1 text-center justify-items-center py-4 px-6 pal-frame font-lilita"
    >
        <span class="text-xl text-white pal-title max-w-[250px]">{@html text}</span>
        {#if tries}
            <div class="mt-4">
                {#each [...tries].reverse().slice(0, 5) as attempt}
                    <p class="my-1 flex justify-center space-x-1">
                        {#each Object.values(attempt) as status}
                            <span>{statusEmoji(status)}</span>
                        {/each}
                    </p>
                {/each}
                {#if tries.length > 5}
                    <span class="text-xl text-white font-lilita">
                        {locale.t('components.shareContainer.and_more', { count: tries.length - 5 })}
                    </span>
                {/if}
            </div>
        {/if}
        <span class="text-2xl text-white pal-title">https://{websiteUrl}</span>
        <div class="flex flex-row flex-wrap gap-3 w-full justify-center mt-4 mb-4">
            <PalButton
                    slant="left"
                    width={'100%'}
                    class="max-w-[194px]"
                    title={locale.t('components.shareContainer.buttons.tweet.title')}
                    ariaLabel={locale.t('components.shareContainer.buttons.tweet.aria_label')}
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${getUrlFormattedText()}`, '_blank')}
            >
            </PalButton>
            <PalButton
                    slant="right"
                    width={'100%'}
                    class="max-w-[194px]"
                    height={'50'}
                    title={locale.t('components.shareContainer.buttons.copy.title')}
                    ariaLabel={locale.t('components.shareContainer.buttons.copy.aria_label')}
                    onClick={() => navigator.clipboard.writeText(shareableText())}
            >
            </PalButton>
        </div>
    </div>
