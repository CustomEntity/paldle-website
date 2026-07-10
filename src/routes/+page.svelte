<script>
    import locale from "$lib/stores/locale.svelte";
    import HomeButton from "$lib/components/buttons/HomeButton.svelte";
</script>


<h2 class="text-white text-2xl text-center uppercase stardew-text">
    { locale.t('pages.home.title')}
</h2>

<div class="mt-6 w-full flex flex-col gap-4 max-w-[440px]">
    <HomeButton
            class={'w-full h-[120px]'}
            title={ locale.t('pages.home.button.villager.title') }
            subtitle={ locale.t('pages.home.button.villager.description') }
            gameMode="villager"
            href="/villager"/>
    <HomeButton
            class={'w-full h-[120px]'}
            title={ locale.t('pages.home.button.crop.title') }
            subtitle={ locale.t('pages.home.button.crop.description') }
            gameMode="crop"
            href="/crop"/>
    <HomeButton
            class={'w-full h-[120px]'}
            title={ locale.t('pages.home.button.fish.title') }
            subtitle={ locale.t('pages.home.button.fish.description') }
            gameMode="fish"
            href="/fish"/>
</div>
