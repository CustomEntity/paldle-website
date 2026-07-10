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
    import FishToolsBar from "./(components)/FishToolsBar.svelte";
    import { useFishGameData } from "$lib/stores/fishGameData.svelte";
    import AnswerInput from "$lib/components/AnswerInput.svelte";
    import FishGrid from "./(components)/FishGrid.svelte";
    import { notifyModeComplete } from "$lib/stores/alldle.svelte";

    const { data } = $props();
    const fishGameData = useFishGameData();
    let isWon = $state(false);
    let wonDivElement: HTMLDivElement | undefined = $state();
    let innerWidth = 0;

    const BG = "#a4c8e0";

    function getShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.fish.share.text", { id: gameId, tries: triesCount });
    }
    function getCopyShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.fish.share.to_copy", { id: gameId, tries: triesCount, url: "https://" + WEBSITE_URL });
    }

    async function handleSelect(fishName: string) {
        const [fish, daily] = await Promise.all([data?.fish, data?.daily]);
        if (!daily) return;
        const f = fish.find((x) => x.name === fishName);
        if (!f) return;
        fishGameData.addTry(f.id);
        if (f.id === daily.fish.id) {
            isWon = true;
            await tick();
            wonDivElement?.scrollIntoView({ behavior: "smooth" });
            fishGameData.win();
            notifyModeComplete("fish", { won: true, attempts: fishGameData.tries.length });
        }
    }

    data?.daily?.then((dailyGame) => {
        if (!dailyGame) return;
        if (dailyGame.game_id !== fishGameData.game) fishGameData.resetTries(dailyGame.game_id);
        if (fishGameData.tries.includes(dailyGame.fish.id)) isWon = true;
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
    <FishToolsBar patchNotes={data.patchNotes} gameData={fishGameData.data} />

    {#await Promise.all([data?.fish, data?.daily])}
        <div class="flex justify-center w-full mt-8"><Spinner /></div>
    {:then [fish, daily]}
        <ExplanationBox title={locale.t("pages.fish.components.explanationBox.title")}>
            {#snippet content()}
                <div class="relative w-full text-center text-white">
                    <span class="uppercase text-2xl font-normal leading-none">
                        {locale.t("pages.fish.components.explanationBox.title")}
                    </span>
                    {#if fishGameData.tries.length === 0}
                        <span class="block mt-2 text-lg text-white/70">
                            {locale.t("pages.fish.components.explanationBox.bottomHint")}
                        </span>
                    {/if}
                </div>
            {/snippet}
        </ExplanationBox>
    {:catch error}
        <p class="text-[#e6cc8f] text-lg font-poppins tracking-wide">
            {locale.t("pages.fish.errors.generic_error", { message: error.message })}
        </p>
    {/await}

    <div class="flex flex-col items-center w-full md:max-w-[600px]">
        {#await Promise.all( [data?.fish, data?.daily, data?.yesterday], ) then [fish, daily, yesterdayFish]}
            {#if !daily}
                <p class="text-white text-lg font-poppins tracking-wide">
                    {locale.t("pages.fish.errors.no_daily_brawler")}
                </p>
            {:else}
                <div class="flex flex-col items-center w-full gap-4">
                    {#if !isWon}
                        <AnswerInput
                            id="answerInput"
                            filter={(option, searchTerm) =>
                                option.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                !fishGameData.tries.includes(fish.find((x) => x.name === option)?.id)}
                            options={fish?.map((x) => x.name)}
                            placeholder={locale.t("pages.fish.components.answerInput.placeholder")}
                            onselect={handleSelect}
                        >
                            {#snippet item(option)}
                                {@const f = fish.find((x) => x.name === option)}
                                <span class="flex items-center gap-2">
                                    <img src={media(`/fish/${f?.key}.png`)} alt={option}
                                         style="background-color: {BG}; image-rendering: pixelated;"
                                         class="size-10 object-contain p-1"/>
                                    {option}
                                </span>
                            {/snippet}
                        </AnswerInput>
                    {/if}

                    <div class="flex flex-col items-center w-full gap-4">
                        <FishGrid {fish} dailyFish={daily.fish} />
                        {#if innerWidth <= 768}
                            <p class="text-gray-300">{locale.t("pages.fish.scroll_hint")}</p>
                        {/if}
                    </div>
                </div>
                {#if isWon}
                    <div class="flex flex-col items-center w-full gap-10">
                        <VictoryContainer
                            class="w-full mt-8"
                            name={daily.fish.name}
                            imageUrl={media(`/fish/${daily.fish.key}.png`)}
                            imageAlt={daily.fish.name}
                            triesCount={fishGameData.tries.length}
                            bind:container={wonDivElement}
                        >
                            {#snippet statsButton()}
                                <StatsModal stats={fishGameData.data.stats}>
                                    {#snippet button(toggleModal)}
                                        <MarvelRivalsButton slant="none" onClick={toggleModal} width="150px" height="49px"
                                            title={locale.t("pages.fish.victory.stats_button")}></MarvelRivalsButton>
                                    {/snippet}
                                </StatsModal>
                            {/snippet}
                            {#snippet nextMode()}
                                <HomeButton
                                    class="w-full max-w-[380px] h-[96px] mt-1"
                                    title={locale.t("pages.home.button.villager.title")}
                                    subtitle={locale.t("pages.home.button.villager.description")}
                                    gameMode="villager"
                                    href="/villager"/>
                            {/snippet}
                        </VictoryContainer>
                        <ShareContainer
                            copyText={getCopyShareText(daily.game_id, fishGameData.tries.length)}
                            class="w-full"
                            text={getShareText(daily.game_id, fishGameData.tries.length)}
                            websiteUrl={WEBSITE_URL}
                            tries={fishGameData.tries
                                .map((tryId) => {
                                    const f = fish.find((x) => x.id === tryId);
                                    if (!f) return null;
                                    return {
                                        difficulty: compareNumber(f.difficulty, daily.fish.difficulty),
                                        behavior: f.behavior === daily.fish.behavior ? "CORRECT" : "INCORRECT",
                                        season: compareSeasons(f.seasons, daily.fish.seasons),
                                        weather: f.weather === daily.fish.weather ? "CORRECT" : "INCORRECT",
                                        size: compareNumber(f.maxSize, daily.fish.maxSize),
                                    };
                                })
                                .filter(Boolean)}
                        />
                    </div>
                {/if}
                {#if yesterdayFish}
                    {@const formattedText = locale.t("pages.fish.yesterday", { prefix: "", gameId: yesterdayFish.game_id, brawlerName: yesterdayFish.name })}
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
