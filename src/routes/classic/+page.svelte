<script lang="ts">
    import { tick } from "svelte";
    import { Confetti } from "svelte-confetti";
    import locale from "$lib/stores/locale.svelte";
    import { WEBSITE_URL } from "$lib/constants";
    import { palImg } from "$lib/media";
    import {
        compareNumber, compareOrdinal, compareEquality, compareSet, palTint, SIZE_ORDER,
    } from "$lib/pal";
    import { useClassicGameData } from "$lib/stores/palGameData.svelte";
    import { notifyModeComplete } from "$lib/stores/alldle.svelte";
    import Spinner from "$lib/components/spinner/Spinner.svelte";
    import AnswerInput from "$lib/components/AnswerInput.svelte";
    import ExplanationBox from "$lib/components/ExplanationBox.svelte";
    import VictoryContainer from "$lib/components/VictoryContainer.svelte";
    import ShareContainer from "$lib/components/ShareContainer.svelte";
    import MainButton from "$lib/components/buttons/PalButton.svelte";
    import HomeButton from "$lib/components/buttons/HomeButton.svelte";
    import PalToolsBar from "$lib/components/pal/PalToolsBar.svelte";
    import StatsModal from "$lib/components/pal/StatsModal.svelte";
    import ClassicGrid from "./(components)/ClassicGrid.svelte";

    const { data } = $props();
    const gameData = useClassicGameData();
    let isWon = $state(false);
    let wonEl: HTMLDivElement | undefined = $state();

    const shareText = (id: number, tries: number) => locale.t("pages.classic.share.text", { id, tries });
    const copyText = (id: number, tries: number) =>
        locale.t("pages.classic.share.to_copy", { id, tries, url: "https://" + WEBSITE_URL });

    async function handleSelect(name: string) {
        const [pals, daily] = await Promise.all([data?.pals, data?.daily]);
        if (!daily) return;
        const pal = pals.find((p) => p.name === name);
        if (!pal) return;
        gameData.addTry(pal.id);
        if (pal.id === daily.pal.id) {
            isWon = true;
            await tick();
            wonEl?.scrollIntoView({ behavior: "smooth" });
            gameData.win();
            notifyModeComplete("classic", { won: true, attempts: gameData.tries.length });
        }
    }

    data?.daily?.then((d) => {
        if (!d) return;
        if (d.game_id !== gameData.game) gameData.resetTries(d.game_id);
        if (gameData.tries.includes(d.pal.id)) isWon = true;
    });

    function shareTries(pals: Pal[], daily: Pal) {
        return gameData.tries
            .map((id) => pals.find((p) => p.id === id))
            .filter((p): p is Pal => !!p)
            .map((p) => ({
                paldeck: compareNumber(p.paldeck_num, daily.paldeck_num),
                elements: compareSet(p.elements, daily.elements),
                rarity: compareNumber(p.rarity, daily.rarity),
                size: compareOrdinal(p.size, daily.size, SIZE_ORDER),
                work: compareSet(p.work_keys, daily.work_keys),
                mount: compareEquality(p.mount, daily.mount),
                nocturnal: compareEquality(p.nocturnal, daily.nocturnal),
            }));
    }
</script>

{#if isWon}
    <div style="position:fixed;top:-50px;left:0;height:100vh;width:100vw;display:flex;justify-content:center;overflow:hidden;pointer-events:none;">
        <Confetti colorArray={["#37d0e6","#57e0f0","#35c887","#f5c531","#ff6b3d","#9163d6"]}
            x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration={5000} amount={100} fallDistance="100vh" />
    </div>
{/if}

<div class="flex flex-col items-center w-full gap-6">
    <PalToolsBar mode="classic" gameData={gameData.data} patchNotes={data.patchNotes} />

    {#await Promise.all([data?.pals, data?.daily])}
        <div class="flex justify-center w-full mt-8"><Spinner /></div>
    {:then [pals, daily]}
        <ExplanationBox title={locale.t("pages.classic.explanation.title")}>
            {#snippet content()}
                <div class="relative w-full text-center text-white">
                    <span class="uppercase text-2xl font-normal leading-none">{locale.t("pages.classic.explanation.title")}</span>
                    <span class="block mt-2 text-lg text-white/70">{locale.t("pages.classic.explanation.hint")}</span>
                </div>
            {/snippet}
        </ExplanationBox>
    {:catch error}
        <p class="text-white text-lg">{locale.t("pages.classic.errors.generic", { message: error.message })}</p>
    {/await}

    <div class="flex flex-col items-center w-full md:max-w-[720px]">
        {#await Promise.all([data?.pals, data?.daily, data?.yesterday]) then [pals, daily, yesterday]}
            {#if !daily}
                <p class="text-white text-lg">{locale.t("pages.classic.errors.no_daily")}</p>
            {:else}
                <div class="flex flex-col items-center w-full gap-4">
                    {#if !isWon}
                        <AnswerInput
                            id="answerInput"
                            filter={(option, term) =>
                                option.toLowerCase().includes(term.toLowerCase()) &&
                                !gameData.tries.includes(pals.find((p) => p.name === option)?.id ?? -1)}
                            options={pals?.map((p) => p.name)}
                            placeholder={locale.t("pages.classic.placeholder")}
                            onselect={handleSelect}
                        >
                            {#snippet item(option)}
                                {@const pal = pals.find((p) => p.name === option)}
                                <span class="flex items-center gap-2">
                                    <span class="pal-slot w-10 h-10 flex items-center justify-center" style="--tint: {palTint(pal ?? { elements: [] })};">
                                        <img src={palImg(pal?.icon)} alt={option} class="w-9 h-9 object-contain" />
                                    </span>
                                    {option}
                                </span>
                            {/snippet}
                        </AnswerInput>
                    {/if}

                    <ClassicGrid {pals} daily={daily.pal} />
                </div>

                {#if isWon}
                    <div class="flex flex-col items-center w-full gap-10" bind:this={wonEl}>
                        <VictoryContainer
                            class="w-full mt-8"
                            name={daily.pal.name}
                            imageUrl={palImg(daily.pal.icon)}
                            imageAlt={daily.pal.name}
                            triesCount={gameData.tries.length}
                        >
                            {#snippet statsButton()}
                                <StatsModal stats={gameData.data.stats}>
                                    {#snippet button(toggle)}
                                        <MainButton onClick={toggle} width="160px" height="49px" title={locale.t("components.victoryContainer.stats_button")} />
                                    {/snippet}
                                </StatsModal>
                            {/snippet}
                            {#snippet nextMode()}
                                <HomeButton class="w-full max-w-[380px] h-[92px] mt-1"
                                    title={locale.t("pages.home.button.description.title")}
                                    subtitle={locale.t("pages.home.button.description.description")}
                                    gameMode="description" href="/description" />
                            {/snippet}
                        </VictoryContainer>
                        <ShareContainer
                            class="w-full"
                            text={shareText(daily.game_id, gameData.tries.length)}
                            copyText={copyText(daily.game_id, gameData.tries.length)}
                            websiteUrl={WEBSITE_URL}
                            tries={shareTries(pals, daily.pal)} />
                    </div>
                {/if}

                {#if yesterday}
                    <span class="flex gap-2 text-lg mt-6 pal-title text-white">
                        {locale.t("pages.classic.yesterday", { gameId: yesterday.game_id, name: yesterday.name })}
                    </span>
                {/if}
            {/if}
        {/await}
    </div>
</div>
