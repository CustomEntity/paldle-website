<script lang="ts">
    import "../app.css";
    import Footer from "$lib/components/layout/Footer.svelte";
    import { page } from "$app/stores";
    import { derived } from "svelte/store";
    import { browser } from "$app/environment";
    import locale from "$lib/stores/locale.svelte";
    import Banner from "$lib/components/Banner.svelte";
    import SvBackground from "$lib/components/SvBackground.svelte";
    import TranslationApologyBanner from "$lib/components/TranslationApologyBanner.svelte";
    import { onMount } from "svelte";
    import { initAllDle } from "$lib/stores/alldle.svelte";
    import { SITE_ORIGIN } from "$lib/constants";

    let { children, data } = $props();
    const isHomePage = derived(page, ($page) => $page.route.id === "/");

    // Page-specific SEO, resolved in the active locale.
    const metaTitle = $derived(
        `${locale.t("layout.page_meta.site_name")} - ${
            $page.data.name
                ? locale.t(`pages.${$page.data.name}.page_meta.title` as any)
                : locale.t("layout.page_meta.base_title")
        }`,
    );
    const metaDescription = $derived(
        $page.data.name
            ? locale.t(`pages.${$page.data.name}.page_meta.description` as any)
            : locale.t("layout.page_meta.base_description"),
    );
    const canonical = $derived(
        SITE_ORIGIN +
            ($page.url.pathname === "/"
                ? "/"
                : $page.url.pathname.replace(/\/$/, "")),
    );

    onMount(() => {
        // Connect to AllDle SDK if running inside an AllDle iframe.
        // Silently no-ops when accessed directly (dev / standalone).
        //initAllDle();
    });

    const pageData = $page.data;
    if (pageData.t && pageData.locale) {
        locale.t = pageData.t;
        locale.locale = pageData.locale;
    }

    $effect(() => {
        const pageData = $page.data;
        if (pageData.t && pageData.locale) {
            locale.t = pageData.t;
            locale.locale = pageData.locale;
        }
    });

    $effect(() => {
        if (browser) {
            document.documentElement.lang = locale.locale;
        }
    });

</script>

<svelte:head>
    <title>{metaTitle}</title>
    <meta name="description" content={metaDescription} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={metaTitle} />
    <meta property="og:description" content={metaDescription} />
    <meta property="og:url" content={canonical} />
    <meta property="og:locale" content={locale.locale} />
    <meta name="twitter:title" content={metaTitle} />
    <meta name="twitter:description" content={metaDescription} />
</svelte:head>

<SvBackground />

<div class="min-h-screen flex flex-col">
    <header class="relative flex flex-col items-center pt-6 px-3">
        <div class="relative w-full flex items-center justify-center w-full">
            <a
                class="flex w-fit items-center justify-center block z-50 transform {$isHomePage
                    ? 'scale-100 hover:scale-110'
                    : 'scale-90 hover:scale-100'} transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 rounded-lg"
                aria-label={locale.t("layout.header.home_link")}
                href="/"
            >
                <img
                    src="/logo.png"
                    alt={locale.t("layout.header.logo_alt")}
                    class="w-[460px] max-w-[92vw] h-auto"
                    style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.45));"
                    fetchpriority="high"
                    decoding="async"
                />
            </a>
        </div>
    </header>
    <main class="flex-grow flex flex-col items-center mt-4 mb-4 w-full px-3">
        {@render children()}
    </main>

    <Footer koFi="https://ko-fi.com/customentity" />
</div>

<style>
    @keyframes scale {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    .scale-animation {
        animation: scale 2s infinite ease-in-out;
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .animate-slide-in-left {
        animation: slideInLeft 1s ease-out forwards;
    }

    .animate-slide-in-right {
        animation: slideInRight 1s ease-out forwards;
    }
</style>
