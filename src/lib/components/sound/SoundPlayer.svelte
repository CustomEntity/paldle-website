<script lang="ts">
    // Pal-cry player for the Sound mode: a big circular button that plays the cry.
    // Auto-plays once on mount (best-effort; browsers may block autoplay), and each
    // click replays from the start. Purely presentational — no game state here.
    interface Props {
        src: string;
        accent?: string;
        label?: string;
    }
    let { src, accent = "#ff6b3d", label = "Play cry" }: Props = $props();

    let audio: HTMLAudioElement | undefined = $state();
    let playing = $state(false);

    function play() {
        if (!audio) return;
        audio.currentTime = 0;
        audio.play().catch(() => {}); // ignore autoplay-block rejections
    }

    // best-effort autoplay when the source is (re)assigned
    $effect(() => {
        if (src && audio) play();
    });
</script>

<audio
    bind:this={audio}
    {src}
    preload="auto"
    onplay={() => (playing = true)}
    onended={() => (playing = false)}
    onpause={() => (playing = false)}
></audio>

<button
    type="button"
    class="player"
    class:playing
    style="--accent: {accent};"
    aria-label={label}
    onclick={play}
>
    {#if playing}
        <span class="ring"></span>
        <span class="ring ring2"></span>
    {/if}
    <!-- speaker icon -->
    <svg viewBox="0 0 24 24" fill="none" stroke={accent} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={accent} />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
</button>

<style>
    .player {
        position: relative;
        width: 132px;
        height: 132px;
        border-radius: 50%;
        border: 3px solid var(--accent);
        background: rgba(8, 20, 36, 0.6);
        box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.12), 0 8px 24px rgba(3, 12, 24, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
    }
    .player:hover { transform: translateY(-2px); filter: brightness(1.08); box-shadow: 0 12px 30px rgba(3, 12, 24, 0.5), 0 0 0 3px var(--accent); }
    .player:active { transform: translateY(0); }
    .player svg { width: 56px; height: 56px; z-index: 1; }

    .ring {
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        border: 3px solid var(--accent);
        opacity: 0;
        animation: pulse 1.6s ease-out infinite;
    }
    .ring2 { animation-delay: 0.8s; }
    @keyframes pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.5); opacity: 0; }
    }
</style>
