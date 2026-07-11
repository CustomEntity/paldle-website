<script lang="ts">
    import { goto } from "$app/navigation";

    interface Props {
        href: string;
        title: string;
        subtitle: string;
        gameMode: "classic" | "description" | "silhouette" | "sound";
        class?: string;
    }

    let {
        href = "",
        title = "CLASSIC",
        subtitle = "",
        gameMode = "classic",
        class: className = "w-full h-[120px]",
    }: Props = $props();

    const ACCENT: Record<string, string> = {
        classic: "#37d0e6",
        description: "#f5c531",
        silhouette: "#9163d6",
        sound: "#ff6b3d",
    };

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        goto(href, { replaceState: false });
    }
</script>

<a {href} onclick={handleClick} data-sveltekit-preload="hover" class="pal-panel mode-card {className}" style="--accent: {ACCENT[gameMode]};">
    <span class="icon" style="border-color: {ACCENT[gameMode]};">
        <!-- Palworld in-game UI glyph, tinted to the mode accent via CSS mask -->
        <span class="glyph" style="mask-image: url('/mode-icons/{gameMode}.png'); -webkit-mask-image: url('/mode-icons/{gameMode}.png');"></span>
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
        color: var(--ink);
        transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
        cursor: pointer;
    }
    .mode-card:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: 0 12px 30px rgba(3, 12, 24, 0.5), 0 0 0 2px var(--accent); }
    .mode-card:active { transform: translateY(0); }

    .icon {
        flex: 0 0 auto;
        width: 62px;
        height: 62px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        border: 2px solid;
        background: rgba(8, 20, 36, 0.6);
        box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.12);
    }
    .glyph {
        width: 34px;
        height: 34px;
        background-color: var(--accent);
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        -webkit-mask-size: contain;
        mask-size: contain;
    }

    .txt { display: flex; flex-direction: column; gap: 4px; text-align: left; }
    .title { font-family: var(--font-lilita), sans-serif; font-weight: 800; font-size: 22px; line-height: 1.05; color: #ffffff; }
    .sub { font-size: 15px; line-height: 1.2; color: rgba(220, 236, 250, 0.72); }

    @media (max-width: 828px) {
        .title { font-size: 19px; }
        .icon { width: 54px; height: 54px; }
        .glyph { width: 30px; height: 30px; }
    }
</style>
