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
