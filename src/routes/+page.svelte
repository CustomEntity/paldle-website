<script>
    import locale from "$lib/stores/locale.svelte";
    import HomeButton from "$lib/components/buttons/HomeButton.svelte";
</script>

<h2 class="text-white text-2xl text-center uppercase pal-title">
    {locale.t("pages.home.title")}
</h2>
<p class="text-center text-white/75 mt-2 max-w-[440px]">
    {locale.t("pages.home.subtitle")}
</p>

<div class="mt-6 w-full flex flex-col gap-4 max-w-[440px]">
    <HomeButton class="w-full h-[120px]"
        title={locale.t("pages.home.button.classic.title")}
        subtitle={locale.t("pages.home.button.classic.description")}
        gameMode="classic" href="/classic" />
    <HomeButton class="w-full h-[120px]"
        title={locale.t("pages.home.button.description.title")}
        subtitle={locale.t("pages.home.button.description.description")}
        gameMode="description" href="/description" />
    <HomeButton class="w-full h-[120px]"
        title={locale.t("pages.home.button.silhouette.title")}
        subtitle={locale.t("pages.home.button.silhouette.description")}
        gameMode="silhouette" href="/silhouette" />
    <HomeButton class="w-full h-[120px]"
        title={locale.t("pages.home.button.sound.title")}
        subtitle={locale.t("pages.home.button.sound.description")}
        gameMode="sound" href="/sound" />
</div>
