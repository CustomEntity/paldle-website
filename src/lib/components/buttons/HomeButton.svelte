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
        {#if gameMode === "classic"}
            <!-- grid -->
            <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT[gameMode]} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        {:else if gameMode === "description"}
            <!-- text lines -->
            <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT[gameMode]} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 6h16M4 10h16M4 14h10M4 18h7" />
            </svg>
        {:else if gameMode === "silhouette"}
            <!-- silhouette / question -->
            <svg viewBox="0 0 24 24" fill={ACCENT[gameMode]} stroke="none">
                <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4 3 5.2 1 .8 1.5 1.4 1.6 2.3H14.4c.1-.9.6-1.5 1.6-2.3 1.5-1.2 3-2.7 3-5.2a7 7 0 0 0-7-7Z" opacity="0.85"/>
                <rect x="9" y="18.5" width="6" height="2.2" rx="1.1" />
            </svg>
        {:else}
            <!-- sound / speaker -->
            <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT[gameMode]} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={ACCENT[gameMode]} />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
        {/if}
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
    .icon svg { width: 34px; height: 34px; }

    .txt { display: flex; flex-direction: column; gap: 4px; text-align: left; }
    .title { font-family: var(--font-lilita), sans-serif; font-size: 26px; line-height: 1; color: #ffffff; }
    .sub { font-size: 15px; line-height: 1.2; color: rgba(220, 236, 250, 0.72); }

    @media (max-width: 828px) {
        .title { font-size: 22px; }
        .icon { width: 54px; height: 54px; }
        .icon svg { width: 30px; height: 30px; }
    }
</style>
