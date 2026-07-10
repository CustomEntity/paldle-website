<script lang="ts">
    import { browser } from "$app/environment";
    import xLogo from "$lib/assets/x-logo.webp";
    import redditLogo from "$lib/assets/reddit-logo.webp";
    import kofiLogo from "$lib/assets/kofi-logo.webp";
    import discordLogo from "$lib/assets/discord-logo.webp";
    import StylizedModal from "$lib/components/StylizedModal.svelte";
    import LanguagePicker from "$lib/components/LanguagePicker.svelte";
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        discord?: string;
        koFi?: string;
        x?: string;
        reddit?: string;
    }

    let { discord, koFi, x, reddit }: Props = $props();

    const currentYear = browser ? new Date().getFullYear() : 2024;
</script>

<footer class="flex flex-col justify-center items-center gap-4 mb-2 mt-2 px-3">
    <div class="flex flew-col gap-4 my-2">
        <LanguagePicker />
    </div>
    <div
        class="sv-frame font-lilita text-white relative flex flex-col p-6 gap-4 max-w-[450px]"
    >
        <div class="flex flex-col justify-center items-center">
            <p class="text-3xl text-center stardew-text">
                {locale.t("layout.footer.want_more.title")}
            </p>
            <p class="text-center text-white text-base font-lilita">
                {locale.t("layout.footer.want_more.description")}
            </p>
        </div>
        <div
            class="flex flex-row flex-wrap max-w-[450px] justify-center items-center gap-8"
        >
            <a
                href="https://alldle.net"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img class="h-12 w-12" src="alldle.svg" alt="Alldle logo" />
                <p class="text-white text-center font-lilita">Alldle</p>
            </a>
            <a
                href="https://cocdle.net"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img class="h-12 w-12" src="cocdle.webp" alt="Cocdle logo" />
                <p class="text-white text-center font-lilita">Cocdle</p>
            </a>
            <a
                href="https://www.fortnitedle.net"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img
                    class="h-12 w-12"
                    src="fortnitedle.png"
                    alt="Fortnitedle logo"
                />
                <p class="text-white text-center font-lilita">Fortnitedle</p>
            </a>
            <a
                href="https://overwatchdle.net"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img
                    class="h-12 w-12"
                    src="overwatchdle.png"
                    alt="Overwatchdle logo"
                />
                <p class="text-white text-center font-lilita">Overwatchdle</p>
            </a>
            <a
                href="https://www.rivalsdle.net"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img
                    class="h-12 w-12"
                    src="rivalsdle.png"
                    alt="Rivalsdle logo"
                />
                <p class="text-white text-center font-lilita">Rivalsdle</p>
            </a>
            <a
                href="https://royaledle.gg"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img
                    class="h-12 w-12"
                    src="royaledle.png"
                    alt="Royaledle logo"
                />
                <p class="text-white text-center font-lilita">Royaledle</p>
            </a>
            <a
                href="https://spiredle.net"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img
                    class="h-12 w-12"
                    src="spiredle.png"
                    alt="Spiredle logo"
                />
                <p class="text-white text-center font-lilita">Spiredle</p>
            </a>
            <a
                href="https://valodle.eu"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img
                    width="48"
                    height="48"
                    src="valodle.webp"
                    alt="Valodle logo"
                />
                <p class="text-white text-center font-lilita">Valodle</p>
            </a>
            <a
                href="https://www.zeldadle.net"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img class="h-12 w-auto object-contain" src="zeldadle.webp" alt="Zeldadle logo" />
                <p class="text-white text-center font-lilita">Zeldadle</p>
            </a>
            <a
                href="https://apexdle.gg"
                target="_blank"
                class="flex flex-col gap-1 justify-center items-center group hover:scale-105 transition-transform duration-300 text-center text-white hover:underline"
            >
                <img class="h-12 w-auto object-contain" src="apexdle.png" alt="Apexdle logo" />
                <p class="text-white text-center font-lilita">Apexdle</p>
            </a>
        </div>
    </div>
    <div class="flex flex-col justify-center items-center gap-3">
        <div class="flex gap-6 justify-center">
            {#if discord}
                <a
                    href={discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-link w-10 h-10 flex items-center justify-center"
                    aria-label={locale.t("layout.footer.accessibility.discord")}
                >
                    <img
                        src={discordLogo}
                        alt="Discord icon"
                        class="w-full h-full object-contain"
                        width="40"
                        height="40"
                        loading="eager"
                        decoding="async"
                    />
                </a>
            {/if}

            <StylizedModal>
                {#snippet trigger(toggleModal)}
                    <button
                        onclick={toggleModal}
                        type="button"
                        aria-label={locale.t(
                            "layout.footer.accessibility.information",
                        )}
                        class="social-link cursor-pointer"
                    >
                        <svg
                            fill="#6cae3f"
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 416.979 416.979"
                            aria-hidden="true"
                        >
                            <path
                                d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85 c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786 c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576 c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765 c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"
                            />
                        </svg>
                    </button>
                {/snippet}
                {#snippet title()}
                    {locale.t("layout.modals.about.title")}
                {/snippet}

                {#snippet content()}
                    <div class="flex flex-col gap-4">
                        <p>{locale.t("layout.modals.about.discover")}</p>
                        <p>{locale.t("layout.modals.about.disclaimer")}</p>

                        <p class="font-bold text-[#6a3b18]">
                            {locale.t("layout.modals.about.game_modes.title")}
                        </p>
                        <p>
                            {locale.t(
                                "layout.modals.about.game_modes.description",
                            )}
                        </p>

                        <p class="font-bold text-[#6a3b18]">
                            {locale.t("layout.modals.about.dle_games.title")}
                        </p>
                        <p>
                            {@html locale.t(
                                "layout.modals.about.dle_games.description",
                            )}
                        </p>

                        <p class="font-bold text-[#6a3b18]">
                            {locale.t("layout.modals.about.commitment.title")}
                        </p>
                        <p>
                            {locale.t(
                                "layout.modals.about.commitment.description",
                            )}
                        </p>

                        <p class="font-bold text-[#6a3b18]">
                            {locale.t("layout.modals.about.inspiration.title")}
                        </p>
                        <p>
                            {locale.t(
                                "layout.modals.about.inspiration.description",
                            )}
                        </p>

                        <p class="font-bold text-[#6a3b18]">
                            {locale.t("layout.modals.about.credit.title")}
                        </p>
                        <p>
                            {@html locale.t(
                                "layout.modals.about.credit.description",
                            )}
                        </p>

                        <p class="font-bold text-[#6a3b18]">
                            {locale.t("layout.modals.about.privacy.title")}
                        </p>
                        <p>
                            {@html locale.t(
                                "layout.modals.about.privacy.description",
                            )}
                        </p>

                        <p>{locale.t("layout.modals.about.thanks")}</p>

                        <p class="flex flex-col font-bold text-[#6a3b18]">
                            <span
                                >{locale.t(
                                    "layout.modals.about.signature.regards",
                                )}</span
                            >
                            <span
                                >{locale.t(
                                    "layout.modals.about.signature.team",
                                )}</span
                            >
                        </p>
                    </div>
                {/snippet}
            </StylizedModal>

            <a
                href={koFi}
                target="_blank"
                rel="noopener noreferrer"
                class="social-link w-10 h-10 flex items-center justify-center"
                aria-label={locale.t("layout.footer.accessibility.kofi")}
            >
                <img
                    src={kofiLogo}
                    alt="Ko-fi icon"
                    class="w-full h-full object-contain"
                    width="40"
                    height="40"
                    loading="eager"
                    decoding="async"
                />
            </a>
        </div>

        {#if x || reddit}
            <div class="flex gap-6 justify-center">
                {#if x}
                    <a
                        href={x}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-link w-8 h-8 flex items-center justify-center"
                        aria-label={locale.t("layout.footer.accessibility.x")}
                    >
                        <img
                            src={xLogo}
                            alt="X icon"
                            class="rounded-full w-full h-full object-contain"
                            width="32"
                            height="32"
                            loading="eager"
                            decoding="async"
                        />
                    </a>
                {/if}

                {#if reddit}
                    <a
                        href={reddit}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-link w-8 h-8 flex items-center justify-center"
                        aria-label={locale.t("layout.footer.accessibility.reddit")}
                    >
                        <img
                            src={redditLogo}
                            alt="Reddit icon"
                            class="w-full h-full object-contain"
                            width="32"
                            height="32"
                            loading="eager"
                            decoding="async"
                        />
                    </a>
                {/if}
            </div>
        {/if}

        <p class="text-center text-sm text-white uppercase stardew-text">
            {locale.t("layout.footer.copyright", { year: currentYear })}
        </p>
    </div>
</footer>

<style>
    .social-link {
        transform: scale(1);
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
    }

    .social-link:hover {
        transform: scale(1.2);
    }

    .social-link:focus-visible {
        outline: 2px solid #6cae3f;
        outline-offset: 2px;
        border-radius: 0.25rem;
    }

    @media (prefers-reduced-motion: reduce) {
        .social-link {
            transition: none;
        }
    }
</style>
