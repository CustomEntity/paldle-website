<script lang="ts">
    import { goto } from "$app/navigation";

    interface Props {
        href: string;
        title: string;
        subtitle: string;
        gameMode: "villager" | "crop" | "fish";
        class?: string;
    }

    let {
        href = "",
        title = "VILLAGER",
        subtitle = "",
        gameMode = "villager",
        class: className = "w-full h-[150px]",
    }: Props = $props();

    const ICONS: Record<string, string> = {
        villager: "/ui/icon-villager.png",
        crop: "/ui/icon-crop.png",
        fish: "/ui/icon-fish.png",
    };

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        goto(href, { replaceState: false });
    }
</script>

<a
    {href}
    onclick={handleClick}
    data-sveltekit-preload="hover"
    class="sv-panel mode-card {className}"
>
    <span class="icon">
        <img src={ICONS[gameMode] ?? ICONS.villager} alt="" />
    </span>
    <span class="txt">
        <span class="title">{title.toUpperCase()}</span>
        <span class="sub">{subtitle}</span>
    </span>
</a>

<style>
    .mode-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 6px 18px;
        text-decoration: none;
        color: #5a3a1c;
        transition: transform 0.15s ease, filter 0.15s ease;
        cursor: pointer;
    }
    .mode-card:hover { transform: translateY(-2px); filter: brightness(1.03); }
    .mode-card:active { transform: translateY(0); }

    /* Stardew inventory-slot icon box */
    .icon {
        flex: 0 0 auto;
        width: 62px;
        height: 62px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        border: 3px solid #4a3016;
        background: #efd9a8;
        box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.45), inset 0 -4px 0 rgba(0, 0, 0, 0.16);
        overflow: hidden;
    }
    .icon img {
        width: 46px;
        height: 46px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.28));
    }

    .txt { display: flex; flex-direction: column; gap: 4px; text-align: left; }
    .title {
        font-size: 26px;
        line-height: 1;
        color: #6a3b18;
        text-shadow: 1px 1px 0 rgba(255, 247, 214, 0.7);
    }
    .sub { font-size: 15px; line-height: 1.15; color: #7a5a34; }

    @media (max-width: 828px) {
        .title { font-size: 22px; }
        .icon { width: 54px; height: 54px; }
        .icon img { width: 40px; height: 40px; }
    }
</style>
