<script lang="ts">
    interface Props {
        size?: number;
    }
    let { size = 90 }: Props = $props();
</script>

<svg style="width: {size}px; height: {size}px" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="loading">
    <g class="rotating-star">
        <path d="M32 5 l7 16.2 17.6 1.5 -13.4 11.6 4.1 17.2 -15.3-9.3 -15.3 9.3 4.1-17.2 -13.4-11.6 17.6-1.5 z"
              fill="#ffcf3a" stroke="#2f2110" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="26" cy="24" r="3.5" fill="#fff6d0"/>
    </g>
</svg>

<style>
    .rotating-star {
        transform-origin: center;
        transform-box: fill-box;
        animation: rotate 2.4s linear infinite;
        filter: drop-shadow(0 3px 0 rgba(0, 0, 0, 0.3));
    }
    @keyframes rotate {
        to { transform: rotate(360deg); }
    }
</style>
