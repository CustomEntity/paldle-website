<script lang="ts">
    import { tick } from "svelte";
    import { Confetti } from "svelte-confetti";
    import locale from "$lib/stores/locale.svelte";
    import { WEBSITE_URL } from "$lib/constants";
    import { palImg } from "$lib/media";
    import { elementColor, palTint } from "$lib/pal";
    import { useDescriptionGameData } from "$lib/stores/palGameData.svelte";
    import { notifyModeComplete } from "$lib/stores/alldle.svelte";
    import Spinner from "$lib/components/spinner/Spinner.svelte";
    import AnswerInput from "$lib/components/AnswerInput.svelte";
    import VictoryContainer from "$lib/components/VictoryContainer.svelte";
    import ShareContainer from "$lib/components/ShareContainer.svelte";
    import MainButton from "$lib/components/buttons/PalButton.svelte";
    import HomeButton from "$lib/components/buttons/HomeButton.svelte";
    import PalToolsBar from "$lib/components/pal/PalToolsBar.svelte";
    import StatsModal from "$lib/components/pal/StatsModal.svelte";
    import GuessList from "$lib/components/pal/GuessList.svelte";

    const { data } = $props();
    const gameData = useDescriptionGameData();
    let isWon = $state(false);
    let wonEl: HTMLDivElement | undefined = $state();

    const shareText = (id: number, tries: number) => locale.t("pages.description.share.text", { id, tries });
    const copyText = (id: number, tries: number) =>
        locale.t("pages.description.share.to_copy", { id, tries, url: "https://" + WEBSITE_URL });

    // hide the answer's name if it appears verbatim in its own description
    function maskName(text: string, name: string): string {
        if (!text) return "";
        const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        return text.replace(re, "▓▓▓▓▓");
    }

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
            notifyModeComplete("description", { won: true, attempts: gameData.tries.length });
        }
    }

    data?.daily?.then((d) => {
        if (!d) return;
        if (d.game_id !== gameData.game) gameData.resetTries(d.game_id);
        if (gameData.tries.includes(d.pal.id)) isWon = true;
    });

    const guessedPals = (pals: Pal[]) =>
        gameData.tries.map((id) => pals.find((p) => p.id === id)).filter((p): p is Pal => !!p);

    // progressive hints unlocked by number of guesses
    const HINTS = [
        { after: 2, key: "elements" },
        { after: 4, key: "size" },
        { after: 6, key: "mount" },
    ];
</script>

{#if isWon}
    <div style="position:fixed;top:-50px;left:0;height:100vh;width:100vw;display:flex;justify-content:center;overflow:hidden;pointer-events:none;">
        <Confetti colorArray={["#37d0e6","#57e0f0","#35c887","#f5c531","#ff6b3d","#9163d6"]}
            x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration={5000} amount={100} fallDistance="100vh" />
    </div>
{/if}

<div class="flex flex-col items-center w-full gap-6">
    <PalToolsBar mode="description" gameData={gameData.data} patchNotes={data.patchNotes} />

    <div class="flex flex-col items-center w-full md:max-w-[560px] gap-5">
        {#await Promise.all([data?.pals, data?.daily, data?.yesterday])}
            <div class="flex justify-center w-full mt-8"><Spinner /></div>
        {:then [pals, daily, yesterday]}
            {#if !daily}
                <p class="text-white text-lg">{locale.t("pages.description.errors.no_daily")}</p>
            {:else}
                <div class="pal-frame w-full p-6 flex flex-col gap-3 items-center text-center">
                    <span class="pal-title text-xl uppercase">{locale.t("pages.description.title")}</span>
                    <p class="text-white/90 text-lg leading-relaxed italic">"{maskName(daily.pal.description ?? "", daily.pal.name)}"</p>

                    {#if gameData.tries.length > 0 && !isWon}
                        <div class="flex flex-wrap gap-2 justify-center mt-2">
                            {#each HINTS as h}
                                {#if gameData.tries.length >= h.after}
                                    {#if h.key === "elements"}
                                        {#each daily.pal.elements as el}
                                            <span class="el-chip" style="background: {elementColor(el)};">{el}</span>
                                        {/each}
                                    {:else if h.key === "size"}
                                        <span class="el-chip" style="background:#37d0e6;">{locale.t("pages.description.hint.size", { size: daily.pal.size })}</span>
                                    {:else if h.key === "mount"}
                                        <span class="el-chip" style="background:#35c887;">{locale.t("pages.description.hint.mount", { mount: daily.pal.mount })}</span>
                                    {/if}
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </div>

                {#if !isWon}
                    <AnswerInput
                        id="answerInput"
                        filter={(option, term) =>
                            option.toLowerCase().includes(term.toLowerCase()) &&
                            !gameData.tries.includes(pals.find((p) => p.name === option)?.id ?? -1)}
                        options={pals?.map((p) => p.name)}
                        placeholder={locale.t("pages.description.placeholder")}
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

                <GuessList guesses={guessedPals(pals)} answerId={daily.pal.id} />

                {#if isWon}
                    <div class="flex flex-col items-center w-full gap-10" bind:this={wonEl}>
                        <VictoryContainer
                            class="w-full mt-6"
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
                                    title={locale.t("pages.home.button.silhouette.title")}
                                    subtitle={locale.t("pages.home.button.silhouette.description")}
                                    gameMode="silhouette" href="/silhouette" />
                            {/snippet}
                        </VictoryContainer>
                        <ShareContainer
                            class="w-full"
                            text={shareText(daily.game_id, gameData.tries.length)}
                            copyText={copyText(daily.game_id, gameData.tries.length)}
                            websiteUrl={WEBSITE_URL} />
                    </div>
                {/if}

                {#if yesterday}
                    <span class="flex gap-2 text-lg mt-6 pal-title text-white">
                        {@html locale.t("pages.description.yesterday", { gameId: yesterday.game_id, name: `<span style="color:#7fe3f2;font-weight:700">${yesterday.name}</span>` })}
                    </span>
                {/if}
            {/if}
        {/await}
    </div>
</div>
