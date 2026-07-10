<script lang="ts">
    import { tick } from "svelte";
    import ExplanationBox from "$lib/components/ExplanationBox.svelte";
    import Spinner from "$lib/components/spinner/Spinner.svelte";
    import ShareContainer from "$lib/components/ShareContainer.svelte";
    import { WEBSITE_URL } from "$lib/constants";
    import { media } from "$lib/media";
    import VictoryContainer from "$lib/components/VictoryContainer.svelte";
    import HomeButton from "$lib/components/buttons/HomeButton.svelte";
    import StatsModal from "./(components)/StatsModal.svelte";
    import locale from "$lib/stores/locale.svelte";
    import { Confetti } from "svelte-confetti";
    import MarvelRivalsButton from "$lib/components/buttons/MarvelRivalsButton.svelte";
    import CropToolsBar from "./(components)/CropToolsBar.svelte";
    import { useCropGameData } from "$lib/stores/cropGameData.svelte";
    import AnswerInput from "$lib/components/AnswerInput.svelte";
    import CropGrid from "./(components)/CropGrid.svelte";
    import { notifyModeComplete } from "$lib/stores/alldle.svelte";

    const { data } = $props();
    const cropGameData = useCropGameData();
    let isWon = $state(false);
    let wonDivElement: HTMLDivElement | undefined = $state();
    let innerWidth = 0;

    const BG = "#e8d3a0";

    function getShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.crop.share.text", { id: gameId, tries: triesCount });
    }
    function getCopyShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.crop.share.to_copy", { id: gameId, tries: triesCount, url: "https://" + WEBSITE_URL });
    }

    async function handleSelect(cropName: string) {
        const [crops, daily] = await Promise.all([data?.crops, data?.daily]);
        if (!daily) return;
        const crop = crops.find((c) => c.name === cropName);
        if (!crop) return;
        cropGameData.addTry(crop.id);
        if (crop.id === daily.crop.id) {
            isWon = true;
            await tick();
            wonDivElement?.scrollIntoView({ behavior: "smooth" });
            cropGameData.win();
            notifyModeComplete("crop", { won: true, attempts: cropGameData.tries.length });
        }
    }

    data?.daily?.then((dailyGame) => {
        if (!dailyGame) return;
        if (dailyGame.game_id !== cropGameData.game) cropGameData.resetTries(dailyGame.game_id);
        if (cropGameData.tries.includes(dailyGame.crop.id)) isWon = true;
    });

    const compareNumber = (v: number, t: number) => (v === t ? "CORRECT" : v > t ? "LOWER" : "HIGHER");
    const compareSeasons = (a: string[], b: string[]) => {
        const sb = new Set(b);
        const inter = a.filter((s) => sb.has(s));
        if (a.length === b.length && inter.length === a.length) return "CORRECT";
        if (inter.length > 0) return "PARTIALLY-CORRECT";
        return "INCORRECT";
    };
</script>

<svelte:window bind:innerWidth />
{#if isWon}
    <div style="position:fixed;top:-50px;left:0;height:100vh;width:100vw;display:flex;justify-content:center;overflow:hidden;pointer-events:none;">
        <Confetti colorArray={['#5aa02f','#7bc74d','#ffd24a','#e6c485','#8a5a2b','#c9863c']} x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration={5000} amount={100} fallDistance="100vh"/>
    </div>
{/if}
<div class="flex flex-col items-center w-full gap-6">
    <CropToolsBar patchNotes={data.patchNotes} gameData={cropGameData.data} />

    {#await Promise.all([data?.crops, data?.daily])}
        <div class="flex justify-center w-full mt-8"><Spinner /></div>
    {:then [crops, daily]}
        <ExplanationBox title={locale.t("pages.crop.components.explanationBox.title")}>
            {#snippet content()}
                <div class="relative w-full text-center text-white">
                    <span class="uppercase text-2xl font-normal leading-none">
                        {locale.t("pages.crop.components.explanationBox.title")}
                    </span>
                    {#if cropGameData.tries.length === 0}
                        <span class="block mt-2 text-lg text-white/70">
                            {locale.t("pages.crop.components.explanationBox.bottomHint")}
                        </span>
                    {/if}
                </div>
            {/snippet}
        </ExplanationBox>
    {:catch error}
        <p class="text-[#e6cc8f] text-lg font-poppins tracking-wide">
            {locale.t("pages.crop.errors.generic_error", { message: error.message })}
        </p>
    {/await}

    <div class="flex flex-col items-center w-full md:max-w-[600px]">
        {#await Promise.all( [data?.crops, data?.daily, data?.yesterday], ) then [crops, daily, yesterdayCrop]}
            {#if !daily}
                <p class="text-white text-lg font-poppins tracking-wide">
                    {locale.t("pages.crop.errors.no_daily_brawler")}
                </p>
            {:else}
                <div class="flex flex-col items-center w-full gap-4">
                    {#if !isWon}
                        <AnswerInput
                            id="answerInput"
                            filter={(option, searchTerm) =>
                                option.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                !cropGameData.tries.includes(crops.find((c) => c.name === option)?.id)}
                            options={crops?.map((c) => c.name)}
                            placeholder={locale.t("pages.crop.components.answerInput.placeholder")}
                            onselect={handleSelect}
                        >
                            {#snippet item(option)}
                                {@const crop = crops.find((c) => c.name === option)}
                                <span class="flex items-center gap-2">
                                    <img src={media(`/crops/${crop?.key}.png`)} alt={option}
                                         style="background-color: {BG}; image-rendering: pixelated;"
                                         class="size-10 object-contain p-1"/>
                                    {option}
                                </span>
                            {/snippet}
                        </AnswerInput>
                    {/if}

                    <div class="flex flex-col items-center w-full gap-4">
                        <CropGrid {crops} dailyCrop={daily.crop} />
                        {#if innerWidth <= 768}
                            <p class="text-gray-300">{locale.t("pages.crop.scroll_hint")}</p>
                        {/if}
                    </div>
                </div>
                {#if isWon}
                    <div class="flex flex-col items-center w-full gap-10">
                        <VictoryContainer
                            class="w-full mt-8"
                            name={daily.crop.name}
                            imageUrl={media(`/crops/${daily.crop.key}.png`)}
                            imageAlt={daily.crop.name}
                            triesCount={cropGameData.tries.length}
                            bind:container={wonDivElement}
                        >
                            {#snippet statsButton()}
                                <StatsModal stats={cropGameData.data.stats}>
                                    {#snippet button(toggleModal)}
                                        <MarvelRivalsButton slant="none" onClick={toggleModal} width="150px" height="49px"
                                            title={locale.t("pages.crop.victory.stats_button")}></MarvelRivalsButton>
                                    {/snippet}
                                </StatsModal>
                            {/snippet}
                            {#snippet nextMode()}
                                <HomeButton
                                    class="w-full max-w-[380px] h-[96px] mt-1"
                                    title={locale.t("pages.home.button.fish.title")}
                                    subtitle={locale.t("pages.home.button.fish.description")}
                                    gameMode="fish"
                                    href="/fish"/>
                            {/snippet}
                        </VictoryContainer>
                        <ShareContainer
                            copyText={getCopyShareText(daily.game_id, cropGameData.tries.length)}
                            class="w-full"
                            text={getShareText(daily.game_id, cropGameData.tries.length)}
                            websiteUrl={WEBSITE_URL}
                            tries={cropGameData.tries
                                .map((tryId) => {
                                    const crop = crops.find((c) => c.id === tryId);
                                    if (!crop) return null;
                                    return {
                                        growth: compareNumber(crop.growth, daily.crop.growth),
                                        price: compareNumber(crop.price, daily.crop.price),
                                        regrow: crop.regrow === daily.crop.regrow ? "CORRECT" : "INCORRECT",
                                        type: crop.type === daily.crop.type ? "CORRECT" : "INCORRECT",
                                        season: compareSeasons(crop.seasons, daily.crop.seasons),
                                    };
                                })
                                .filter(Boolean)}
                        />
                    </div>
                {/if}
                {#if yesterdayCrop}
                    {@const formattedText = locale.t("pages.crop.yesterday", { prefix: "", gameId: yesterdayCrop.game_id, brawlerName: yesterdayCrop.name })}
                    <span class="flex gap-2 text-xl mt-6 stardew-text">
                        {@html formattedText
                            .replace(/<name>(.*?)<\/name>/g, '<span class="text-xl stardew-text text-[#6cae3f]!">$1</span>')
                            .replace(/^(.*?)(?=<span|$)/, '<span class="text-white">$1</span>')}
                    </span>
                {/if}
            {/if}
        {/await}
    </div>
</div>
