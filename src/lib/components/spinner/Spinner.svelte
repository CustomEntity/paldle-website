<script lang="ts">
    interface Props {
        size?: number;
    }
    let { size = 76 }: Props = $props();
</script>

<!-- Datamined Palworld "hold to act" ring (playring), tinted cyan, spinning as a loader. -->
<span class="pal-spinner" style="width: {size}px; height: {size}px" aria-label="loading" role="status"></span>

<style>
    .pal-spinner {
        display: inline-block;
        background-color: var(--accent, #45d6ea);
        -webkit-mask: url("/ui/da2/playring.webp") center / contain no-repeat;
        mask: url("/ui/da2/playring.webp") center / contain no-repeat;
        animation: pal-spin 0.9s linear infinite;
        filter: drop-shadow(0 0 7px rgba(69, 214, 234, 0.55));
        transform-origin: center;
    }
    @keyframes pal-spin {
        to { transform: rotate(360deg); }
    }
    @media (prefers-reduced-motion: reduce) {
        .pal-spinner { animation-duration: 2.4s; }
    }
</style>
