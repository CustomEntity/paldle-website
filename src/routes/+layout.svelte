<script lang="ts">
    import "../app.css";
    import Footer from "$lib/components/layout/Footer.svelte";
    import { page } from "$app/stores";
    import { derived } from "svelte/store";
    import { browser } from "$app/environment";
    import locale from "$lib/stores/locale.svelte";
    import en from "$lib/i18n/locales/en.json";
    import { SITE_ORIGIN } from "$lib/constants";

    let { children, data } = $props();
    const isHomePage = derived(page, ($page) => $page.route.id === "/");

    // Sync English resolver over the statically-bundled strings (meta text has no
    // interpolation), used for the crawler/embed meta unless the visitor set a locale.
    const enT = (key: string): string => {
        let obj: any = en;
        for (const k of key.split(".")) {
            if (!obj || typeof obj !== "object") return key;
            obj = obj[k];
        }
        return typeof obj === "string" ? obj : key;
    };

    // The SSR meta (Discord/SEO embed) is resolved from PER-REQUEST load data — never
    // the shared `locale` store, whose module-level singleton leaks across concurrent
    // SSR requests and mislabels the embed's language. It also defaults to English
    // whenever the visitor has no explicit `locale` cookie: crawlers never send one, so
    // the shared embed is always English, regardless of Accept-Language.
    const metaT = $derived($page.data.chosenLocale ? ($page.data.t ?? enT) : enT);
    const metaLocale = $derived($page.data.chosenLocale ? ($page.data.locale ?? "en") : "en");

    const metaTitle = $derived(
        `${metaT("layout.page_meta.site_name")} - ${
            $page.data.name
                ? metaT(`pages.${$page.data.name}.page_meta.title`)
                : metaT("layout.page_meta.base_title")
        }`,
    );
    const metaDescription = $derived(
        $page.data.name
            ? metaT(`pages.${$page.data.name}.page_meta.description`)
            : metaT("layout.page_meta.base_description"),
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
    <meta property="og:locale" content={metaLocale} />
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
            <img class="logo" src="/logo.png" alt="Paldle" width="1480" height="520" />
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
    .logo {
        display: block;
        height: auto;
        width: clamp(220px, 60vw, 420px);
        filter: drop-shadow(0 4px 0 rgba(6, 24, 44, 0.55)) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35));
    }
</style>
