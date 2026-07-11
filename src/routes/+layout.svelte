<script lang="ts">
    import "../app.css";
    import Footer from "$lib/components/layout/Footer.svelte";
    import { page } from "$app/stores";
    import { derived } from "svelte/store";
    import { browser } from "$app/environment";
    import locale from "$lib/stores/locale.svelte";
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
        SITE_ORIGIN + ($page.url.pathname === "/" ? "/" : $page.url.pathname.replace(/\/$/, "")),
    );

    const pageData = $page.data;
    if (pageData.t && pageData.locale) {
        locale.t = pageData.t;
        locale.locale = pageData.locale;
    }

    $effect(() => {
        const pd = $page.data;
        if (pd.t && pd.locale) {
            locale.t = pd.t;
            locale.locale = pd.locale;
        }
    });

    $effect(() => {
        if (browser) document.documentElement.lang = locale.locale;
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

<div class="min-h-screen flex flex-col">
    <header class="relative flex flex-col items-center pt-6 px-3">
        <a
            class="wordmark-link {$isHomePage ? 'scale-100 hover:scale-105' : 'scale-90 hover:scale-100'} transition-transform duration-300 ease-in-out"
            aria-label={locale.t("layout.header.home_link")}
            href="/"
        >
            <span class="wordmark">PALDLE</span>
        </a>
    </header>
    <main class="flex-grow flex flex-col items-center mt-4 mb-4 w-full px-3">
        {@render children()}
    </main>

    <Footer koFi="https://ko-fi.com/customentity" />
</div>

<style>
    .wordmark-link {
        display: inline-block;
        text-decoration: none;
        outline: none;
    }
    .wordmark {
        font-family: var(--font-lilita), sans-serif;
        font-weight: 700;
        font-size: clamp(44px, 12vw, 82px);
        letter-spacing: 2px;
        line-height: 1;
        background: linear-gradient(180deg, #eafcff 0%, #7fe8ff 42%, #37d0e6 68%, #22a7d8 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-stroke: 3px #0a2740;
        paint-order: stroke fill;
        filter: drop-shadow(0 4px 0 rgba(6, 24, 44, 0.55)) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35));
    }
</style>
