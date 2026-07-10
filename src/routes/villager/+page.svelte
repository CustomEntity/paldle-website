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
    import VillagerToolsBar from "./(components)/VillagerToolsBar.svelte";
    import { useVillagerGameData } from "$lib/stores/villagerGameData.svelte";
    import AnswerInput from "$lib/components/AnswerInput.svelte";
    import TriesGrid from "./(components)/TriesGrid.svelte";
    import { notifyModeComplete } from "$lib/stores/alldle.svelte";

    const { data } = $props();
    const villagerGameData = useVillagerGameData();
    let isWon = $state(false);
    let wonDivElement: HTMLDivElement | undefined = $state();
    let innerWidth = 0;

    // subtle per-region tint behind the portrait
    const regionColors: { [key: string]: string } = {
        Town: "#7cb342",
        Mountain: "#8d6e63",
        Forest: "#2e7d32",
        Beach: "#4fc3f7",
        Desert: "#fbc02d",
        Sewers: "#546e7a",
        "Ginger Island": "#26a69a",
    };
    const backgroundColor = (villager: Villager): string =>
        regionColors[villager?.region] || "#caa472";

    function getShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.villager.share.text", {
            id: gameId,
            tries: triesCount,
        });
    }

    function getCopyShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.villager.share.to_copy", {
            id: gameId,
            tries: triesCount,
            url: "https://" + WEBSITE_URL,
        });
    }

    // Handlers
    async function handleSelect(villagerName: string) {
        const [villagers, daily] = await Promise.all([
            data?.villagers,
            data?.daily,
        ]);
        if (!daily) {
            console.error("Daily villager not found");
            return;
        }

        const villager = villagers.find((v) => v.name === villagerName);
        if (!villager) {
            console.error("Villager not found");
            return;
        }

        villagerGameData.addTry(villager.id);

        if (villager.id === daily.villager.id) {
            isWon = true;
            await tick();
            wonDivElement?.scrollIntoView({ behavior: "smooth" });
            villagerGameData.win();
            notifyModeComplete("villager", {
                won: true,
                attempts: villagerGameData.tries.length,
            });
        }
    }

    // Initialisation
    data?.daily?.then((dailyGame) => {
        if (!dailyGame) {
            console.error("Daily villager not found");
            return;
        }

        if (dailyGame.game_id !== villagerGameData.game) {
            villagerGameData.resetTries(dailyGame.game_id);
        }

        // Check if already won
        if (villagerGameData.tries.includes(dailyGame.villager.id)) {
            isWon = true;
        }
    });

    // Age is ordinal: Child < Teen < Adult
    const ageOrder: Record<string, number> = { Child: 1, Teen: 2, Adult: 3 };

    const compareOrdinal = (
        value: string,
        target: string,
        orderMap: Record<string, number>,
    ) => {
        const valueOrder = orderMap[value] || 0;
        const targetOrder = orderMap[target] || 0;
        if (valueOrder === targetOrder) return "CORRECT";
        if (valueOrder < targetOrder) return "HIGHER";
        return "LOWER";
    };

    const compareNumber = (value: number, target: number) => {
        if (value === target) return "CORRECT";
        return value > target ? "LOWER" : "HIGHER";
    };

    // position a 16px item tile from the game's springobjects sheet (24 cols, 384x624)
    function giftIconStyle(idx: number, size = 36): string {
        const scale = size / 16;
        const col = idx % 24;
        const row = Math.floor(idx / 24);
        return (
            `width:${size}px;height:${size}px;flex:0 0 auto;` +
            `background-image:url('/ui/springobjects.png');` +
            `background-size:${384 * scale}px ${624 * scale}px;` +
            `background-position:-${col * size}px -${row * size}px;` +
            `image-rendering:pixelated;filter:drop-shadow(0 2px 0 rgba(0,0,0,0.35));`
        );
    }
</script>

<svelte:window bind:innerWidth />
{#if isWon}
    <div
        style="
position: fixed;
top: -50px;
left: 0;
height: 100vh;
width: 100vw;
display: flex;
justify-content: center;
overflow: hidden;
pointer-events: none;"
    >
        <Confetti colorArray={['#5aa02f','#7bc74d','#ffd24a','#e6c485','#8a5a2b','#c9863c']}
            x={[-5, 5]}
            y={[0, 0.1]}
            delay={[500, 2000]}
            infinite
            duration={5000}
            amount={100}
            fallDistance="100vh"
        />
    </div>
{/if}
<div class="flex flex-col items-center w-full gap-6">
    <VillagerToolsBar
        patchNotes={data.patchNotes}
        gameData={villagerGameData.data}
    />

    {#await Promise.all([data?.villagers, data?.daily])}
        <div class="flex justify-center w-full mt-8">
            <Spinner />
        </div>
    {:then [villagers, daily]}
        <ExplanationBox
            title={locale.t("pages.villager.components.explanationBox.title")}
            bottomHint={locale.t(
                "pages.villager.components.explanationBox.bottomHint",
            )}
        >
            {#snippet content()}
                <div class="relative w-full text-center text-white">
                    <span class="uppercase text-2xl font-normal leading-none">
                        {locale.t(
                            "pages.villager.components.explanationBox.title",
                        )}
                    </span>
                    {#if villagerGameData.tries.length === 0}
                        <span class="block mt-2 text-lg text-white/70">
                            {locale.t(
                                "pages.villager.components.explanationBox.bottomHint",
                            )}
                        </span>
                    {/if}
                    {#if villagerGameData.tries.length > 0}
                        <span class="block mt-4 text-lg">
                            {#if villagerGameData.tries.length >= 6 || isWon}
                                <span class="inline-flex items-center justify-center gap-2 text-[#e6cc8f]">
                                    {#if daily?.giftSprite != null}
                                        <span style={giftIconStyle(daily.giftSprite)}></span>
                                    {/if}
                                    {locale.t("pages.villager.gift_hint", {
                                        gift: daily?.giftHint,
                                    })}
                                </span>
                            {:else}
                                <span class="text-white/50">
                                    {locale.t("pages.villager.gift_hint_locked", {
                                        tries: 6 - villagerGameData.tries.length,
                                    })}
                                </span>
                            {/if}
                        </span>
                    {/if}
                </div>
            {/snippet}
        </ExplanationBox>
    {:catch error}
        <p class="text-[#e6cc8f] text-lg font-poppins tracking-wide">
            {locale.t("pages.villager.errors.generic_error", {
                message: error.message,
            })}
        </p>
    {/await}

    <div class="flex flex-col items-center w-full md:max-w-[660px]">
        {#await Promise.all( [data?.villagers, data?.daily, data?.yesterday], ) then [villagers, daily, yesterdayVillager]}
            {#if !daily}
                <p class="text-white text-lg font-poppins tracking-wide">
                    {locale.t("pages.villager.errors.no_daily_brawler")}
                </p>
            {:else}
                <div class="flex flex-col items-center w-full gap-4">
                    {#if !isWon}
                        <AnswerInput
                            id="answerInput"
                            filter={(option, searchTerm) =>
                                option
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()) &&
                                !villagerGameData.tries.includes(
                                    villagers.find((v) => v.name === option)?.id,
                                )}
                            options={villagers?.map((v) => v.name)}
                            placeholder={locale.t(
                                "pages.villager.components.answerInput.placeholder",
                            )}
                            onselect={handleSelect}
                        >
                            {#snippet item(option)}
                                {@const villager = villagers.find(
                                    (v) => v.name === option,
                                )}
                                <span class="flex items-center gap-2">
                                    <img
                                        src={media(villager?.portrait_url)}
                                        alt={option}
                                        style="background-color: {backgroundColor(
                                            villager,
                                        )};"
                                        class="size-10 object-cover"
                                    />
                                    {option}
                                </span>
                            {/snippet}
                        </AnswerInput>
                    {/if}

                    <div class="flex flex-col items-center w-full gap-4">
                        <TriesGrid {villagers} dailyVillager={daily.villager} />

                        {#if innerWidth <= 768}
                            <p class="text-gray-300">
                                {locale.t("pages.villager.scroll_hint")}
                            </p>
                        {/if}
                    </div>
                </div>
                {#if isWon}
                    <div class="flex flex-col items-center w-full gap-10">
                        <VictoryContainer
                            class="w-full mt-8"
                            name={daily.villager.name}
                            imageUrl={media(villagers.find(
                                (v) => v.id === daily.villager.id,
                            )?.portrait_url)}
                            imageAlt={daily.villager.name}
                            triesCount={villagerGameData.tries.length}
                            bind:container={wonDivElement}
                        >
                            {#snippet statsButton()}
                                <StatsModal stats={villagerGameData.data.stats}>
                                    {#snippet button(toggleModal)}
                                        <MarvelRivalsButton
                                            slant="none"
                                            onClick={toggleModal}
                                            width="150px"
                                            height="49px"
                                            title={locale.t(
                                                "pages.villager.victory.stats_button",
                                            )}
                                        ></MarvelRivalsButton>
                                    {/snippet}
                                </StatsModal>
                            {/snippet}
                            {#snippet nextMode()}
                                <HomeButton
                                    class="w-full max-w-[380px] h-[96px] mt-1"
                                    title={locale.t("pages.home.button.crop.title")}
                                    subtitle={locale.t("pages.home.button.crop.description")}
                                    gameMode="crop"
                                    href="/crop"/>
                            {/snippet}
                        </VictoryContainer>
                        <ShareContainer
                            copyText={getCopyShareText(
                                daily.game_id,
                                villagerGameData.tries.length,
                            )}
                            class="w-full"
                            text={getShareText(
                                daily.game_id,
                                villagerGameData.tries.length,
                            )}
                            websiteUrl={WEBSITE_URL}
                            tries={villagerGameData.tries
                                .map((tryId) => {
                                    const villager = villagers.find(
                                        (v) => v.id === tryId,
                                    );
                                    if (!villager) return null;

                                    return {
                                        gender:
                                            villager.gender ===
                                            daily.villager.gender
                                                ? "CORRECT"
                                                : "INCORRECT",
                                        region:
                                            villager.region ===
                                            daily.villager.region
                                                ? "CORRECT"
                                                : "INCORRECT",
                                        season:
                                            villager.birth_season ===
                                            daily.villager.birth_season
                                                ? "CORRECT"
                                                : "INCORRECT",
                                        birthday: compareNumber(
                                            villager.birth_day,
                                            daily.villager.birth_day,
                                        ),
                                        marriageable:
                                            villager.marriageable ===
                                            daily.villager.marriageable
                                                ? "CORRECT"
                                                : "INCORRECT",
                                        age: compareOrdinal(
                                            villager.age,
                                            daily.villager.age,
                                            ageOrder,
                                        ),
                                    };
                                })
                                .filter(Boolean)}
                        />
                    </div>
                {/if}
                {#if yesterdayVillager}
                    {@const formattedText = locale.t(
                        "pages.villager.yesterday",
                        {
                            prefix: "",
                            gameId: yesterdayVillager.game_id,
                            brawlerName: yesterdayVillager.name,
                        },
                    )}

                    <span class="flex gap-2 text-xl mt-6 stardew-text">
                        {@html formattedText
                            .replace(
                                /<name>(.*?)<\/name>/g,
                                '<span class="text-xl stardew-text text-[#6cae3f]!">$1</span>',
                            )
                            .replace(
                                /^(.*?)(?=<span|$)/,
                                '<span class="text-white">$1</span>',
                            )}
                    </span>
                {/if}
            {/if}
        {/await}
    </div>
</div>

<style>
    @keyframes gradientBorder {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
</style>
